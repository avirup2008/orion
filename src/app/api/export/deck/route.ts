/**
 * API Route: POST /api/export/deck
 *
 * Generates a McKinsey-style PPTX proposal deck using the AI deck composer.
 * Streams SSE progress events during generation, then sends the PPTX as
 * a base64-encoded final event.
 *
 * Event stream format:
 *   data: {"type":"progress","stage":"...","percent":N,"message":"..."}
 *   data: {"type":"complete","filename":"...","slideCount":N,"data":"<base64>"}
 *   data: {"type":"error","message":"..."}
 */

import { NextRequest } from "next/server";
import { generateDeck } from "@/lib/export/deck/render";
import type { DeckRequest } from "@/lib/export/deck/types";

export const maxDuration = 60; // Allow up to 60s for Vercel serverless

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "ANTHROPIC_API_KEY not configured" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON body" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  // Basic validation — need at least questions OR documents OR client context
  const hasQuestions = Array.isArray(body.questions) && body.questions.length > 0;
  const hasDocs = Array.isArray(body.documents) && body.documents.length > 0;

  if (!hasQuestions && !hasDocs) {
    return new Response(
      JSON.stringify({ error: "Provide RFP questions, uploaded documents, or both" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  if (!(body.client as Record<string, unknown>)?.companyName) {
    return new Response(
      JSON.stringify({ error: "Client company name is required" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  // Build the deck request
  const clientObj = body.client as Record<string, unknown>;
  const deckReq: DeckRequest = {
    questions: hasQuestions
      ? (body.questions as Record<string, unknown>[]).map((q) => ({
          id: (q.id as string) || String(Math.random()),
          text: (q.text as string) || "",
          category: (q.category as string) || "general",
          response: (q.response as string) || "",
          wordCount: typeof q.wordCount === "number" ? q.wordCount : String(q.response || "").split(/\s+/).length,
          score: typeof q.score === "number" ? q.score : undefined,
        }))
      : undefined,
    documents: hasDocs
      ? (body.documents as Record<string, unknown>[]).map((d) => ({
          name: (d.name as string) || "Untitled",
          content: (d.content as string) || "",
          wordCount: typeof d.wordCount === "number" ? d.wordCount : String(d.content || "").split(/\s+/).length,
        }))
      : undefined,
    client: {
      companyName: clientObj.companyName as string,
      industry: (clientObj.industry as string) || "Technology",
      size: clientObj.size as string | undefined,
      region: clientObj.region as string | undefined,
      painPoints: clientObj.painPoints as string[] | undefined,
    },
    costing: body.costing as DeckRequest["costing"],
    competitiveContext: body.competitiveContext as string | undefined,
    engagementName: body.engagementName as string | undefined,
    modules: body.modules as string[] | undefined,
  };

  // Stream SSE
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
      };

      try {
        send({
          type: "progress",
          stage: "preparing",
          percent: 5,
          message: `Preparing deck for ${deckReq.client.companyName}...`,
        });

        const result = await generateDeck(
          deckReq,
          apiKey,
          (stage, percent, message) => {
            send({ type: "progress", stage, percent, message });
          },
        );

        // Build filename
        const clientSlug = deckReq.client.companyName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/-+$/, "");
        const date = new Date().toISOString().split("T")[0];
        const filename = `${clientSlug}-proposal-${date}.pptx`;

        // Send the PPTX as base64
        const base64 = result.buffer.toString("base64");
        send({
          type: "complete",
          filename,
          slideCount: result.slideCount,
          sections: result.outline.sections.length,
          data: base64,
        });
      } catch (err) {
        console.error("Deck generation error:", err);
        send({
          type: "error",
          message: err instanceof Error ? err.message : "Unknown error",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
