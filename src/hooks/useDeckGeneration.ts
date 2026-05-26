"use client";

import { useCallback, useState, useRef } from "react";
import { useAppState } from "@/lib/store";
import { getUploadedDocs } from "@/components/layout/ContextPanel";
import type { DeckOutline } from "@/lib/export/deck/types";

export interface UseDeckGenerationReturn {
  status: "idle" | "generating" | "outline-review" | "error";
  progress: number;
  stage: string;
  error: string;
  /** The generated outline (available during outline-review) */
  outline: DeckOutline | null;
  /** Start deck generation (stops at outline if enableOutlineReview) */
  generateDeck: () => Promise<void>;
  /** After outline review, continue to content + render */
  approveOutline: (editedOutline: DeckOutline) => void;
  /** Cancel outline review, return to idle */
  cancelOutline: () => void;
  /** Enable/disable outline review step */
  enableOutlineReview: boolean;
  setEnableOutlineReview: (v: boolean) => void;
  /** Target slide count (0 = auto) */
  targetSlideCount: number;
  setTargetSlideCount: (v: number) => void;
}

const PIPELINE_STEPS = [
  { label: "Prep", threshold: 5 },
  { label: "Outline", threshold: 10 },
  { label: "Content", threshold: 40 },
  { label: "Render", threshold: 75 },
  { label: "Done", threshold: 100 },
];

export { PIPELINE_STEPS };

/**
 * Shared hook that encapsulates the full 3-step deck generation pipeline
 * (outline -> [optional review] -> content -> render) and auto-downloads the resulting PPTX.
 *
 * Used by both IntakePage (primary CTA) and OutlinePanel (sidebar export).
 */
