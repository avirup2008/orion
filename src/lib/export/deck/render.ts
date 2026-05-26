/**
 * Deck Composer — Render Orchestrator
 *
 * Main pipeline: DeckRequest → Claude Phase 1 (outline) → Claude Phase 2 (content)
 * → PptxGenJS rendering → .pptx buffer
 *
 * This runs server-side in a Next.js API route.
 */

import type {
  DeckRequest,
  DeckOutline,
  DeckContent,
  SlideContent,
  SlideBody,
  BrandConfig,
} from "./types";
import { getBrandConfig } from "./assets";
import { addFullChrome, addChrome } from "./chrome";
import { renderPattern } from "./patterns";
import { buildOutlinePrompt, buildContentPrompt } from "./prompts";
import { validateOutline, validateContent, extractJSON } from "./validation";

/* ── Claude API Call with Retry ─────────────────────────────────── */

const MAX_RETRIES = 1;
const RETRY_DELAY_MS = 1500;

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callClaude(
  system: string,
  user: string,
  apiKey: string,
  maxTokens: number = 8192,
  model: string = "claude-sonnet-4-6",
): Promise<string> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      // Haiku (outline) is fast → 45s timeout. Sonnet (content) → 50s.
      // Must leave ~10s headroom for Vercel function overhead (60s limit).
      const timeoutMs = model.includes("haiku") ? 45_000 : 50_000;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model,
          max_tokens: maxTokens,
          system,
          // Sonnet 4+ doesn't support assistant prefill; Haiku 4.5 does.
          // For models without prefill, rely on prompt instructions for JSON output.
          messages: model.includes("haiku")
            ? [
                { role: "user", content: user },
                { role: "assistant", content: "{" },
              ]
            : [{ role: "user", content: user }],
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      // Rate limit — wait and retry
      if (res.status === 429) {
        const retryAfter = res.headers.get("retry-after");
        const waitMs = retryAfter ? parseInt(retryAfter, 10) * 1000 : RETRY_DELAY_MS * (attempt + 1);
        console.warn(`Claude rate limited (429). Retrying in ${waitMs}ms (attempt ${attempt + 1}/${MAX_RETRIES + 1})`);
        if (attempt < MAX_RETRIES) {
          await sleep(waitMs);
          continue;
        }
        throw new Error("Rate limited by Claude API. Please try again in a few minutes.");
      }

      // Server errors — retry
      if (res.status >= 500 && attempt < MAX_RETRIES) {
        console.warn(`Claude server error ${res.status}. Retrying (attempt ${attempt + 1}/${MAX_RETRIES + 1})`);
        await sleep(RETRY_DELAY_MS * (attempt + 1));
        continue;
      }

      if (!res.ok) {
        const err = await res.text();
        if (res.status === 401) {
          throw new Error("Invalid API key. Check ANTHROPIC_API_KEY in Vercel environment variables.");
        }
        if (res.status === 400) {
          throw new Error(`Claude rejected the request: ${err.slice(0, 200)}`);
        }
        throw new Error(`Claude API error ${res.status}: ${err.slice(0, 200)}`);
      }

      const data = await res.json();
      const textBlock = data.content?.find(
        (b: { type: string }) => b.type === "text",
      );
      if (!textBlock?.text) {
        throw new Error("No text in Claude response");
      }
      // Prepend the "{" we used as prefill to get complete JSON (Haiku only)
      return model.includes("haiku") ? "{" + textBlock.text : textBlock.text;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));

      // Abort (our timeout) — don't retry, give clear message
      if (lastError.name === "AbortError" || lastError.message.includes("aborted")) {
        const limitSec = model.includes("haiku") ? 48 : 55;
        throw new Error(
          `Claude took too long to respond (>${limitSec}s). Try reducing slide count or simplifying input.`
        );
      }

      // Network errors — retry
      if (
        attempt < MAX_RETRIES &&
        (lastError.message.includes("fetch") ||
          lastError.message.includes("network") ||
          lastError.message.includes("ECONNRESET"))
      ) {
        console.warn(`Network error. Retrying (attempt ${attempt + 1}/${MAX_RETRIES + 1}): ${lastError.message}`);
        await sleep(RETRY_DELAY_MS * (attempt + 1));
        continue;
      }
      throw lastError;
    }
  }

  throw lastError || new Error("Claude API call failed after retries");
}

