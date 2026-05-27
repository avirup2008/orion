/**
 * Pattern: Architecture Flow
 *
 * 3-5 vertical columns with flow arrows between them.
 * Each column has a zone label pill, optional container, and cards.
 */

import type { BrandConfig, PptxSlide, PptxInstance, ArchitectureFlowBody } from "../types";
import { SLIDE } from "../assets";

const ACCENT_COLORS = ["0B1F3A", "1B3A5C", "2C5F8A", "4A90C4", "A8C8E8"];

export function renderArchitectureFlow(
  slide: PptxSlide,
  pptx: PptxInstance,
  body: ArchitectureFlowBody,
  brand: BrandConfig,
): void {
  const columns = body.columns;
  const count = columns.length;
  if (count === 0) return;

  const colGap = 0.25;
  const colW = (SLIDE.content.width - (count - 1) * colGap) / count;
  const colXPositions: number[] = [];
  for (let c = 0; c < count; c++) {
    colXPositions.push(SLIDE.content.left + c * (colW + colGap));
  }

  const topY = SLIDE.content.top + 0.1;
  const cardStartY = topY + 0.45;
  const contentH = SLIDE.content.bottom - cardStartY - 0.3;

  columns.forEach((col, i) => {
    const cx = colXPositions[i];

    // Zone label pill
    slide.addShape(pptx.ShapeType.roundRect, {
      x: cx + 0.1,
      y: topY,
      w: colW - 0.2,
      h: 0.28,
      fill: { color: brand.colors.dark },
      rectRadius: 0.14,
    });
    slide.addText(col.zoneLabel.toUpperCase(), {
      x: cx + 0.1,
      y: topY,
      w: colW - 0.2,
      h: 0.28,
      fontSize: 7,
      fontFace: brand.fonts.body,
      color: brand.colors.white,
      bold: true,
      align: "center",
      valign: "middle",
      charSpacing: 1,
    });

    // Container box (if containerTitle exists)
    if (col.containerTitle) {
      slide.addShape(pptx.ShapeType.roundRect, {
        x: cx,
        y: cardStartY,
        w: colW,
        h: contentH,
        rectRadius: 0.08,
        fill: { color: brand.colors.ice },
        line: { color: brand.colors.dark, width: 1.2 },
        shadow: { type: "outer", blur: 3, offset: 1.5, color: "000000", opacity: 0.1 },
      });

      // Top accent bar on container
      slide.addShape(pptx.ShapeType.rect, {
        x: cx,
        y: cardStartY,
        w: colW,
        h: 0.06,
        rectRadius: 0.03,
        fill: { color: brand.colors.dark },
      });

      // Container title
      slide.addText(col.containerTitle, {
        x: cx + 0.1,
        y: cardStartY + 0.1,
        w: colW - 0.2,
        h: 0.25,
        fontSize: 8,
        fontFace: brand.fonts.body,
        color: brand.colors.dark,
        bold: true,
        align: "center",
      });
    }

    // Cards inside column
    const cardY0 = col.containerTitle ? cardStartY + 0.42 : cardStartY + 0.1;
    const cardAvailH = contentH - (col.containerTitle ? 0.55 : 0.2);
    const cardCount = col.cards.length;
    const cardGap = 0.08;
    const cardH = cardCount > 0
      ? Math.min(0.55, (cardAvailH - (cardCount - 1) * cardGap) / cardCount)
      : 0.55;

    col.cards.forEach((card, ci) => {
      const cy = cardY0 + ci * (cardH + cardGap);
      const accent = card.accentColor || ACCENT_COLORS[ci % ACCENT_COLORS.length];

      if (card.dashed) {
        // Dashed = future/TBD
        slide.addShape(pptx.ShapeType.roundRect, {
          x: cx + 0.08,
          y: cy,
          w: colW - 0.16,
          h: cardH,
          rectRadius: 0.06,
          fill: { color: brand.colors.white },
          line: { color: brand.colors.pale, width: 0.75, dashType: "dash" },
          shadow: { type: "outer", blur: 3, offset: 1.5, color: "000000", opacity: 0.1 },
        });
      } else {
        // Solid card with left accent
        slide.addShape(pptx.ShapeType.roundRect, {
          x: cx + 0.08,
          y: cy,
          w: colW - 0.16,
          h: cardH,
          rectRadius: 0.06,
          fill: { color: brand.colors.white },
          line: { color: brand.colors.grey10, width: 0.75 },
          shadow: { type: "outer", blur: 3, offset: 1.5, color: "000000", opacity: 0.1 },
        });
        // Left accent strip
        slide.addShape(pptx.ShapeType.rect, {
          x: cx + 0.08,
          y: cy + 0.04,
          w: 0.06,
          h: cardH - 0.08,
          rectRadius: 0.03,
          fill: { color: accent },
        });
      }

      // Card text
      slide.addText(
        [
          { text: `${card.title}\n`, options: { fontSize: 9, bold: true, color: brand.colors.dark } },
          { text: card.subtitle, options: { fontSize: 7.5, color: brand.colors.steel } },
        ],
        {
          x: cx + 0.22,
          y: cy,
          w: colW - 0.38,
          h: cardH,
          fontFace: brand.fonts.body,
          valign: "middle",
          autoFit: true,
        },
      );
    });

    // Flow arrow to next column
    if (i < count - 1) {
      const arrowX = cx + colW + 0.02;
      const arrowW = colGap - 0.04;
      const arrowY = cardStartY + contentH / 2;

      slide.addShape(pptx.ShapeType.line, {
        x: arrowX,
        y: arrowY,
        w: arrowW,
        h: 0,
        line: {
          color: brand.colors.dark,
          width: 1.5,
          headEnd: { type: "arrow", size: 6 },
        },
      });
    }
  });

  // Legend bar
  if (body.legend && body.legend.length > 0) {
    let legendX = SLIDE.content.left;
    const legendY = SLIDE.content.bottom - 0.05;

    body.legend.forEach((item) => {
      slide.addShape(pptx.ShapeType.rect, {
        x: legendX,
        y: legendY,
        w: 0.28,
        h: 0.14,
        rectRadius: 0.03,
        fill: { color: item.color },
      });
      slide.addText(item.label, {
        x: legendX + 0.33,
        y: legendY - 0.02,
        w: 1.2,
        h: 0.18,
        fontSize: 7,
        fontFace: brand.fonts.body,
        color: brand.colors.dark,
      });
      legendX += 1.8;
    });
  }
}
