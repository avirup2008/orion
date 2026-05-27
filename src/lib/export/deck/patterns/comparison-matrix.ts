/**
 * Pattern: Comparison Matrix
 *
 * Table-style side-by-side evaluation. Headers across top,
 * criteria rows down the left, cells with optional highlighting.
 */

import type { BrandConfig, PptxSlide, PptxInstance, ComparisonMatrixBody } from "../types";
import { SLIDE } from "../assets";

export function renderComparisonMatrix(
  slide: PptxSlide,
  pptx: PptxInstance,
  body: ComparisonMatrixBody,
  brand: BrandConfig,
): void {
  const { headers, rows } = body;
  if (headers.length === 0 || rows.length === 0) return;

  const totalCols = headers.length + 1; // +1 for label column
  const dataCols = headers.length;

  // Adaptive layout: compact mode for dense matrices (6+ rows)
  const compact = rows.length >= 6;
  const labelColW = compact ? 2.2 : 2.5;
  const dataColW = (SLIDE.content.width - labelColW - 0.2) / dataCols;
  const rowGap = compact ? 0.02 : 0.04;
  // Allow taller rows when space permits; cap avoids over-tall rows in sparse matrices
  const rowH = Math.min(
    compact ? 0.5 : 0.65,
    (SLIDE.content.height - 0.5) / (rows.length + 1 + rows.length * rowGap),
  );
  const tableX = SLIDE.content.left;
  const tableY = SLIDE.content.top + 0.1;

  // Header row background
  slide.addShape(pptx.ShapeType.roundRect, {
    x: tableX + labelColW + 0.1,
    y: tableY,
    w: dataCols * dataColW + 0.1,
    h: rowH,
    fill: { color: brand.colors.dark },
    rectRadius: 0.04,
    shadow: { type: "outer", blur: 3, offset: 1.5, color: "000000", opacity: 0.1 },
  });

  // Font sizes adapt to density
  const headerFontSize = compact ? 8.5 : 10;
  const labelFontSize = compact ? 8 : 9.5;
  const cellFontSize = compact ? 7.5 : 9;

  // Header labels
  headers.forEach((header, i) => {
    const hx = tableX + labelColW + 0.15 + i * dataColW;
    slide.addText(header, {
      x: hx,
      y: tableY,
      w: dataColW - 0.05,
      h: rowH,
      fontSize: headerFontSize,
      fontFace: brand.fonts.body,
      color: brand.colors.white,
      bold: true,
      align: "center",
      valign: "middle",
      autoFit: true,
    });
  });

  // Data rows
  rows.forEach((row, ri) => {
    const ry = tableY + (ri + 1) * (rowH + rowGap);
    const isEven = ri % 2 === 0;

    // Row background (alternating)
    if (isEven) {
      slide.addShape(pptx.ShapeType.rect, {
        x: tableX,
        y: ry,
        w: SLIDE.content.width,
        h: rowH,
        fill: { color: brand.colors.ice },
        rectRadius: 0.03,
      });
    }

    // Row label
    slide.addText(row.label, {
      x: tableX + 0.1,
      y: ry,
      w: labelColW - 0.2,
      h: rowH,
      fontSize: labelFontSize,
      fontFace: brand.fonts.body,
      color: brand.colors.dark,
      bold: true,
      valign: "middle",
      autoFit: true,
    });

    // Cells
    row.cells.forEach((cell, ci) => {
      const cx = tableX + labelColW + 0.15 + ci * dataColW;

      // Highlight background
      if (cell.highlight) {
        slide.addShape(pptx.ShapeType.rect, {
          x: cx - 0.02,
          y: ry + 0.02,
          w: dataColW - 0.05,
          h: rowH - 0.04,
          fill: { color: brand.colors.wash },
          rectRadius: 0.03,
          line: { color: brand.colors.light, width: 0.5 },
        });
      }

      slide.addText(cell.text, {
        x: cx,
        y: ry,
        w: dataColW - 0.1,
        h: rowH,
        fontSize: cellFontSize,
        fontFace: brand.fonts.body,
        color: cell.highlight ? brand.colors.dark : brand.colors.grey70,
        bold: cell.highlight,
        align: "center",
        valign: "middle",
        autoFit: true,
      });
    });
  });

  // Footer note
  if (body.footer) {
    const footerY = tableY + (rows.length + 1) * (rowH + rowGap) + 0.1;
    slide.addText(body.footer, {
      x: tableX,
      y: footerY,
      w: SLIDE.content.width,
      h: 0.25,
      fontSize: 8,
      fontFace: brand.fonts.body,
      color: brand.colors.grey50,
      italic: true,
    });
  }
}
