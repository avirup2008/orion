/**
 * Pattern: Metrics Dashboard
 *
 * KPI tiles with large numbers, labels, and optional sub-labels.
 * Below the metrics: supporting bullet points.
 */

import type { BrandConfig, PptxSlide, PptxInstance, MetricsDashboardBody } from "../types";
import { SLIDE } from "../assets";

const METRIC_ACCENTS = ["0B1F3A", "1B3A5C", "2C5F8A", "4A90C4", "A8C8E8", "7A9461"];

export function renderMetricsDashboard(
  slide: PptxSlide,
  pptx: PptxInstance,
  body: MetricsDashboardBody,
  brand: BrandConfig,
): void {
  const metrics = body.metrics;
  if (metrics.length === 0) return;

  const cols = Math.min(metrics.length, 4);
  const rows = Math.ceil(metrics.length / cols);
  const tileGap = 0.2;
  const tileW = (SLIDE.content.width - (cols - 1) * tileGap) / cols;
  const tileH = rows > 1 ? 1.5 : 2.0;
  const startY = SLIDE.content.top + 0.1;

  metrics.forEach((metric, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const tx = SLIDE.content.left + col * (tileW + tileGap);
    const ty = startY + row * (tileH + tileGap);
    const accent = metric.color || METRIC_ACCENTS[i % METRIC_ACCENTS.length];

    // Tile background
    slide.addShape(pptx.ShapeType.rect, {
      x: tx,
      y: ty,
      w: tileW,
      h: tileH,
      rectRadius: 0.08,
      fill: { color: brand.colors.ice },
      line: { color: brand.colors.grey10, width: 0.75 },
    });

    // Left accent strip
    slide.addShape(pptx.ShapeType.rect, {
      x: tx,
      y: ty + 0.08,
      w: 0.06,
      h: tileH - 0.16,
      rectRadius: 0.03,
      fill: { color: accent },
    });

    // Big number
    slide.addText(metric.value, {
      x: tx + 0.25,
      y: ty + 0.15,
      w: tileW - 0.4,
      h: 0.6,
      fontSize: 36,
      fontFace: brand.fonts.heading,
      color: accent,
      bold: true,
    });

    // Label
    slide.addText(metric.label, {
      x: tx + 0.25,
      y: ty + 0.75,
      w: tileW - 0.4,
      h: 0.3,
      fontSize: 11,
      fontFace: brand.fonts.body,
      color: brand.colors.dark,
      bold: true,
    });

    // Sublabel
    if (metric.sublabel) {
      slide.addText(metric.sublabel, {
        x: tx + 0.25,
        y: ty + 1.05,
        w: tileW - 0.4,
        h: 0.3,
        fontSize: 8.5,
        fontFace: brand.fonts.body,
        color: brand.colors.grey50,
      });
    }
  });

  // Supporting bullets below metrics
  if (body.bullets && body.bullets.length > 0) {
    const bulletY = startY + rows * (tileH + tileGap) + 0.2;

    // Separator
    slide.addShape(pptx.ShapeType.line, {
      x: SLIDE.content.left,
      y: bulletY - 0.1,
      w: SLIDE.content.width,
      h: 0,
      line: { color: brand.colors.grey10, width: 0.5 },
    });

    const bulletText = body.bullets.map((b) => `•  ${b}`).join("\n");
    slide.addText(bulletText, {
      x: SLIDE.content.left + 0.1,
      y: bulletY,
      w: SLIDE.content.width - 0.2,
      h: SLIDE.content.bottom - bulletY - 0.2,
      fontSize: 9,
      fontFace: brand.fonts.body,
      color: brand.colors.grey70,
      lineSpacingMultiple: 1.4,
      valign: "top",
    });
  }
}
