/**
 * API Route: POST /api/parse/pdf
 *
 * Server-side PDF text extraction using pdfjs-dist legacy build.
 * Works around Turbopack/browser bundling issues with pdfjs-dist v5.
 * Accepts multipart/form-data with a "file" field.
 *
 * Polyfills DOMMatrix (browser global) for Node.js since pdfjs
 * uses it internally for text position calculations.
 */

import { NextRequest } from "next/server";

/* ── Node.js polyfill: DOMMatrix ──────────────────────────────── */
// pdfjs-dist uses DOMMatrix for text extraction coordinate math.
// Node.js doesn't have it, so we provide a minimal implementation.
// We only need text content (not rendering), so basic ops suffice.

if (typeof globalThis.DOMMatrix === "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).DOMMatrix = class DOMMatrix {
    a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
    m11 = 1; m12 = 0; m13 = 0; m14 = 0;
    m21 = 0; m22 = 1; m23 = 0; m24 = 0;
    m31 = 0; m32 = 0; m33 = 1; m34 = 0;
    m41 = 0; m42 = 0; m43 = 0; m44 = 1;
    is2D = true;
    isIdentity = true;

    constructor(init?: string | number[]) {
      if (Array.isArray(init)) {
        if (init.length === 6) {
          [this.a, this.b, this.c, this.d, this.e, this.f] = init;
          this.m11 = this.a; this.m12 = this.b;
          this.m21 = this.c; this.m22 = this.d;
          this.m41 = this.e; this.m42 = this.f;
        } else if (init.length === 16) {
          [
            this.m11, this.m12, this.m13, this.m14,
            this.m21, this.m22, this.m23, this.m24,
            this.m31, this.m32, this.m33, this.m34,
            this.m41, this.m42, this.m43, this.m44,
          ] = init;
          this.a = this.m11; this.b = this.m12;
          this.c = this.m21; this.d = this.m22;
          this.e = this.m41; this.f = this.m42;
          this.is2D = false;
        }
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    multiply(_other?: any) { return new DOMMatrix(); }
    inverse() { return new DOMMatrix(); }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    translate(_tx?: number, _ty?: number, _tz?: number): any { return new DOMMatrix(); }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    scale(_sx?: number, _sy?: number): any { return new DOMMatrix(); }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rotate(_angle?: number): any { return new DOMMatrix(); }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transformPoint(point?: any) { return point || { x: 0, y: 0, z: 0, w: 1 }; }
    toFloat32Array() { return new Float32Array([
      this.m11, this.m12, this.m13, this.m14,
      this.m21, this.m22, this.m23, this.m24,
      this.m31, this.m32, this.m33, this.m34,
      this.m41, this.m42, this.m43, this.m44,
    ]); }
    toFloat64Array() { return new Float64Array([
      this.m11, this.m12, this.m13, this.m14,
      this.m21, this.m22, this.m23, this.m24,
      this.m31, this.m32, this.m33, this.m34,
      this.m41, this.m42, this.m43, this.m44,
    ]); }
    static fromMatrix() { return new DOMMatrix(); }
    static fromFloat32Array(a: Float32Array) { return new DOMMatrix([...a]); }
    static fromFloat64Array(a: Float64Array) { return new DOMMatrix([...a]); }
  };
}

/* ── Also polyfill Path2D if missing (pdfjs references it) ──── */
if (typeof globalThis.Path2D === "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).Path2D = class Path2D {
    // Stub — pdfjs only uses this for rendering, not text extraction
  };
}

/* ── Route ─────────────────────────────────────────────────────── */

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

    // Use legacy build for Node.js compatibility
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
