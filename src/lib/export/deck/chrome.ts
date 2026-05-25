/**
 * Deck Composer — Slide Chrome
 *
 * Every slide gets identical branding chrome:
 * - Logo (top-left)
 * - Governing thought hierarchy (section label → headline → subtitle → separator)
 * - Insight bar (bottom callout)
 * - Footer ("YEARS AHEAD") + page number
 */

import type { BrandConfig, PptxSlide, PptxInstance, InsightBar } from "./types";
import { SLIDE } from "./assets";

/**
 * Add brand chrome to a slide: logo + footer + page number.
 */
export function addChrome(
  slide: PptxSlide,
  pptx: PptxInstance,
  brand: BrandConfig,
  pageNum: number,
): void {
  // White background
  slide.background = { color: brand.colors.white };

  // Logo — top left
  slide.addImage({
    data: brand.logoBase64,
    x: SLIDE.margin.left,
    y: SLIDE.margin.top,
    w: 1.43,
    h: 0.61,
  });

  // Footer — bottom left
  slide.addText(brand.footer, {
    x: SLIDE.margin.left,
    y: 7.04,
    w: 2.38,
    h: 0.23,
    fontSize: 8,
    fontFace: brand.fonts.heading,
    color: brand.colors.dark,
  });

  // Page number — bottom right
  slide.addText(`PAGE ${pageNum}`, {
    x: 12.0,
    y: 7.04,
    w: 1.0,
    h: 0.23,
    fontSize: 8,
    fontFace: brand.fonts.heading,
    color: brand.colors.dark,
    align: "right",
  });
}

/**
 * Add governing thought header: section label + headline + subtitle + separator.
 */
export function addGoverningThought(
  slide: PptxSlide,
  pptx: PptxInstance,
  brand: BrandConfig,
  sectionLabel: string,
  title: string,
  subtitle: string,
): void {
  // Section label — small caps, tracked
  slide.addText(sectionLabel.toUpperCase(), {
    x: SLIDE.margin.left,
    y: 0.88,
    w: 5,
    h: 0.2,
    fontSize: 8.5,
    fontFace: brand.fonts.body,
    color: brand.colors.steel,
    bold: true,
    charSpacing: 2.5,
  });

  // Governing thought — the assertive headline
  slide.addText(title, {
    x: SLIDE.margin.left,
    y: 1.08,
    w: 11.5,
    h: 0.42,
    fontSize: 20,
    fontFace: brand.fonts.heading,
    color: brand.colors.dark,
    bold: true,
  });

  // Subtitle — italic supporting line
  slide.addText(subtitle, {
    x: SLIDE.margin.left,
    y: 1.52,
    w: 11.5,
    h: 0.35,
    fontSize: 11,
    fontFace: brand.fonts.body,
    color: brand.colors.grey50,
    italic: true,
  });

  // Separator line
  slide.addShape(pptx.ShapeType.line, {
    x: SLIDE.margin.left,
    y: 1.92,
    w: SLIDE.content.width,
    h: 0,
    line: { color: brand.colors.grey10, width: 0.75 },
  });
}

/**
 * Add insight bar — pale wash strip at the bottom with client-specific context.
 */
export function addInsightBar(
  slide: PptxSlide,
  pptx: PptxInstance,
  brand: BrandConfig,
  insight: InsightBar,
): void {
  // Background strip
  slide.addShape(pptx.ShapeType.rect, {
    x: SLIDE.margin.left,
    y: 6.5,
    w: SLIDE.content.width,
    h: 0.4,
    fill: { color: brand.colors.wash },
    rectRadius: 0.04,
  });

  // Mixed-format text
  slide.addText(
    [
      {
        text: `${insight.label}: `,
        options: {
          bold: true,
          color: brand.colors.dark,
          fontSize: 9.5,
        },
      },
      {
        text: insight.detail,
        options: {
          color: brand.colors.grey70,
          fontSize: 9.5,
        },
      },
    ],
    {
      x: 0.65,
      y: 6.52,
      w: 12.0,
      h: 0.36,
      fontFace: brand.fonts.body,
      valign: "middle",
    },
  );
}

/**
 * Add full chrome to a content slide: logo, governing thought, insight bar, footer.
 */
export function addFullChrome(
  slide: PptxSlide,
  pptx: PptxInstance,
  brand: BrandConfig,
  opts: {
    pageNum: number;
    sectionLabel: string;
    governingThought: string;
    subtitle: string;
    insightBar: InsightBar;
  },
): void {
  addChrome(slide, pptx, brand, opts.pageNum);
  addGoverningThought(
    slide,
    pptx,
    brand,
    opts.sectionLabel,
    opts.governingThought,
    opts.subtitle,
  );
  addInsightBar(slide, pptx, brand, opts.insightBar);
}
