/**
 * Pattern: Gated Phase Flow
 *
 * Horizontal phase boxes connected by gate arrows.
 * Each phase has a numbered circle, title, duration, bullets, and gate label.
 * Detail grid below the flow with column headings.
 * Optional EyeOn advantage callout at the bottom.
 *
 * Visual design proven in scripts/ref-gated-flow.ts — consulting-quality output.
 */

import type { BrandConfig, PptxSlide, PptxInstance, GatedFlowBody } from "../types";
import { SLIDE } from "../assets";

/** Subtle navy gradation — darker than the old 4-color palette */
const PHASE_COLORS = ["0B1F3A", "0F2845", "132C53"];

/** Blue accent for EyeOn advantage text (not in BrandConfig yet) */
const ACCENT_BLUE = "1B4F8A";

export function renderGatedFlow(
  slide: PptxSlide,
  pptx: PptxInstance,
  body: GatedFlowBody,
  brand: BrandConfig,
): void {
  const phases = body.phases;
  const count = phases.length;
  if (count === 0) return;

  // Layout constants — wider gate zone for better breathing room
  const gateW = 0.8;
  const boxGap = gateW + 0.15;
  const totalGaps = (count - 1) * boxGap;
  const boxW = (SLIDE.content.width - totalGaps) / count;
  const boxH = 2.2;
  const boxY = SLIDE.content.top + 0.1;

  phases.forEach((phase, i) => {
    const boxX = SLIDE.content.left + i * (boxW + boxGap);
    const bgColor = PHASE_COLORS[i % PHASE_COLORS.length];

    // ── Phase box — rounded rect with drop shadow ──
    slide.addShape(pptx.ShapeType.roundRect, {
      x: boxX,
      y: boxY,
      w: boxW,
      h: boxH,
      fill: { color: bgColor },
      rectRadius: 0.06,
      shadow: {
        type: "outer",
        blur: 4,
        offset: 2,
        color: "000000",
        opacity: 0.12,
      },
    });

    // ── Number circle — slightly larger for visual weight ──
    const circleSize = 0.36;
    const circleX = boxX + 0.2;
    const circleY = boxY + 0.18;

    slide.addShape(pptx.ShapeType.ellipse, {
      x: circleX,
      y: circleY,
      w: circleSize,
      h: circleSize,
      fill: { color: brand.colors.white },
    });
    slide.addText(String(phase.number), {
      x: circleX,
      y: circleY,
      w: circleSize,
      h: circleSize,
      fontSize: 14,
      fontFace: brand.fonts.body,
      color: bgColor,
      bold: true,
      align: "center",
      valign: "middle",
    });

    // ── Phase title — bold white, to the right of circle ──
    slide.addText(phase.title, {
      x: circleX + circleSize + 0.12,
      y: circleY - 0.02,
      w: boxW - circleSize - 0.55,
      h: 0.22,
      fontSize: 11.5,
      fontFace: brand.fonts.body,
      color: brand.colors.white,
      bold: true,
      valign: "middle",
    });

    // ── Duration text — lighter, below title ──
    const duration = (phase as any).duration;
    if (duration) {
      slide.addText(duration, {
        x: circleX + circleSize + 0.12,
        y: circleY + 0.2,
        w: boxW - circleSize - 0.55,
        h: 0.18,
        fontSize: 9,
        fontFace: brand.fonts.body,
        color: brand.colors.pale,
        valign: "middle",
      });
    }

    // ── Separator line inside box — semi-transparent ──
    const sepY = boxY + 0.72;
    slide.addShape(pptx.ShapeType.line, {
      x: boxX + 0.2,
      y: sepY,
      w: boxW - 0.4,
      h: 0,
      line: { color: "FFFFFF", width: 0.4, transparency: 60 },
    });

    // ── Bullets ──
    const bulletY = sepY + 0.12;
    const bulletH = boxH - (bulletY - boxY) - 0.15;
    const bulletText = phase.bullets.map((b) => `${b}`).join("\n");

    slide.addText(bulletText, {
      x: boxX + 0.22,
      y: bulletY,
      w: boxW - 0.44,
      h: bulletH,
      fontSize: 9,
      fontFace: brand.fonts.body,
      color: brand.colors.pale,
      lineSpacingMultiple: 1.35,
      valign: "top",
      paraSpaceAfter: 4,
      autoFit: true,
    });

    // ── Gate arrow to next phase ──
    if (i < count - 1 && phase.gate) {
      const arrowStartX = boxX + boxW + 0.08;
      const arrowY = boxY + boxH / 2 - 0.05;
      const arrowLen = gateW - 0.16;

      // Arrow line with endArrowType
      slide.addShape(pptx.ShapeType.line, {
        x: arrowStartX,
        y: arrowY,
        w: arrowLen,
        h: 0,
        line: {
          color: brand.colors.grey30,
          width: 1.2,
          endArrowType: "arrow",
        },
      });

      // Gate label — NOT italic
      slide.addText(phase.gate, {
        x: arrowStartX - 0.15,
        y: arrowY + 0.12,
        w: gateW + 0.1,
        h: 0.55,
        fontSize: 7.5,
        fontFace: brand.fonts.body,
        color: brand.colors.grey50,
        align: "center",
        valign: "top",
        italic: false,
        lineSpacingMultiple: 1.2,
      });
    }
  });

  // ── Detail Grid Below Flow ──────────────────────────────────────
  if (body.details && body.details.length > 0) {
    const detailY = boxY + boxH + 0.35;
    const detailW = (SLIDE.content.width - totalGaps) / count;

    // Top border for detail section
    slide.addShape(pptx.ShapeType.line, {
      x: SLIDE.content.left,
      y: detailY - 0.08,
      w: SLIDE.content.width,
      h: 0,
      line: { color: brand.colors.grey10, width: 0.75 },
    });

    body.details.forEach((detail) => {
      const colIdx = detail.column;
      if (colIdx >= count) return;
      const detailX = SLIDE.content.left + colIdx * (detailW + boxGap);

      // Column heading — bold with underline (if heading present)
      const heading = (detail as any).heading;
      if (heading) {
        slide.addText(heading, {
          x: detailX,
          y: detailY,
          w: detailW,
          h: 0.22,
          fontSize: 10,
          fontFace: brand.fonts.body,
          color: brand.colors.dark,
          bold: true,
          underline: { style: "sng" },
        });
      }

      // Detail items — bold label + body text (cap at 3 to prevent overflow)
      const itemStartY = heading ? detailY + 0.3 : detailY;
      const maxItems = Math.min(detail.items.length, 3);
      detail.items.slice(0, maxItems).forEach((item, ii) => {
        const itemY = itemStartY + ii * 0.52;
        // Guard: don't render below the slide bottom
        if (itemY + 0.48 > SLIDE.content.bottom + 0.8) return;

        slide.addText(
          [
            {
              text: `${item.bold}\n`,
              options: {
                bold: true,
                color: brand.colors.dark,
                fontSize: 9,
              },
            },
            {
              text: item.body,
              options: {
                color: brand.colors.grey70,
                fontSize: 8.5,
                lineSpacingMultiple: 1.2,
              },
            },
          ],
          {
            x: detailX,
            y: itemY,
            w: detailW - 0.1,
            h: 0.48,
            fontFace: brand.fonts.body,
            valign: "top",
            autoFit: true,
          },
        );
      });
    });
  }

  // ── EyeOn Advantage Callout ──────────────────────────────────────
  const eyeonAdvantage = (body as any).eyeonAdvantage;
  if (eyeonAdvantage) {
    const advantageY = 6.22;
    slide.addText(
      [
        {
          text: "EyeOn advantage: ",
          options: {
            bold: true,
            color: ACCENT_BLUE,
            fontSize: 8.5,
            italic: true,
          },
        },
        {
          text: eyeonAdvantage,
          options: {
            color: brand.colors.grey70,
            fontSize: 8.5,
            italic: true,
          },
        },
      ],
      {
        x: SLIDE.content.left,
        y: advantageY,
        w: SLIDE.content.width / 2.5,
        h: 0.25,
        fontFace: brand.fonts.body,
        valign: "top",
      },
    );
  }
}
