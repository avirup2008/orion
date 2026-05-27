/**
 * Pattern: Content Card Grid
 *
 * 2x2, 2x3, or 3x3 cards with accent bars, optional metric callouts.
 * Good for feature summaries, capability overviews, team profiles.
 */

import type { BrandConfig, PptxSlide, PptxInstance, ContentCardsBody } from "../types";
import { SLIDE } from "../assets";

const CARD_ACCENTS = ["0B1F3A", "1B3A5C", "2C5F8A", "4A90C4", "A8C8E8", "7B6FAB"];

export function renderContentCards(
  slide: PptxSlide,
  pptx: PptxInstance,
  body: ContentCardsBody,
  brand: BrandConfig,
): void {
  const cards = body.cards;
  if (cards.length === 0) return;

  const cols = body.columns || (cards.length <= 4 ? 2 : 3);
  const rows = Math.ceil(cards.length / cols);
  const cardGapX = 0.2;
  const cardGapY = 0.2;
  const cardW = (SLIDE.content.width - (cols - 1) * cardGapX) / cols;
  const maxCardH = (SLIDE.content.height - (rows - 1) * cardGapY) / rows;
  // Allow cards up to 2.5" to give breathing room for metrics + body
  const cardH = Math.min(maxCardH, 2.5);
  // Scale metric font based on available card height
  const metricFontSize = cardH < 1.8 ? 18 : cardH < 2.2 ? 22 : 26;

  cards.forEach((card, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cx = SLIDE.content.left + col * (cardW + cardGapX);
    const cy = SLIDE.content.top + row * (cardH + cardGapY);
    const accent = card.accentColor || CARD_ACCENTS[i % CARD_ACCENTS.length];

    // Card background
    slide.addShape(pptx.ShapeType.roundRect, {
      x: cx,
      y: cy,
      w: cardW,
      h: cardH,
      rectRadius: 0.06,
      fill: { color: brand.colors.white },
      line: { color: brand.colors.grey10, width: 0.75 },
      shadow: { type: "outer", blur: 3, offset: 1.5, color: "000000", opacity: 0.1 },
    });

    // Top accent bar
    slide.addShape(pptx.ShapeType.rect, {
      x: cx,
      y: cy,
      w: cardW,
      h: 0.05,
      rectRadius: 0.03,
      fill: { color: accent },
    });

    // Metric callout (if present)
    let titleY = cy + 0.15;
    if (card.metric) {
      slide.addText(card.metric.value, {
        x: cx + 0.15,
        y: cy + 0.12,
        w: cardW - 0.3,
        h: 0.35,
        fontSize: metricFontSize,
        fontFace: brand.fonts.heading,
        color: accent,
        bold: true,
        autoFit: true,
      });
      slide.addText(card.metric.label, {
        x: cx + 0.15,
        y: cy + 0.45,
        w: cardW - 0.3,
        h: 0.18,
        fontSize: 8,
        fontFace: brand.fonts.body,
        color: brand.colors.grey50,
        autoFit: true,
      });
      titleY = cy + 0.68;
    }

    // Card title
    slide.addText(card.title, {
      x: cx + 0.15,
      y: titleY,
      w: cardW - 0.3,
      h: 0.28,
      fontSize: 11,
      fontFace: brand.fonts.body,
      color: brand.colors.dark,
      bold: true,
      autoFit: true,
    });

    // Card body text
    const bodyY = titleY + 0.3;
    const bodyH = cardH - (bodyY - cy) - 0.1;
    slide.addText(card.body, {
      x: cx + 0.15,
      y: bodyY,
      w: cardW - 0.3,
      h: Math.max(bodyH, 0.3),
      fontSize: 9,
      fontFace: brand.fonts.body,
      color: brand.colors.grey70,
      lineSpacingMultiple: 1.3,
      valign: "top",
      autoFit: true,
    });
  });
}
