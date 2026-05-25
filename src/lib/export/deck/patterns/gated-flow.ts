/**
 * Pattern: Gated Phase Flow
 *
 * Horizontal phase boxes connected by gate arrows.
 * Each phase has a numbered circle, title, bullets, and gate label.
 * Detail grid below the flow.
 */

import type { BrandConfig, PptxSlide, PptxInstance, GatedFlowBody } from "../types";
import { SLIDE } from "../assets";

const PHASE_COLORS = ["0B1F3A", "1B3A5C", "2C5F8A", "4A90C4"];

export function renderGatedFlow(
  slide: PptxSlide,
  pptx: PptxInstance,
  body: GatedFlowBody,
  brand: BrandConfig,
): void {
  const phases = body.phases;
  const count = phases.length;
  if (count === 0) return;

  const gateW = 0.6;
  const boxGap = gateW + 0.2;
  const totalGaps = (count - 1) * boxGap;
  const boxW = (SLIDE.content.width - totalGaps) / count;
  const boxH = 2.2;
  const boxY = SLIDE.content.top + 0.2;

  phases.forEach((phase, i) => {
    const boxX = SLIDE.content.left + i * (boxW + boxGap);
    const bgColor = PHASE_COLORS[i % PHASE_COLORS.length];

    // Phase box
    slide.addShape(pptx.ShapeType.rect, {
      x: boxX,
      y: boxY,
      w: boxW,
      h: boxH,
      fill: { color: bgColor },
      rectRadius: 0.08,
    });

    // Number circle
    const circleSize = 0.32;
    slide.addShape(pptx.ShapeType.ellipse, {
      x: boxX + 0.15,
      y: boxY + 0.15,
      w: circleSize,
      h: circleSize,
      fill: { color: brand.colors.white },
    });
    slide.addText(String(phase.number), {
      x: boxX + 0.15,
      y: boxY + 0.15,
      w: circleSize,
      h: circleSize,
      fontSize: 12,
      fontFace: brand.fonts.body,
      color: bgColor,
      bold: true,
      align: "center",
      valign: "middle",
    });

    // Phase title
    slide.addText(phase.title, {
      x: boxX + 0.55,
      y: boxY + 0.15,
      w: boxW - 0.7,
      h: 0.32,
      fontSize: 12,
      fontFace: brand.fonts.body,
      color: brand.colors.white,
      bold: true,
      valign: "middle",
    });

    // Divider inside box
    slide.addShape(pptx.ShapeType.line, {
      x: boxX + 0.15,
      y: boxY + 0.55,
      w: boxW - 0.3,
      h: 0,
      line: { color: brand.colors.white + "", width: 0.3 },
    });

    // Bullets
    const bulletText = phase.bullets
      .map((b) => `•  ${b}`)
      .join("\n");
    slide.addText(bulletText, {
      x: boxX + 0.15,
      y: boxY + 0.65,
      w: boxW - 0.3,
      h: boxH - 0.85,
      fontSize: 9,
      fontFace: brand.fonts.body,
      color: brand.colors.pale,
      lineSpacingMultiple: 1.3,
      valign: "top",
    });

    // Gate arrow to next phase
    if (i < count - 1 && phase.gate) {
      const arrowX = boxX + boxW + 0.1;
      const arrowY = boxY + boxH / 2;

      // Arrow line
      slide.addShape(pptx.ShapeType.line, {
        x: arrowX,
        y: arrowY,
        w: gateW - 0.2,
        h: 0,
        line: {
          color: brand.colors.dark,
          width: 1.5,
          headEnd: { type: "arrow", size: 6 },
        },
      });

      // Gate label
      slide.addText(phase.gate, {
        x: arrowX - 0.1,
        y: arrowY + 0.15,
        w: gateW,
        h: 0.2,
        fontSize: 7,
        fontFace: brand.fonts.body,
        color: brand.colors.grey50,
        align: "center",
        italic: true,
      });
    }
  });

  // Detail grid below the flow
  if (body.details && body.details.length > 0) {
    const detailY = boxY + boxH + 0.4;

    // Top border for detail section
    slide.addShape(pptx.ShapeType.line, {
      x: SLIDE.content.left,
      y: detailY - 0.1,
      w: SLIDE.content.width,
      h: 0,
      line: { color: brand.colors.grey10, width: 0.75 },
    });

    body.details.forEach((detail) => {
      const colIdx = detail.column;
      if (colIdx >= count) return;
      const detailX = SLIDE.content.left + colIdx * (boxW + boxGap);

      detail.items.forEach((item, ii) => {
        slide.addText(
          [
            { text: `${item.bold}\n`, options: { bold: true, color: brand.colors.dark, fontSize: 9 } },
            { text: item.body, options: { color: brand.colors.grey70, fontSize: 8.5 } },
          ],
          {
            x: detailX,
            y: detailY + ii * 0.35,
            w: boxW,
            h: 0.32,
            fontFace: brand.fonts.body,
            valign: "top",
          },
        );
      });
    });
  }
}
