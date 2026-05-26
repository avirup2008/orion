/**
 * API Route: POST /api/export/deck/content
 *
 * Step 2 of the multi-call deck pipeline.
 * Takes { request: DeckRequest, outline: DeckOutline } and returns DeckContent via Claude.
 */

import { NextRequest } from "next/server";
import { generateContent } from "@/lib/export/deck/render";
import type { DeckRequest, DeckOutline } from "@/lib/export/deck/types";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "ANTHROPIC_API_KEY not configured" },
      { status: 500 },
    );
  }

  let body: { request: DeckRequest; outline: DeckOutline };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.request || !body.outline) {
    return Response.json(
      { error: "Body must contain 'request' (DeckRequest) and 'outline' (DeckOutline)" },
      { status: 400 },
    );
  }

  if (!body.outline.sections || !Array.isArray(body.outline.sections)) {
    return Response.json(
      { error: "Invalid outline: missing sections array" },
      { status: 400 },
    );
  }

  try {
    const content = await generateContent(body.request, body.outline, apiKey);
    return Response.json({ content });
  } catch (err) {
    console.error("Content generation error:", err);
    return Response.json(
      { error: err instanceof Error ? err.message : "Content generation failed" },
      { status: 500 },
    );
  }
}
