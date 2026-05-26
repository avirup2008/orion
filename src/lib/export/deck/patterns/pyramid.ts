/**
 * Pattern: Pyramid / Stacked Layers
 *
 * Bottom-up layering with widest = foundation, narrowing upward.
 * Layers are left-aligned and grow wider rightward.
 * Right-side annotations per layer. Optional left axis label with arrow.
 *
 * Visual design adapted from the consulting-quality reference implementation
 * (scripts/ref-pyramid.ts): rounded rectangles, subtle shadows, proper
 * dark-to-light gradient, and separated annotation title/body.
 */

import type { BrandConfig, PptxSlide, PptxInstance, PyramidBody } from "../types";
import { SLIDE } from "../assets";

/**
 * Layer colors — dark-to-light navy gradient.
 * Index 0 = top (narrowest, darkest), last = bottom (widest, lightest).
 */
const LAYER_COLORS = ["0B1F3A", "132C53", "1B3A5C", "2C5F8A", "4A7DAF"];

export function renderPyramid(
  slide: PptxSlide,
  pptx: PptxInstance,
  body: PyramidBody,
  brand: BrandConfig,
): void {
  const layers = body.layers;
  const count = layers.length;
  if (count === 0) return;

  // ── Layout geometry ───────────────────────────────────────────
  const pyramidLeft = SLIDE.content.left + (body.leftAxis ? 0.6 : 0);
  const annotationRight = SLIDE.content.left + SLIDE.content.width;
  const annotationW = 2.8;
  const maxBoxW = annotationRight - pyramidLeft - annotationW - 0.3;
  const minBoxW = maxBoxW * 0.48;

  const layerH = 0.72;
  const layerGap = 0.12;
  const totalH = count * layerH + (count - 1) * layerGap;
  const startY = SLIDE.content.top + 0.15;

  // ── Draw layers top-down (index 0 = narrowest/top, last = widest/bottom) ──
  layers.forEach((layer, i) => {
    // Width grows linearly from min (top) to max (bottom)
    const ratio = count > 1 ? i / (count - 1) : 1;
    const boxW = minBoxW + ratio * (maxBoxW - minBoxW);
    const boxY = startY + i * (layerH + layerGap);

    // Left-aligned — layers grow rightward from pyramidLeft
    const boxX = pyramidLeft;
    const bgColor = LAYER_COLORS[i % LAYER_COLORS.length];

    // Layer rectangle — rounded with subtle shadow
    slide.addShape(pptx.ShapeType.roundRect, {
      x: boxX,
      y: boxY,
      w: boxW,
      h: layerH,
      fill: { color: bgColor },
      rectRadius: 0.04,
      shadow: {
        type: "outer",
        blur: 2,
        offset: 1,
        color: "000000",
        opacity: 0.08,
      },
    });

    // Layer title — bold white, upper portion
    slide.addText(layer.label.toUpperCase(), {
      x: boxX + 0.2,
      y: boxY + 0.08,
      w: boxW - 0.4,
      h: 0.22,
      fontSize: 10.5,
      fontFace: brand.fonts.body,
      color: brand.colors.white,
      bold: true,
    });

    // Layer description — smaller, pale, lower portion
    slide.addText(layer.description, {
      x: boxX + 0.2,
      y: boxY + 0.32,
      w: boxW - 0.4,
      h: 0.32,
      fontSize: 8.5,
      fontFace: brand.fonts.body,
      color: brand.colors.pale,
      lineSpacingMultiple: 1.15,
    });

    // ── Right-side annotation ─────────────────────────────────
    const annotX = annotationRight - annotationW;
    const connY = boxY + layerH / 2;

    // Dashed connector line from layer edge to annotation area
    slide.addShape(pptx.ShapeType.line, {
      x: boxX + boxW + 0.05,
      y: connY,
      w: annotX - (boxX + boxW) - 0.1,
      h: 0,
      line: {
        color: brand.colors.grey30,
        width: 0.5,
        dashType: "dash",
      },
    });

    // Annotation title — bold, dark
    slide.addText(layer.annotation.bold, {
      x: annotX,
      y: boxY + 0.05,
      w: annotationW,
      h: 0.2,
      fontSize: 9.5,
      fontFace: brand.fonts.body,
      color: brand.colors.dark,
      bold: true,
    });

    // Annotation body — grey
    slide.addText(layer.annotation.body, {
      x: annotX,
      y: boxY + 0.25,
      w: annotationW,
      h: 0.42,
      fontSize: 8.5,
      fontFace: brand.fonts.body,
      color: brand.colors.grey70,
      lineSpacingMultiple: 1.15,
    });
  });

  // ── Left axis label (vertical) ──────────────────────────────
  if (body.leftAxis) {
    const axisX = SLIDE.content.left;
    const axisY = startY + totalH / 2 - 0.5;

    slide.addText(body.leftAxis, {
      x: axisX,
      y: axisY,
      w: 0.45,
      h: 1.0,
      fontSize: 8,
      fontFace: brand.fonts.body,
      color: brand.colors.grey50,
      bold: true,
      charSpacing: 1.5,
      align: "center",
      valign: "middle",
      rotate: 270,
    });

    // Vertical arrow pointing upward along left axis
    slide.addShape(pptx.ShapeType.line, {
      x: axisX + 0.22,
      y: startY - 0.05,
      w: 0,
      h: totalH + 0.1,
      line: {
        color: brand.colors.grey30,
        width: 0.7,
        beginArrowType: "arrow",
      },
    });
  }
}
