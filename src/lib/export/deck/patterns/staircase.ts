/**
 * Pattern: Staircase
 *
 * Five (or N) horizontal bars stacking upward, each narrower than below.
 * Right-side annotations per step. Optional scope bracket at bottom.
 */

import type { BrandConfig, PptxSlide, PptxInstance, StaircaseBody } from "../types";
import { SLIDE } from "../assets";

const STAIR_COLORS = ["0B1F3A", "1B3A5C", "2C5F8A", "4A90C4", "A8C8E8"];

export function renderStaircase(
  slide: PptxSlide,
  pptx: PptxInstance,
  body: StaircaseBody,
  brand: BrandConfig,
): void {
  const steps = body.steps;
  const count = steps.length;
  if (count === 0) return;

  const stairX = SLIDE.content.left;
  const barGap = 0.1;
  const stairBarH = 0.6;
  const stairBaseY = SLIDE.content.bottom - 0.8;
  // Leave 4.2" on the right for annotations — prevents bars overlapping text
  const maxWidth = 7.8;
  const minWidth = Math.max(3.5, maxWidth * 0.5);
  const widthStep = count > 1 ? (maxWidth - minWidth) / (count - 1) : 0;
  const annotLeft = stairX + maxWidth + 0.4;
  const annotWidth = SLIDE.content.right - annotLeft;

  steps.forEach((step, i) => {
    const barW = maxWidth - i * widthStep;
    const barY = stairBaseY - i * (stairBarH + barGap);
    const bgColor = STAIR_COLORS[i % STAIR_COLORS.length];

    // Bar
    slide.addShape(pptx.ShapeType.roundRect, {
      x: stairX,
      y: barY,
      w: barW,
      h: stairBarH,
      fill: { color: bgColor },
      rectRadius: 0.06,
      shadow: { type: "outer", blur: 3, offset: 1.5, color: "000000", opacity: 0.1 },
    });

    // Title inside bar
    slide.addText(step.title, {
      x: stairX + 0.2,
      y: barY,
      w: barW - 0.4,
      h: stairBarH * 0.55,
      fontSize: 12,
      fontFace: brand.fonts.body,
      color: brand.colors.white,
      bold: true,
      valign: "bottom",
      autoFit: true,
    });

    // Subtitle inside bar
    slide.addText(step.subtitle, {
      x: stairX + 0.2,
      y: barY + stairBarH * 0.5,
      w: barW - 0.4,
      h: stairBarH * 0.45,
      fontSize: 9,
      fontFace: brand.fonts.body,
      color: brand.colors.pale,
      valign: "top",
      autoFit: true,
    });

    // Connector to annotation — dashed for cleaner look
    const lineY = barY + stairBarH / 2;
    const connectorW = annotLeft - (stairX + barW) - 0.1;
    if (connectorW > 0.05) {
      slide.addShape(pptx.ShapeType.line, {
        x: stairX + barW,
        y: lineY,
        w: connectorW,
        h: 0,
        line: { color: brand.colors.grey30, width: 0.5, dashType: "dash" },
      });
    }

    // Annotation
    slide.addText(
      [
        { text: `${step.annotation.bold}\n`, options: { bold: true, color: brand.colors.dark, fontSize: 9 } },
        { text: step.annotation.detail, options: { color: brand.colors.grey70, fontSize: 8.5, italic: true } },
      ],
      {
        x: annotLeft,
        y: barY,
        w: annotWidth,
        h: stairBarH,
        fontFace: brand.fonts.body,
        valign: "middle",
        autoFit: true,
      },
    );
  });

  // Scope bracket at bottom
  if (body.scopeLabel) {
    const bracketY = stairBaseY + stairBarH + 0.15;
    slide.addShape(pptx.ShapeType.line, {
      x: stairX,
      y: bracketY,
      w: maxWidth,
      h: 0,
      line: { color: brand.colors.dark, width: 1.2 },
    });

    slide.addText(body.scopeLabel, {
      x: stairX,
      y: bracketY + 0.05,
      w: maxWidth,
      h: 0.25,
      fontSize: 9,
      fontFace: brand.fonts.body,
      color: brand.colors.dark,
      bold: true,
      align: "center",
    });
  }
}
