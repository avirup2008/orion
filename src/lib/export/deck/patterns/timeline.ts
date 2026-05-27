/**
 * Pattern: Timeline
 *
 * Horizontal milestone flow with duration labels.
 * Highlighted milestones get accent treatment.
 */

import type { BrandConfig, PptxSlide, PptxInstance, TimelineBody } from "../types";
import { SLIDE } from "../assets";

const MILESTONE_COLORS = ["0B1F3A", "1B3A5C", "2C5F8A", "4A90C4", "A8C8E8"];

export function renderTimeline(
  slide: PptxSlide,
  pptx: PptxInstance,
  body: TimelineBody,
  brand: BrandConfig,
): void {
  const milestones = body.milestones;
  const count = milestones.length;
  if (count === 0) return;

  const lineY = SLIDE.content.top + SLIDE.content.height / 2;
  const nodeGap = 0.3;
  const nodeW = (SLIDE.content.width - (count - 1) * nodeGap) / count;
  const nodeH = 1.4;

  // Main timeline line
  slide.addShape(pptx.ShapeType.line, {
    x: SLIDE.content.left,
    y: lineY,
    w: SLIDE.content.width,
    h: 0,
    line: { color: brand.colors.grey30, width: 1.5 },
  });

  milestones.forEach((ms, i) => {
    const nx = SLIDE.content.left + i * (nodeW + nodeGap);
    const color = ms.highlighted
      ? brand.colors.dark
      : MILESTONE_COLORS[i % MILESTONE_COLORS.length];

    // Node circle on the line
    const circleR = 0.2;
    slide.addShape(pptx.ShapeType.ellipse, {
      x: nx + nodeW / 2 - circleR,
      y: lineY - circleR,
      w: circleR * 2,
      h: circleR * 2,
      fill: { color },
    });

    // Step number inside circle
    slide.addText(String(i + 1), {
      x: nx + nodeW / 2 - circleR,
      y: lineY - circleR,
      w: circleR * 2,
      h: circleR * 2,
      fontSize: 10,
      fontFace: brand.fonts.body,
      color: brand.colors.white,
      bold: true,
      align: "center",
      valign: "middle",
    });

    // Content card above the line (odd index) or below (even index)
    const above = i % 2 === 0;
    const cardY = above ? lineY - nodeH - 0.4 : lineY + 0.4;

    // Card
    slide.addShape(pptx.ShapeType.roundRect, {
      x: nx,
      y: cardY,
      w: nodeW,
      h: nodeH,
      rectRadius: 0.06,
      fill: { color: brand.colors.white },
      line: {
        color: ms.highlighted ? brand.colors.dark : brand.colors.grey10,
        width: ms.highlighted ? 1.2 : 0.75,
      },
      shadow: { type: "outer", blur: 3, offset: 1.5, color: "000000", opacity: 0.1 },
    });

    // Top accent strip
    slide.addShape(pptx.ShapeType.rect, {
      x: nx,
      y: cardY,
      w: nodeW,
      h: 0.05,
      fill: { color },
      rectRadius: 0.03,
    });

    // Duration badge
    slide.addShape(pptx.ShapeType.roundRect, {
      x: nx + 0.1,
      y: cardY + 0.12,
      w: nodeW * 0.55,
      h: 0.22,
      fill: { color: brand.colors.wash },
      rectRadius: 0.11,
    });
    slide.addText(ms.duration, {
      x: nx + 0.1,
      y: cardY + 0.12,
      w: nodeW * 0.55,
      h: 0.22,
      fontSize: 7.5,
      fontFace: brand.fonts.body,
      color: brand.colors.steel,
      bold: true,
      align: "center",
      valign: "middle",
    });

    // Label
    slide.addText(ms.label, {
      x: nx + 0.1,
      y: cardY + 0.4,
      w: nodeW - 0.2,
      h: 0.3,
      fontSize: 11,
      fontFace: brand.fonts.body,
      color: brand.colors.dark,
      bold: true,
      autoFit: true,
    });

    // Description
    slide.addText(ms.description, {
      x: nx + 0.1,
      y: cardY + 0.72,
      w: nodeW - 0.2,
      h: nodeH - 0.85,
      fontSize: 8.5,
      fontFace: brand.fonts.body,
      color: brand.colors.grey70,
      lineSpacingMultiple: 1.3,
      valign: "top",
      autoFit: true,
    });

    // Connector from card to node
    const connY1 = above ? cardY + nodeH : cardY;
    const connY2 = above ? lineY - circleR : lineY + circleR;
    slide.addShape(pptx.ShapeType.line, {
      x: nx + nodeW / 2,
      y: connY1,
      w: 0,
      h: connY2 - connY1,
      line: { color: brand.colors.grey30, width: 0.5, dashType: "dash" },
    });
  });

  // Total duration label
  if (body.totalDuration) {
    slide.addText(`Total: ${body.totalDuration}`, {
      x: SLIDE.content.right - 2.5,
      y: lineY + 0.25,
      w: 2.5,
      h: 0.25,
      fontSize: 9,
      fontFace: brand.fonts.body,
      color: brand.colors.dark,
      bold: true,
      align: "right",
    });
  }
}
