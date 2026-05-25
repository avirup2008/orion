/**
 * Pattern: Pyramid / Stacked Layers
 *
 * Bottom-up layering with widest = foundation, narrowing upward.
 * Right-side annotations per layer. Optional left axis label.
 */

import type { BrandConfig, PptxSlide, PptxInstance, PyramidBody } from "../types";
import { SLIDE } from "../assets";

const LAYER_COLORS = ["0B1F3A", "1B3A5C", "2C5F8A", "4A90C4", "A8C8E8"];

export function renderPyramid(
  slide: PptxSlide,
  pptx: PptxInstance,
  body: PyramidBody,
  brand: BrandConfig,
): void {
  const layers = body.layers;
  const count = layers.length;
  if (count === 0) return;

  const areaLeft = SLIDE.content.left + (body.leftAxis ? 0.6 : 0);
  const areaRight = 8.5; // leave room for annotations on right
  const annotLeft = 9.0;
  const annotWidth = SLIDE.content.right - annotLeft;
  const barGap = 0.12;
  const totalH = SLIDE.content.height - 0.4;
  const barH = (totalH - (count - 1) * barGap) / count;

  const maxWidth = areaRight - areaLeft;
  const minWidth = maxWidth * 0.5;
  const widthStep = count > 1 ? (maxWidth - minWidth) / (count - 1) : 0;
  const centerX = areaLeft + maxWidth / 2;

  // Draw layers bottom-up (layer 0 = foundation = bottom = widest)
  layers.forEach((layer, i) => {
    const barW = maxWidth - i * widthStep;
    const barX = centerX - barW / 2;
    const barY = SLIDE.content.bottom - (i + 1) * (barH + barGap) + barGap;
    const bgColor = LAYER_COLORS[i % LAYER_COLORS.length];

    // Layer rectangle
    slide.addShape(pptx.ShapeType.rect, {
      x: barX,
      y: barY,
      w: barW,
      h: barH,
      fill: { color: bgColor },
      rectRadius: 0.06,
    });

    // Layer label inside
    slide.addText(layer.label.toUpperCase(), {
      x: barX + 0.15,
      y: barY,
      w: barW - 0.3,
      h: barH * 0.5,
      fontSize: 13,
      fontFace: brand.fonts.body,
      color: brand.colors.white,
      bold: true,
      valign: "bottom",
    });

    // Layer description inside
    slide.addText(layer.description, {
      x: barX + 0.15,
      y: barY + barH * 0.5,
      w: barW - 0.3,
      h: barH * 0.5,
      fontSize: 9,
      fontFace: brand.fonts.body,
      color: brand.colors.pale,
      valign: "top",
    });

    // Connector line to annotation
    const lineY = barY + barH / 2;
    slide.addShape(pptx.ShapeType.line, {
      x: barX + barW,
      y: lineY,
      w: annotLeft - (barX + barW),
      h: 0,
      line: { color: brand.colors.grey30, width: 0.5, dashType: "dash" },
    });

    // Right annotation
    slide.addText(
      [
        { text: `${layer.annotation.bold}\n`, options: { bold: true, color: brand.colors.dark, fontSize: 9.5 } },
        { text: layer.annotation.body, options: { color: brand.colors.grey70, fontSize: 8.5 } },
      ],
      {
        x: annotLeft,
        y: barY + 0.05,
        w: annotWidth,
        h: barH - 0.1,
        fontFace: brand.fonts.body,
        valign: "middle",
      },
    );
  });

  // Left axis label (vertical)
  if (body.leftAxis) {
    slide.addText(`${body.leftAxis} ▲`, {
      x: SLIDE.content.left,
      y: SLIDE.content.top + 0.5,
      w: 0.4,
      h: totalH - 1,
      fontSize: 8,
      fontFace: brand.fonts.body,
      color: brand.colors.grey50,
      bold: true,
      align: "center",
      valign: "middle",
      rotate: 270,
      charSpacing: 2,
    });

    // Vertical arrow
    slide.addShape(pptx.ShapeType.line, {
      x: SLIDE.content.left + 0.2,
      y: SLIDE.content.bottom - 0.3,
      w: 0,
      h: -(totalH - 1),
      line: {
        color: brand.colors.grey30,
        width: 1,
        dashType: "dash",
        headEnd: { type: "arrow", size: 4 },
      },
    });
  }
}