/* ── Phase 1: Generate Outline ──────────────────────────────────── */

export async function generateOutline(
  req: DeckRequest,
  apiKey: string,
): Promise<DeckOutline> {
  const { system, user } = buildOutlinePrompt(req);
  // Haiku for outline — faster, and outline is just structure (patterns,
  // sections, governing thoughts). Sonnet reserved for content where depth matters.
  // Token budget: 4096 base. With trimmed KB context + optional contentBrief,
  // this fits 18-slide outlines. Repair code handles edge truncation.
  // CONSTRAINT: must complete within 48s — 6144+ causes Haiku timeouts
  const outlineTokens = 4096;
  const raw = await callClaude(system, user, apiKey, outlineTokens, "claude-haiku-4-5-20251001");

  let parsed: unknown;
  try {
    parsed = extractJSON(raw);
  } catch (e) {
    throw new Error(`Failed to parse outline JSON: ${e}`);
  }

  const result = validateOutline(parsed);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    throw new Error(`Invalid outline structure: ${issues}`);
  }

  return result.data as DeckOutline;
}

/* ── Phase 2: Generate Content ──────────────────────────────────── */

/**
 * Generate content for a single batch of slides.
 * For large decks, the CLIENT calls this multiple times with different
 * outline subsets — each call stays under 60s.
 */
export async function generateContent(
  req: DeckRequest,
  outline: DeckOutline,
  apiKey: string,
): Promise<DeckContent> {
  const { system, user } = buildContentPrompt(req, outline);
  // Scale max_tokens to slide count — ~800 tokens per slide, min 2048
  // Complex patterns (comparison-matrix, gated-flow, architecture-flow) need 600-900 tokens each.
  // Previous budget of 500/slide caused truncation → malformed JSON.
  const slideCount = outline.sections.reduce((n, s) => n + s.slides.length, 0);
  const maxTokens = Math.min(8192, Math.max(2048, slideCount * 800));

  const raw = await callClaude(system, user, apiKey, maxTokens);

  let parsed: unknown;
  try {
    parsed = extractJSON(raw);
  } catch (e) {
    throw new Error(`Failed to parse content JSON: ${e}`);
  }

  const result = validateContent(parsed);
  if (!result.success) {
    logContentDiagnostics(parsed);
    const issues = result.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    throw new Error(`Invalid content structure: ${issues}`);
  }

  return result.data as DeckContent;
}

function logContentDiagnostics(parsed: unknown) {
  try {
    const slides = (parsed as Record<string, unknown>)?.slides;
    if (Array.isArray(slides)) {
      console.error("Slide bodies from AI:", slides.map((s: Record<string, unknown>, i: number) => {
        const body = s?.body as Record<string, unknown>;
        return `[${i}] pattern=${body?.pattern}, keys=${body ? Object.keys(body).join(",") : "null"}`;
      }).join(" | "));
    }
  } catch { /* diagnostic only */ }
}

/* ── Phase 3: Render PPTX ───────────────────────────────────────── */

