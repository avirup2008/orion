/**
 * API Route: POST /api/parse/pdf
 *
 * Server-side PDF text extraction using pdfjs-dist legacy build.
 * Works around Turbopack/browser bundling issues with pdfjs-dist v5.
 * Accepts multipart/form-data with a "file" field.
 */

import { NextRequest } from "next/server";

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

    // Use legacy build which works reliably in Node.js without worker setup
    const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");

    // Disable worker for server-side usage
    pdfjsLib.GlobalWorkerOptions.workerSrc = "";

    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      useWorkerFetch: false,
      useSystemFonts: true,
    } as Parameters<typeof pdfjsLib.getDocument>[0]);

    const pdf = await loadingTask.promise;
    const pages: string[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const text = content.items
        .map((item: Record<string, unknown>) =>
          typeof item === "object" && item !== null && "str" in item
            ? String(item.str)
            : "",
        )
        .join(" ");
      pages.push(text);
    }

    const extractedText = pages.join("\n");

    return Response.json({
      text: extractedText,
      pageCount: pdf.numPages,
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
