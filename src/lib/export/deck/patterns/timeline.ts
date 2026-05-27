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

  // Adaptive layout: compact mode for 5+ milestones
  const compact = count >= 5;
  const nodeGap = compact ? 0.12 : 0.3;
  const nodeW = (SLIDE.content.width - (count - 1) * nodeGap) / count;
  const circleR = compact ? 0.15 : 0.2;
  const cardLineGap = compact ? 0.25 : 0.4;
  // Taller cards in compact mode to fit description text
  const nodeH = compact ? 1.55 : 1.4;

  const lineY = SLIDE.content.top + SLIDE.content.height / 2;

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
      fontSize: compact ? 8 : 10,
      fontFace: brand.fonts.body,
      color: brand.colors.white,
      bold: true,
      align: "center",
      valign: "middle",
    });

    // Content card above the line (even index) or below (odd index)
    const above = i % 2 === 0;
    const cardY = above ? lineY - nodeH - cardLineGap : lineY + cardLineGap;

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
    const badgeW = compact ? nodeW * 0.65 : nodeW * 0.55;
    slide.addShape(pptx.ShapeType.roundRect, {
      x: nx + 0.08,
      y: cardY + 0.1,
      w: badgeW,
      h: 0.2,
      fill: { color: brand.colors.wash },
      rectRadius: 0.1,
    });
    slide.addText(ms.duration, {
      x: nx + 0.08,
      y: cardY + 0.1,
      w: badgeW,
      h: 0.2,
      fontSize: compact ? 7 : 7.5,
      fontFace: brand.fonts.body,
      color: brand.colors.steel,
      bold: true,
      align: "center",
      valign: "middle",
    });

    // Label
    const labelY = cardY + (compact ? 0.34 : 0.4);
    const labelH = compact ? 0.24 : 0.3;
    slide.addText(ms.label, {
      x: nx + 0.08,
      y: labelY,
      w: nodeW - 0.16,
      h: labelH,
      fontSize: compact ? 9.5 : 11,
      fontFace: brand.fonts.body,
      color: brand.colors.dark,
      bold: true,
      autoFit: true,
    });

    // Description — use remaining card height, clamp to card boundary
    const descY = labelY + labelH + 0.04;
    const descH = Math.max(nodeH - (descY - cardY) - 0.08, 0.3);
    slide.addText(ms.description, {
      x: nx + 0.08,
      y: descY,
      w: nodeW - 0.16,
      h: descH,
      fontSize: compact ? 7.5 : 8.5,
      fontFace: brand.fonts.body,
      color: brand.colors.grey70,
      lineSpacingMultiple: compact ? 1.15 : 1.3,
      valign: "top",
      autoFit: true,
    });

    // Connector from card to node
    const connY1 = above ? cardY + nodeH : cardY;
    const connY2 = above ? lineY - circleR : lineY + circleR;
    if (Math.abs(connY2 - connY1) > 0.02) {
      slide.addShape(pptx.ShapeType.line, {
        x: nx + nodeW / 2,
        y: Math.min(connY1, connY2),
        w: 0,
        h: Math.abs(connY2 - connY1),
        line: { color: brand.colors.grey30, width: 0.5, dashType: "dash" },
      });
    }
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
