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
  BrandConfig,
} from "./types";
import { getBrandConfig } from "./assets";
import { addFullChrome, addChrome } from "./chrome";
import { renderPattern } from "./patterns";
import { buildOutlinePrompt, buildContentPrompt } from "./prompts";
import { validateOutline, validateContent, extractJSON } from "./validation";

/* ── Claude API Call ────────────────────────────────────────────── */

async function callClaude(
  system: string,
  user: string,
  apiKey: string,
  maxTokens: number = 8192,
): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: maxTokens,
      system,
      messages: [{ role: "user", content: user }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Claude API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const textBlock = data.content?.find(
    (b: { type: string }) => b.type === "text",
  );
  if (!textBlock?.text) {
    throw new Error("No text in Claude response");
  }
  return textBlock.text;
}

/* ── Phase 1: Generate Outline ──────────────────────────────────── */

async function generateOutline(
  req: DeckRequest,
  apiKey: string,
): Promise<DeckOutline> {
  const { system, user } = buildOutlinePrompt(req);
  const raw = await callClaude(system, user, apiKey, 4096);

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

async function generateContent(
  req: DeckRequest,
  outline: DeckOutline,
  apiKey: string,
): Promise<DeckContent> {
  const { system, user } = buildContentPrompt(req, outline);
  const raw = await callClaude(system, user, apiKey, 16384);

  let parsed: unknown;
  try {
    parsed = extractJSON(raw);
  } catch (e) {
    throw new Error(`Failed to parse content JSON: ${e}`);
  }

  const result = validateContent(parsed);
  if (!result.success) {
    // Log diagnostic info about what Claude returned
    try {
      const slides = (parsed as Record<string, unknown>)?.slides;
      if (Array.isArray(slides)) {
        console.error("Slide bodies received from AI:", slides.map((s: Record<string, unknown>, i: number) => {
          const body = s?.body as Record<string, unknown>;
          return `[${i}] pattern=${body?.pattern}, keys=${body ? Object.keys(body).join(",") : "null"}`;
        }).join(" | "));
      }
    } catch { /* diagnostic only */ }
    const issues = result.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    throw new Error(`Invalid content structure: ${issues}`);
  }

  return result.data as DeckContent;
}

/* ── Phase 3: Render PPTX ───────────────────────────────────────── */

async function renderPptx(
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

  // Render each slide
  content.slides.forEach((sc: SlideContent, i: number) => {
    const slide = pptx.addSlide();

    try {
      if (sc.body.pattern === "cover") {
        // Cover gets minimal chrome (just logo + footer)
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
  // Claude often omits title/clientName from cover body, so we patch it from the request
  for (const slide of content.slides) {
    if (slide.body.pattern === "cover") {
      const cover = slide.body as { pattern: "cover"; title: string; clientName: string; subtitle: string; date: string; preparedBy: string };
      // Use outline title if cover has default
      if (!cover.title || cover.title === "Proposal") {
        cover.title = outline.title || `Anaplan Implementation Proposal`;
      }
      // Use outline subtitle if cover has none
      if (!cover.subtitle) {
        cover.subtitle = outline.subtitle || "";
      }
      // Always inject the actual client name from the request
      if (!cover.clientName || cover.clientName === "Client") {
        cover.clientName = req.client.companyName || "Client";
      }
    }
  }

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
