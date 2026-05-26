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
  const labelColW = 2.5;
  const dataCols = headers.length;
  const dataColW = (SLIDE.content.width - labelColW - 0.2) / dataCols;
  const rowH = Math.min(0.55, (SLIDE.content.height - 0.6) / (rows.length + 1));
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

  // Header labels
  headers.forEach((header, i) => {
    const hx = tableX + labelColW + 0.15 + i * dataColW;
    slide.addText(header, {
      x: hx,
      y: tableY,
      w: dataColW - 0.05,
      h: rowH,
      fontSize: 10,
      fontFace: brand.fonts.body,
      color: brand.colors.white,
      bold: true,
      align: "center",
      valign: "middle",
    });
  });

  // Data rows
  rows.forEach((row, ri) => {
    const ry = tableY + (ri + 1) * (rowH + 0.04);
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
      fontSize: 9.5,
      fontFace: brand.fonts.body,
      color: brand.colors.dark,
      bold: true,
      valign: "middle",
    });

    // Cells
    row.cells.forEach((cell, ci) => {
      const cx = tableX + labelColW + 0.15 + ci * dataColW;

      // Highlight background
      if (cell.highlight) {
        slide.addShape(pptx.ShapeType.rect, {
          x: cx - 0.02,
          y: ry + 0.03,
          w: dataColW - 0.05,
          h: rowH - 0.06,
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
        fontSize: 9,
        fontFace: brand.fonts.body,
        color: cell.highlight ? brand.colors.dark : brand.colors.grey70,
        bold: cell.highlight,
        align: "center",
        valign: "middle",
      });
    });
  });

  // Footer note
  if (body.footer) {
    const footerY = tableY + (rows.length + 1) * (rowH + 0.04) + 0.1;
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
