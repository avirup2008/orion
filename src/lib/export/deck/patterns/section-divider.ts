/**
 * Section Divider Pattern
 *
 * Full-navy background slide used between major sections.
 * Shows section label prominently with accent underline.
 */

import type { BrandConfig, PptxSlide, PptxInstance } from "../types";

export interface SectionDividerBody {
  pattern: "section-divider";
  sectionLabel: string;
  sectionNumber: number;
  totalSections: number;
  subtitle?: string;
}

export function renderSectionDivider(
  slide: PptxSlide,
  pptx: PptxInstance,
  body: SectionDividerBody,
  brand: BrandConfig,
): void {
  const C = brand.colors;

  // Full navy background
  slide.background = { color: C.dark };

  // Section number indicator — top right
  slide.addText(`${String(body.sectionNumber).padStart(2, "0")} / ${String(body.totalSections).padStart(2, "0")}`, {
    x: 10.5,
    y: 0.5,
    w: 2.5,
    h: 0.4,
    fontSize: 12,
    fontFace: brand.fonts.body,
    color: C.pale,
    align: "right",
  });

  // EyeOn logo placeholder — top left
  slide.addText("EyeOn", {
    x: 0.45,
    y: 0.4,
    w: 1.5,
    h: 0.35,
    fontSize: 11,
    fontFace: brand.fonts.heading,
    color: C.pale,
    bold: true,
  });

  // Main section label — centered
  slide.addText(body.sectionLabel.toUpperCase(), {
    x: 1.5,
    y: 2.7,
    w: 10.33,
    h: 1.2,
    fontSize: 36,
    fontFace: brand.fonts.heading,
    color: C.white,
    bold: true,
    align: "center",
    charSpacing: 4,
  });

  // Accent underline — coral bar
  slide.addShape(pptx.ShapeType.rect, {
    x: 5.67,
    y: 3.95,
    w: 2.0,
    h: 0.045,
    fill: { color: C.accent },
  });

  // Optional subtitle
  if (body.subtitle) {
    slide.addText(body.subtitle, {
      x: 2.5,
      y: 4.2,
      w: 8.33,
      h: 0.7,
      fontSize: 14,
      fontFace: brand.fonts.body,
      color: C.pale,
      align: "center",
      italic: true,
    });
  }

  // Footer line
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.45,
    y: 6.85,
    w: 12.4,
    h: 0.008,
    fill: { color: C.steel },
  });

  // Footer text
  slide.addText(brand.footer, {
    x: 0.45,
    y: 6.9,
    w: 3,
    h: 0.35,
    fontSize: 7,
    fontFace: brand.fonts.body,
    color: C.grey50,
    bold: true,
    charSpacing: 3,
  });

  // Confidential marker
  slide.addText("CONFIDENTIAL", {
    x: 9.5,
    y: 6.9,
    w: 3.4,
    h: 0.35,
    fontSize: 7,
    fontFace: brand.fonts.body,
    color: C.grey50,
    align: "right",
    charSpacing: 2,
  });
}
