/**
 * Pattern: Gated Phase Flow
 *
 * Horizontal phase boxes connected by gate arrows.
 * Each phase has a numbered circle, title, duration, bullets, and gate label.
 * Detail grid below the flow with column headings.
 * Optional EyeOn advantage callout at the bottom.
 *
 * Adaptive layout: compact mode for 5+ phases (stacked title, smaller gates).
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

  // Adaptive layout: compact mode for 5+ phases
  const compact = count >= 5;
  const gateW = compact ? 0.4 : 0.8;
  const boxGap = gateW + (compact ? 0.08 : 0.15);
  const totalGaps = (count - 1) * boxGap;
  const boxW = (SLIDE.content.width - totalGaps) / count;
  const boxH = compact ? 2.6 : 2.2;
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

    // ── Number circle ──
    const circleSize = compact ? 0.28 : 0.36;

    if (compact) {
      // Compact: circle centered at top, title below
      const circleX = boxX + boxW / 2 - circleSize / 2;
      const circleY = boxY + 0.12;

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
        fontSize: 12,
        fontFace: brand.fonts.body,
        color: bgColor,
        bold: true,
        align: "center",
        valign: "middle",
      });

      // Title below circle — full box width
      slide.addText(phase.title, {
        x: boxX + 0.1,
        y: circleY + circleSize + 0.06,
        w: boxW - 0.2,
        h: 0.22,
        fontSize: 10,
        fontFace: brand.fonts.body,
        color: brand.colors.white,
        bold: true,
        align: "center",
        valign: "middle",
        autoFit: true,
      });

      // Duration text (if present)
      const duration = (phase as Record<string, unknown>).duration as string | undefined;
      if (duration) {
        slide.addText(duration, {
          x: boxX + 0.1,
          y: circleY + circleSize + 0.28,
          w: boxW - 0.2,
          h: 0.16,
          fontSize: 7.5,
          fontFace: brand.fonts.body,
          color: brand.colors.pale,
          align: "center",
          valign: "middle",
        });
      }

      // Separator line
      const sepY = boxY + 0.88;
      slide.addShape(pptx.ShapeType.line, {
        x: boxX + 0.12,
        y: sepY,
        w: boxW - 0.24,
        h: 0,
        line: { color: "FFFFFF", width: 0.4, transparency: 60 },
      });

      // Bullets — limit to 4 max in compact mode
      const bulletY = sepY + 0.1;
      const bulletH = boxH - (bulletY - boxY) - 0.1;
      const maxBullets = Math.min(phase.bullets.length, 4);
      const bulletText = phase.bullets.slice(0, maxBullets).map((b) => `• ${b}`).join("\n");

      slide.addText(bulletText, {
        x: boxX + 0.12,
        y: bulletY,
        w: boxW - 0.24,
        h: bulletH,
        fontSize: 7.5,
        fontFace: brand.fonts.body,
        color: brand.colors.pale,
        lineSpacingMultiple: 1.25,
        valign: "top",
        autoFit: true,
      });
    } else {
      // Standard: circle + title side by side
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

      // Phase title — to the right of circle
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
        autoFit: true,
      });

      // Duration text
      const duration = (phase as Record<string, unknown>).duration as string | undefined;
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

      // Separator line
      const sepY = boxY + 0.72;
      slide.addShape(pptx.ShapeType.line, {
        x: boxX + 0.2,
        y: sepY,
        w: boxW - 0.4,
        h: 0,
        line: { color: "FFFFFF", width: 0.4, transparency: 60 },
      });

      // Bullets
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
    }

    // ── Gate arrow to next phase ──
    if (i < count - 1 && phase.gate) {
      const arrowStartX = boxX + boxW + 0.04;
      const arrowY = boxY + boxH / 2 - 0.05;
      const arrowLen = gateW - 0.08;

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

      // Gate label
      if (!compact) {
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
    }
  });

  // ── Detail Grid Below Flow ──────────────────────────────────────
  // Skip detail grid in compact mode — not enough vertical space
  if (!compact && body.details && body.details.length > 0) {
    const detailY = boxY + boxH + 0.35;
    const detailW = (SLIDE.content.width - totalGaps) / count;

    // Guard: only render if there's room above insight bar (6.5)
    if (detailY < 6.0) {
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

        // Column heading
        const heading = (detail as Record<string, unknown>).heading as string | undefined;
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

        // Detail items — cap to prevent overflow
        const itemStartY = heading ? detailY + 0.3 : detailY;
        const maxItems = Math.min(detail.items.length, 2);
        detail.items.slice(0, maxItems).forEach((item, ii) => {
          const itemY = itemStartY + ii * 0.48;
          // Hard guard: don't render below insight bar
          if (itemY + 0.45 > 6.4) return;

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
              h: 0.44,
              fontFace: brand.fonts.body,
              valign: "top",
              autoFit: true,
            },
          );
        });
      });
    }
  }

  // ── EyeOn Advantage Callout ──────────────────────────────────────
  const eyeonAdvantage = (body as unknown as Record<string, unknown>).eyeonAdvantage as string | undefined;
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
