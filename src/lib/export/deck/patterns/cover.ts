/**
 * Pattern: Cover Slide
 *
 * Full-bleed title slide with centered client name, proposal title,
 * date, and "Prepared by EyeOn" attribution.
 */

import type { BrandConfig, PptxSlide, PptxInstance, CoverBody } from "../types";
import { SLIDE } from "../assets";

export function renderCover(
  slide: PptxSlide,
  pptx: PptxInstance,
  body: CoverBody,
  brand: BrandConfig,
): void {
  // Navy background
  slide.background = { color: brand.colors.eyeonNavy };

  // Logo — top left (white version via SVG override)
  slide.addImage({
    data: brand.logoBase64,
    x: SLIDE.margin.left,
    y: SLIDE.margin.top,
    w: 1.43,
    h: 0.61,
  });

  // Thin accent line across the page
  slide.addShape(pptx.ShapeType.line, {
    x: SLIDE.margin.left,
    y: 2.6,
    w: SLIDE.content.width,
    h: 0,
    line: { color: brand.colors.steel, width: 0.5 },
  });

  // Main title
  slide.addText(body.title, {
    x: SLIDE.margin.left,
    y: 2.8,
    w: 10,
    h: 0.8,
    fontSize: 32,
    fontFace: brand.fonts.heading,
    color: brand.colors.white,
    bold: true,
  });

  // Subtitle
  slide.addText(body.subtitle, {
    x: SLIDE.margin.left,
    y: 3.65,
    w: 10,
    h: 0.5,
    fontSize: 16,
    fontFace: brand.fonts.body,
    color: brand.colors.pale,
    italic: true,
  });

  // Client name — prominent
  slide.addText(body.clientName, {
    x: SLIDE.margin.left,
    y: 4.4,
    w: 10,
    h: 0.45,
    fontSize: 18,
    fontFace: brand.fonts.body,
    color: brand.colors.light,
    bold: true,
  });

  // Date
  slide.addText(body.date, {
    x: SLIDE.margin.left,
    y: 5.2,
    w: 5,
    h: 0.3,
    fontSize: 12,
    fontFace: brand.fonts.body,
    color: brand.colors.grey50,
  });

  // Prepared by
  slide.addText(body.preparedBy, {
    x: SLIDE.margin.left,
    y: 5.55,
    w: 5,
    h: 0.3,
    fontSize: 12,
    fontFace: brand.fonts.body,
    color: brand.colors.grey50,
  });

  // Bottom branding
  slide.addText("YEARS AHEAD", {
    x: SLIDE.margin.left,
    y: 7.04,
    w: 2.38,
    h: 0.23,
    fontSize: 8,
    fontFace: brand.fonts.heading,
    color: brand.colors.grey50,
  });

  // "CONFIDENTIAL" stamp
  slide.addText("CONFIDENTIAL", {
    x: 10.5,
    y: 7.04,
    w: 2.5,
    h: 0.23,
    fontSize: 8,
    fontFace: brand.fonts.heading,
    color: brand.colors.grey50,
    align: "right",
    charSpacing: 2,
  });
}