export async function renderPptx(
  content: DeckContent,
  brand: BrandConfig,
): Promise<Buffer> {
  // Dynamic import — PptxGenJS is a CJS module
  const PptxGenJS = (await import("pptxgenjs")).default;
  const pptx = new PptxGenJS();

  // Configure presentation
  pptx.defineLayout({ name: "WIDE", width: 13.33, height: 7.5 });
  pptx.layout = "WIDE";
  pptx.author = "Orion by EyeOn";
  pptx.company = "EyeOn";
  pptx.subject = "Anaplan Implementation Proposal";

  // Inject section divider slides between sections
  const slidesWithDividers: SlideContent[] = [];
  let lastSection = "";
  let sectionIndex = 0;
  const uniqueSections = [...new Set(
    content.slides
      .filter((s) => s.body.pattern !== "cover")
      .map((s) => s.sectionLabel),
  )];
  const totalSections = uniqueSections.length;

  content.slides.forEach((sc) => {
    if (sc.sectionLabel !== lastSection && sc.body.pattern !== "cover") {
      sectionIndex++;
      // Insert section divider
      slidesWithDividers.push({
        id: `divider-${sectionIndex}`,
        sectionLabel: sc.sectionLabel,
        governingThought: "",
        subtitle: "",
        insightBar: { label: "", detail: "" },
        body: {
          pattern: "section-divider",
          sectionLabel: sc.sectionLabel,
          sectionNumber: sectionIndex,
          totalSections,
        } as SlideBody,
      });
      lastSection = sc.sectionLabel;
    }
    slidesWithDividers.push(sc);
  });

  // Render each slide
  slidesWithDividers.forEach((sc: SlideContent, i: number) => {
    const slide = pptx.addSlide();

    try {
      if (sc.body.pattern === "cover" || sc.body.pattern === "section-divider") {
        // Cover and section dividers render their own chrome
        renderPattern(slide, pptx, sc.body, brand);
      } else {
        // Full chrome + pattern
        addFullChrome(slide, pptx, brand, {
          pageNum: i + 1,
          sectionLabel: sc.sectionLabel,
          governingThought: sc.governingThought,
          subtitle: sc.subtitle,
          insightBar: sc.insightBar,
        });
        renderPattern(slide, pptx, sc.body, brand);
      }
    } catch (err) {
      // Graceful degradation: render error placeholder instead of crashing
      console.error(`Error rendering slide ${i + 1} (${sc.body.pattern}):`, err);
      addChrome(slide, pptx, brand, i + 1);
      slide.addText(
        `[Slide rendering error: ${sc.body.pattern}]`,
        {
          x: 2,
          y: 3.5,
          w: 9,
          h: 0.5,
          fontSize: 14,
          fontFace: brand.fonts.body,
          color: brand.colors.grey50,
          align: "center",
        },
      );
    }
  });

  // Generate buffer
  const output = await pptx.write({ outputType: "nodebuffer" });
  return Buffer.from(output as ArrayBuffer);
}

/* ── Cover Slide Patching ──────────────────────────────────────── */

/**
 * Patch cover slide with request context.
 * Claude often omits title/clientName from cover body, so we inject them.
 */
export function patchCoverSlide(
  content: DeckContent,
  outline: DeckOutline,
  clientName: string,
): void {
  for (const slide of content.slides) {
    if (slide.body.pattern === "cover") {
      const cover = slide.body as {
        pattern: "cover";
        title: string;
        clientName: string;
        subtitle: string;
        date: string;
        preparedBy: string;
      };
      if (!cover.title || cover.title === "Proposal") {
        cover.title = outline.title || "Anaplan Implementation Proposal";
      }
      if (!cover.subtitle) {
        cover.subtitle = outline.subtitle || "";
      }
      if (!cover.clientName || cover.clientName === "Client") {
        cover.clientName = clientName || "Client";
      }
    }
  }
}

/* ── Main Export ─────────────────────────────────────────────────── */

export interface DeckResult {
  buffer: Buffer;
  outline: DeckOutline;
  slideCount: number;
}

export type ProgressCallback = (
  stage: string,
  percent: number,
  message: string,
) => void;

/**
 * Generate a complete proposal PPTX deck with progress reporting.
 *
 * Pipeline: Request → Outline (Claude) → Content (Claude) → PPTX (PptxGenJS)
 *
 * @param req - Deck generation request with all proposal data
 * @param apiKey - Anthropic API key
 * @param onProgress - Optional callback for stage updates
 * @returns PPTX buffer and metadata
 */
export async function generateDeck(
  req: DeckRequest,
  apiKey: string,
  onProgress?: ProgressCallback,
): Promise<DeckResult> {
  const brand = getBrandConfig();
  const emit = onProgress || (() => {});

  // Phase 1: Outline
  emit("generating-outline", 15, "Claude is designing the narrative structure...");
  const outline = await generateOutline(req, apiKey);
  emit("outline-complete", 35, `Outline ready — ${outline.totalSlides} slides across ${outline.sections.length} sections`);

  // Phase 2: Content
  emit("generating-content", 45, "Claude is composing slide content...");
  const content = await generateContent(req, outline, apiKey);
  emit("content-complete", 70, `Content composed for ${content.slides.length} slides`);

  // Post-process: Inject request context into cover slide
  patchCoverSlide(content, outline, req.client.companyName);

  // Phase 3: Render
  emit("rendering-slides", 75, "Rendering slides with PptxGenJS...");
  const buffer = await renderPptx(content, brand);
  emit("complete", 100, `Deck complete — ${content.slides.length} slides rendered`);

  return {
    buffer,
    outline,
    slideCount: content.slides.length,
  };
}
