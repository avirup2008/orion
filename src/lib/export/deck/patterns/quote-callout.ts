/**
 * Pattern: Quote Callout
 *
 * Large testimonial or reference highlight with attribution.
 * Centered layout with decorative quote marks and context below.
 */

import type { BrandConfig, PptxSlide, PptxInstance, QuoteCalloutBody } from "../types";
import { SLIDE } from "../assets";

export function renderQuoteCallout(
  slide: PptxSlide,
  pptx: PptxInstance,
  body: QuoteCalloutBody,
  brand: BrandConfig,
): void {
  const centerX = SLIDE.content.left + SLIDE.content.width / 2;
  const quoteW = 9.0;
  const quoteX = centerX - quoteW / 2;

  // Large decorative opening quote mark
  slide.addText("“", {
    x: quoteX - 0.3,
    y: SLIDE.content.top + 0.2,
    w: 1,
    h: 0.8,
    fontSize: 72,
    fontFace: brand.fonts.heading,
    color: brand.colors.pale,
    bold: true,
  });

  // Quote text
  slide.addText(body.quote, {
    x: quoteX + 0.3,
    y: SLIDE.content.top + 0.6,
    w: quoteW - 0.6,
    h: 2.0,
    fontSize: 18,
    fontFace: brand.fonts.heading,
    color: brand.colors.dark,
    italic: true,
    lineSpacingMultiple: 1.5,
    valign: "middle",
  });

  // Closing quote mark
  slide.addText("”", {
    x: quoteX + quoteW - 0.7,
    y: SLIDE.content.top + 2.0,
    w: 1,
    h: 0.8,
    fontSize: 72,
    fontFace: brand.fonts.heading,
    color: brand.colors.pale,
    bold: true,
    align: "right",
  });

  // Accent separator line
  const sepY = SLIDE.content.top + 3.1;
  slide.addShape(pptx.ShapeType.line, {
    x: centerX - 1.5,
    y: sepY,
    w: 3.0,
    h: 0,
    line: { color: brand.colors.dark, width: 2 },
  });

  // Attribution name
  slide.addText(body.attribution, {
    x: quoteX,
    y: sepY + 0.25,
    w: quoteW,
    h: 0.35,
    fontSize: 14,
    fontFace: brand.fonts.body,
    color: brand.colors.dark,
    bold: true,
    align: "center",
  });

  // Role/title
  slide.addText(body.role, {
    x: quoteX,
    y: sepY + 0.6,
    w: quoteW,
    h: 0.3,
    fontSize: 11,
    fontFace: brand.fonts.body,
    color: brand.colors.steel,
    align: "center",
  });

  // Context note
  if (body.context) {
    slide.addText(body.context, {
      x: quoteX,
      y: sepY + 1.0,
      w: quoteW,
      h: 0.5,
      fontSize: 9,
      fontFace: brand.fonts.body,
      color: brand.colors.grey50,
      italic: true,
      align: "center",
      lineSpacingMultiple: 1.4,
    });
  }
}
