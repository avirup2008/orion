/**
 * API Route: POST /api/export/deck/render
 *
 * Step 3 of the multi-call deck pipeline.
 * Takes { content: DeckContent, outline: DeckOutline, clientName: string }
 * and returns the rendered PPTX as base64 JSON.
 */

import { NextRequest } from "next/server";
import { renderPptx, patchCoverSlide } from "@/lib/export/deck/render";
import { getBrandConfig } from "@/lib/export/deck/assets";
import type { DeckContent, DeckOutline } from "@/lib/export/deck/types";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  let body: {
    content: DeckContent;
    outline: DeckOutline;
    clientName: string;
  };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.content || !Array.isArray(body.content.slides)) {
    return Response.json(
      { error: "Body must contain 'content' with a slides array" },
      { status: 400 },
    );
  }

  if (!body.outline) {
    return Response.json(
      { error: "Body must contain 'outline' (DeckOutline) for cover patching" },
      { status: 400 },
    );
  }

  try {
    // Patch cover slide with client context
    const clientName = body.clientName || "Client";
    patchCoverSlide(body.content, body.outline, clientName);

    // Render PPTX
    const brand = getBrandConfig();
    const buffer = await renderPptx(body.content, brand);

    // Build filename
    const clientSlug = clientName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/-+$/, "");
    const date = new Date().toISOString().split("T")[0];
    const filename = `${clientSlug}-proposal-${date}.pptx`;

    const base64 = buffer.toString("base64");

    return Response.json({
      filename,
      slideCount: body.content.slides.length,
      data: base64,
    });
  } catch (err) {
    console.error("PPTX render error:", err);
    return Response.json(
      { error: err instanceof Error ? err.message : "PPTX rendering failed" },
      { status: 500 },
    );
  }
}
