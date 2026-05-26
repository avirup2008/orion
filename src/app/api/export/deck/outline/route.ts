/**
 * API Route: POST /api/export/deck/outline
 *
 * Step 1 of the multi-call deck pipeline.
 * Takes a DeckRequest body and returns a DeckOutline via Claude.
 */

import { NextRequest } from "next/server";
import { generateOutline } from "@/lib/export/deck/render";
import type { DeckRequest } from "@/lib/export/deck/types";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "ANTHROPIC_API_KEY not configured" },
      { status: 500 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Validate — need at least questions OR documents
  const hasQuestions =
    Array.isArray(body.questions) && body.questions.length > 0;
  const hasDocs = Array.isArray(body.documents) && body.documents.length > 0;

  if (!hasQuestions && !hasDocs) {
    return Response.json(
      { error: "Provide RFP questions, uploaded documents, or both" },
      { status: 400 },
    );
  }

  if (!(body.client as Record<string, unknown>)?.companyName) {
    return Response.json(
      { error: "Client company name is required" },
      { status: 400 },
    );
  }

  // Build the DeckRequest
  const clientObj = body.client as Record<string, unknown>;
  const deckReq: DeckRequest = {
    questions: hasQuestions
      ? (body.questions as Record<string, unknown>[]).map((q) => ({
          id: (q.id as string) || String(Math.random()),
          text: (q.text as string) || "",
          category: (q.category as string) || "general",
          response: (q.response as string) || "",
          wordCount:
            typeof q.wordCount === "number"
              ? q.wordCount
              : String(q.response || "")
                  .split(/\s+/)
                  .length,
          score: typeof q.score === "number" ? q.score : undefined,
        }))
      : undefined,
    documents: hasDocs
      ? (body.documents as Record<string, unknown>[]).map((d) => ({
          name: (d.name as string) || "Untitled",
          content: (d.content as string) || "",
          wordCount:
            typeof d.wordCount === "number"
              ? d.wordCount
              : String(d.content || "")
                  .split(/\s+/)
                  .length,
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

  try {
    const outline = await generateOutline(deckReq, apiKey);
    return Response.json({ outline });
  } catch (err) {
    console.error("Outline generation error:", err);
    return Response.json(
      { error: err instanceof Error ? err.message : "Outline generation failed" },
      { status: 500 },
    );
  }
}