export function useDeckGeneration(): UseDeckGenerationReturn {
  const { client, questions } = useAppState();

  const [status, setStatus] = useState<"idle" | "generating" | "outline-review" | "error">("idle");
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState("");
  const [outline, setOutline] = useState<DeckOutline | null>(null);
  const [enableOutlineReview, setEnableOutlineReview] = useState(true);
  const [targetSlideCount, setTargetSlideCount] = useState(0); // 0 = auto

  // Store payload for continuing after outline review
  const payloadRef = useRef<Record<string, unknown> | null>(null);

  const buildPayload = useCallback((): Record<string, unknown> => {
    const uploadedDocs = getUploadedDocs();

    const payload: Record<string, unknown> = {
      client: {
        companyName: client.companyName || "Client",
        industry: client.industry || "Technology",
        size: client.size,
        painPoints: client.painPoints
          ? client.painPoints.split(",").map((s: string) => s.trim())
          : undefined,
      },
      engagementName: client.industry
        ? `${client.companyName} — ${client.industry}`
        : undefined,
      targetSlideCount: targetSlideCount > 0 ? targetSlideCount : undefined,
    };

    // Include questions (with or without responses)
    if (questions.length > 0) {
      payload.questions = questions.map((q) => ({
        id: q.id,
        text: q.text,
        category: q.category,
        response: q.response?.content || q.text,
        wordCount:
          q.response?.wordCount ||
          (q.response?.content
            ? q.response.content.split(/\s+/).length
            : q.text.split(/\s+/).length),
        score: q.response?.qualityScore,
      }));
    }

    // Include uploaded documents if available
    if (uploadedDocs.length > 0) {
      payload.documents = uploadedDocs.map((d) => ({
        name: d.name,
        content: d.content,
        wordCount: d.wordCount,
      }));
    }

    return payload;
  }, [questions, client, targetSlideCount]);

  const downloadPptx = useCallback((result: { data: string; filename?: string; slideCount: number }) => {
    const byteChars = atob(result.data);
    const byteArray = new Uint8Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) {
      byteArray[i] = byteChars.charCodeAt(i);
    }
    const blob = new Blob([byteArray], {
      type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = result.filename || "proposal.pptx";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const continueFromOutline = useCallback(async (
    payload: Record<string, unknown>,
    approvedOutline: DeckOutline,
  ) => {
    setStatus("generating");
    setOutline(null);

    try {
      // --- Step 2: Generate Content (batched for large decks) ---
      const allSlides = approvedOutline.sections.flatMap((s: { slides: unknown[] }) => s.slides);
      const BATCH_SIZE = 12;
      const needsBatching = allSlides.length > BATCH_SIZE;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const allContentSlides: any[] = [];

      if (needsBatching) {
        // Split into batches — each is its own API call with its own 60s budget
        const batches: typeof approvedOutline.sections = [];
        for (let i = 0; i < allSlides.length; i += BATCH_SIZE) {
          batches.push({
            label: `BATCH`,
            slides: allSlides.slice(i, i + BATCH_SIZE) as DeckOutline["sections"][0]["slides"],
          });
        }

        for (let b = 0; b < batches.length; b++) {
          const pct = 40 + Math.round((b / batches.length) * 30);
          setProgress(pct);
          setStage(`Composing slides ${b * BATCH_SIZE + 1}–${Math.min((b + 1) * BATCH_SIZE, allSlides.length)} of ${allSlides.length} (batch ${b + 1}/${batches.length})...`);

          const batchOutline: DeckOutline = {
            ...approvedOutline,
            sections: [batches[b]],
            totalSlides: batches[b].slides.length,
          };

          const contentRes = await fetch("/api/export/deck/content", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ request: payload, outline: batchOutline }),
          });

          if (!contentRes.ok) {
            const errData = await contentRes.json().catch(() => ({}));
            throw new Error(
              (errData as Record<string, string>).error ||
                `Content generation failed (batch ${b + 1}, HTTP ${contentRes.status})`,
            );
          }

          const { content: batchContent } = await contentRes.json();
          allContentSlides.push(...batchContent.slides);
        }
      } else {
        // Small deck — single call
        setProgress(40);
        setStage("Composing slide content...");

        const contentRes = await fetch("/api/export/deck/content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ request: payload, outline: approvedOutline }),
        });

        if (!contentRes.ok) {
          const errData = await contentRes.json().catch(() => ({}));
          throw new Error(
            (errData as Record<string, string>).error ||
              `Content generation failed (HTTP ${contentRes.status})`,
          );
        }

        const { content: singleContent } = await contentRes.json();
        allContentSlides.push(...singleContent.slides);
      }

      const content = { slides: allContentSlides };
      setProgress(70);
      setStage(`Content composed for ${content.slides.length} slides`);

      // --- Step 3: Render PPTX ---
      setProgress(75);
      setStage("Rendering slides...");

      const renderRes = await fetch("/api/export/deck/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          outline: approvedOutline,
          clientName: client.companyName || "Client",
        }),
      });

      if (!renderRes.ok) {
        const errData = await renderRes.json().catch(() => ({}));
        throw new Error(
          (errData as Record<string, string>).error ||
            `PPTX render failed (HTTP ${renderRes.status})`,
        );
      }

      const result = await renderRes.json();
      setProgress(100);
      setStage(`Done — ${result.slideCount} slides`);

      // Download
      downloadPptx(result);

      setTimeout(() => {
        setStatus("idle");
        setProgress(0);
        setStage("");
      }, 2000);
    } catch (err) {
      console.error("Deck generation error:", err);
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(msg);
      setStatus("error");
      setProgress(0);
      setTimeout(() => {
        setStatus("idle");
        setStage("");
        setError("");
      }, 8000);
    }
  }, [client.companyName, downloadPptx]);

  const generateDeck = useCallback(async () => {
    setStatus("generating");
    setError("");
    setProgress(0);
    setStage("Preparing...");
    setOutline(null);

    try {
      const payload = buildPayload();
      payloadRef.current = payload;

      // --- Step 1: Generate Outline ---
      setProgress(10);
      setStage("Generating narrative outline...");

      const outlineRes = await fetch("/api/export/deck/outline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!outlineRes.ok) {
        const errData = await outlineRes.json().catch(() => ({}));
        const errMsg = (errData as Record<string, string>).error || "";
        if (outlineRes.status === 500 && errMsg.includes("API key")) {
          throw new Error("Missing API key. Add ANTHROPIC_API_KEY to Vercel environment variables.");
        }
        throw new Error(
          errMsg || `Outline generation failed (HTTP ${outlineRes.status})`,
        );
      }

      const { outline: generatedOutline } = await outlineRes.json();
      setProgress(35);
      setStage(
        `Outline ready — ${generatedOutline.totalSlides} slides across ${generatedOutline.sections.length} sections`,
      );

      // If outline review is enabled, pause here
      if (enableOutlineReview) {
        setOutline(generatedOutline);
        setStatus("outline-review");
        return;
      }

      // Otherwise continue straight to content + render
      await continueFromOutline(payload, generatedOutline);
    } catch (err) {
      console.error("Deck generation error:", err);
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(msg);
      setStatus("error");
      setProgress(0);
      setTimeout(() => {
        setStatus("idle");
        setStage("");
        setError("");
      }, 8000);
    }
  }, [buildPayload, enableOutlineReview, continueFromOutline]);

  const approveOutline = useCallback((editedOutline: DeckOutline) => {
    const payload = payloadRef.current;
    if (!payload) {
      console.error("No payload stored for outline approval");
      return;
    }
    continueFromOutline(payload, editedOutline);
  }, [continueFromOutline]);

  const cancelOutline = useCallback(() => {
    setStatus("idle");
    setOutline(null);
    setProgress(0);
    setStage("");
    payloadRef.current = null;
  }, []);

  return {
    status,
    progress,
    stage,
    error,
    outline,
    generateDeck,
    approveOutline,
    cancelOutline,
    enableOutlineReview,
    setEnableOutlineReview,
    targetSlideCount,
    setTargetSlideCount,
  };
}
