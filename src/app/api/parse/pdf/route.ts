/**
 * API Route: POST /api/parse/pdf
 *
 * Server-side PDF text extraction using `unpdf` — a purpose-built
 * Node.js PDF library that handles all pdfjs-dist compatibility
 * internally. No browser polyfills needed.
 *
 * Accepts multipart/form-data with a "file" field.
 */

import { NextRequest } from "next/server";
import { extractText } from "unpdf";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
      return Response.json(
        { error: "No PDF file provided" },
        { status: 400 },
      );
    }

    // 10MB limit
    if (file.size > 10 * 1024 * 1024) {
      return Response.json(
        { error: "File too large. Maximum size is 10MB." },
        { status: 400 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Extract text — unpdf handles all pdfjs internals
    const { text, totalPages } = await extractText(buffer, { mergePages: false });

    const pageCount = totalPages ?? (Array.isArray(text) ? text.length : 1);

    // text is string[] when mergePages=false (one per page), joined with newlines
    const extractedText = Array.isArray(text) ? text.join("\n") : text;

    return Response.json({
      text: extractedText,
      pageCount,
    });
  } catch (err) {
    console.error("PDF parsing error:", err);
    return Response.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to parse PDF",
      },
      { status: 500 },
    );
  }
}
