/**
 * Pattern: Waterfall / Bar Chart
 *
 * Descending bars showing proportional scope/effort breakdown.
 * Darkest = largest/most important, lightest = smallest.
 * Optional dashed "target" bar for outcomes.
 */

import type { BrandConfig, PptxSlide, PptxInstance, WaterfallBody } from "../types";
import { SLIDE } from "../assets";

const BAR_COLORS = ["0B1F3A", "1B3A5C", "2C5F8A", "4A90C4", "A8C8E8"];

export function renderWaterfall(
  slide: PptxSlide,
  pptx: PptxInstance,
  body: WaterfallBody,
  brand: BrandConfig,
): void {
  const bars = body.bars;
  const count = bars.length;
  if (count === 0) return;

  const contentTop = SLIDE.content.top;
  const contentBottom = SLIDE.content.bottom;
  const maxBarH = contentBottom - contentTop - 1.2; // leave room for details
  const barGap = 0.3;
  const totalBarWidth = SLIDE.content.width - (body.target ? 2.5 : 0);
  const barW = (totalBarWidth - (count - 1) * barGap) / count;

  // Sort by percentage descending for visual impact
  const sorted = [...bars].sort((a, b) => b.percentage - a.percentage);
  const maxPct = sorted[0]?.percentage || 100;

  sorted.forEach((bar, i) => {
    const barH = (bar.percentage / maxPct) * maxBarH;
    const barX = SLIDE.content.left + i * (barW + barGap);
    const barY = contentBottom - barH - 1.0;

    // Bar rectangle
    slide.addShape(pptx.ShapeType.roundRect, {
      x: barX,
      y: barY,
      w: barW,
      h: barH,
      fill: { color: BAR_COLORS[i % BAR_COLORS.length] },
      rectRadius: 0.06,
      shadow: { type: "outer", blur: 3, offset: 1.5, color: "000000", opacity: 0.1 },
    });

    // Label inside bar — title
    slide.addText(bar.label.toUpperCase(), {
      x: barX + 0.15,
      y: barY + 0.2,
      w: barW - 0.3,
      h: 0.35,
      fontSize: Math.min(20, Math.max(12, barW * 6)),
      fontFace: brand.fonts.body,
      color: brand.colors.white,
      bold: true,
      autoFit: true,
    });

    // Percentage
    slide.addText(`${bar.percentage}%`, {
      x: barX + 0.15,
      y: barY + 0.55,
      w: barW - 0.3,
      h: 0.3,
      fontSize: 18,
      fontFace: brand.fonts.body,
      color: brand.colors.pale,
      autoFit: true,
    });

    // Description inside (if bar is tall enough)
    if (barH > 1.5) {
      slide.addText(bar.description, {
        x: barX + 0.15,
        y: barY + 0.9,
        w: barW - 0.3,
        h: barH - 1.2,
        fontSize: 10,
        fontFace: brand.fonts.body,
        color: brand.colors.pale,
        valign: "top",
        autoFit: true,
      });
    }

    // Detail items below bars — single detail per bar to prevent overlap
    if (bar.details && bar.details.length > 0) {
      const detailY = contentBottom - 0.85;
      const detail = bar.details[0]; // one detail per bar — keeps it clean
      const detailFontSize = count >= 5 ? 7.5 : 8.5;

      slide.addText(
        [
          { text: `${detail.bold}\n`, options: { bold: true, color: brand.colors.dark, fontSize: detailFontSize } },
          { text: detail.body, options: { color: brand.colors.grey70, fontSize: detailFontSize - 0.5, lineSpacingMultiple: 1.1 } },
        ],
        {
          x: barX,
          y: detailY,
          w: barW - 0.05,
          h: 0.7,
          fontFace: brand.fonts.body,
          valign: "top",
          autoFit: true,
        },
      );
    }
  });

  // Optional target bar (dashed)
  if (body.target) {
    const targetX = SLIDE.content.left + count * (barW + barGap) + 0.3;
    const targetW = 2.0;
    const targetH = maxBarH * 0.4;
    const targetY = contentBottom - targetH - 1.0;

    slide.addShape(pptx.ShapeType.roundRect, {
      x: targetX,
      y: targetY,
      w: targetW,
      h: targetH,
      fill: { color: brand.colors.white },
      line: { color: brand.colors.dark, width: 1, dashType: "dash" },
      rectRadius: 0.06,
      shadow: { type: "outer", blur: 3, offset: 1.5, color: "000000", opacity: 0.1 },
    });

    slide.addText(body.target.label.toUpperCase(), {
      x: targetX + 0.1,
      y: targetY + 0.15,
      w: targetW - 0.2,
      h: 0.3,
      fontSize: 14,
      fontFace: brand.fonts.body,
      color: brand.colors.dark,
      bold: true,
      align: "center",
      autoFit: true,
    });

    slide.addText(body.target.description, {
      x: targetX + 0.1,
      y: targetY + 0.5,
      w: targetW - 0.2,
      h: targetH - 0.7,
      fontSize: 9,
      fontFace: brand.fonts.body,
      color: brand.colors.grey70,
      align: "center",
      valign: "top",
      autoFit: true,
    });
  }
}
