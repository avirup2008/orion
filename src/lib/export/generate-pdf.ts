/**
 * PDF export for Orion proposals.
 * Uses jsPDF for client-side PDF generation with professional formatting.
 */

import type { RfpQuestion } from "@/types";
import { CATEGORY_CONFIG } from "@/types";
import type { CostSummary } from "@/lib/costing";

export async function exportProposalPdf(
  questions: RfpQuestion[],
  clientName: string,
  rfpTitle: string,
  costSummary?: CostSummary,
): Promise<void> {
  // Dynamic import for client-side only
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // ── Helpers ──
  function checkPageBreak(needed: number) {
    const pageHeight = doc.internal.pageSize.getHeight();
    if (y + needed > pageHeight - 25) {
      doc.addPage();
      y = margin;
    }
  }

  function addFooter() {
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(7);
      doc.setTextColor(160, 160, 160);
      doc.text(
        `${clientName} — Anaplan Implementation Proposal | Page ${i} of ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: "center" }
      );
      doc.text(
        "CONFIDENTIAL — EyeOn B.V.",
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 6,
        { align: "center" }
      );
    }
  }

  // ── Cover Page ──
  doc.setFillColor(28, 33, 41); // navy
  doc.rect(0, 0, pageWidth, 120, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.text("Orion.", margin, 50);

  doc.setFontSize(8);
  doc.setTextColor(200, 200, 200);
  doc.text("ANAPLAN PROPOSAL ENGINE BY EYEON", margin, 60);

  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  const titleLines = doc.splitTextToSize(rfpTitle, contentWidth);
  doc.text(titleLines, margin, 80);

  doc.setFontSize(10);
  doc.setTextColor(200, 200, 200);
  doc.text(`Prepared for: ${clientName}`, margin, 100);
  doc.text(`Date: ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`, margin, 107);

  // Reset for body
  y = 140;
  doc.setTextColor(28, 33, 41);

  // ── Executive Summary ──
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Executive Summary", margin, y);
  y += 8;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const answeredQuestions = questions.filter((q) => q.response);
  const summaryText = `This proposal addresses ${questions.length} requirements across ${new Set(questions.map((q) => q.category)).size} categories. ${answeredQuestions.length} responses have been prepared, covering the technical, functional, and commercial aspects of the proposed Anaplan implementation.`;
  const summaryLines = doc.splitTextToSize(summaryText, contentWidth);
  doc.text(summaryLines, margin, y);
  y += summaryLines.length * 5 + 10;

  // ── Table of Contents ──
  checkPageBreak(40);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Table of Contents", margin, y);
  y += 10;

  const categories = [...new Set(questions.map((q) => q.category))];
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  categories.forEach((cat, i) => {
    const cfg = CATEGORY_CONFIG[cat];
    const catQuestions = questions.filter((q) => q.category === cat);
    doc.text(`${i + 1}. ${cfg.label} (${catQuestions.length} questions)`, margin + 5, y);
    y += 6;
  });
  y += 10;

  // ── Response Sections ──
  categories.forEach((cat, catIdx) => {
    const cfg = CATEGORY_CONFIG[cat];
    const catQuestions = questions.filter((q) => q.category === cat);

    // Section header
    checkPageBreak(20);
    doc.setFillColor(
      parseInt(cfg.color.slice(1, 3), 16),
      parseInt(cfg.color.slice(3, 5), 16),
      parseInt(cfg.color.slice(5, 7), 16)
    );
    doc.rect(margin, y - 5, contentWidth, 10, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`${catIdx + 1}. ${cfg.label}`, margin + 4, y + 1);
    y += 12;
    doc.setTextColor(28, 33, 41);

    catQuestions.forEach((q) => {
      checkPageBreak(30);

      // Question
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      const qLines = doc.splitTextToSize(
        `Q${q.number}. ${q.text}`,
        contentWidth - 5
      );
      doc.text(qLines, margin + 2, y);
      y += qLines.length * 5 + 4;

      // Response
      if (q.response) {
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");

        // Strip markdown bold markers for PDF
        const cleanContent = q.response.content.replace(/\*\*/g, "");
        const paragraphs = cleanContent.split("\n\n");

        for (const para of paragraphs) {
          checkPageBreak(15);
          const paraLines = doc.splitTextToSize(para.trim(), contentWidth - 5);
          doc.text(paraLines, margin + 2, y);
          y += paraLines.length * 4.5 + 3;
        }

        // Word count badge
        doc.setFontSize(7);
        doc.setTextColor(140, 140, 140);
        doc.text(`${q.response.wordCount} words`, margin + 2, y);
        y += 8;
        doc.setTextColor(28, 33, 41);
      } else {
        doc.setFontSize(9);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(160, 160, 160);
        doc.text("[Response pending]", margin + 2, y);
        y += 8;
        doc.setTextColor(28, 33, 41);
        doc.setFont("helvetica", "normal");
      }

      // Separator
      doc.setDrawColor(230, 230, 230);
      doc.line(margin, y - 2, margin + contentWidth, y - 2);
      y += 4;
    });

    y += 6;
  });

  // ── Cost Summary (if available) ──
  if (costSummary) {
    doc.addPage();
    y = margin;

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Commercial Summary", margin, y);
    y += 10;

    // Cost table
    const costRows = [
      ["Labor Cost", formatEur(costSummary.breakdown.laborCost)],
      ["Licensing Cost", formatEur(costSummary.breakdown.licensingCost)],
      ["Travel & Expenses", formatEur(costSummary.breakdown.travelCost)],
      ["Subtotal", formatEur(costSummary.breakdown.subtotal)],
      ...(costSummary.breakdown.discountPercent > 0
        ? [["Discount", `-${formatEur(costSummary.breakdown.discountAmount)}`]]
        : []),
      ["Margin (" + costSummary.breakdown.marginPercent + "%)", formatEur(costSummary.breakdown.marginAmount)],
      ["Total Investment", formatEur(costSummary.breakdown.totalCost)],
    ];

    autoTable(doc, {
      startY: y,
      head: [["Item", "Amount (EUR)"]],
      body: costRows,
      margin: { left: margin, right: margin },
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [27, 77, 74], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [250, 248, 240] },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      didParseCell: (data: any) => {
        if (data.row.index === costRows.length - 1) {
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.fillColor = [27, 77, 74];
        }
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    y = (doc as any).lastAutoTable.finalY + 15;

    // Effort by role table
    checkPageBreak(40);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Effort Breakdown by Role", margin, y);
    y += 6;

    const roleRows = costSummary.rateCards.map((rc) => {
      const roleDays = costSummary.effortMatrix
        .filter((e) => e.role === rc.role)
        .reduce((s, e) => s + e.days, 0);
      const roleCost = costSummary.effortMatrix
        .filter((e) => e.role === rc.role)
        .reduce((s, e) => s + e.cost, 0);
      return [rc.role, `${formatEur(rc.dailyRate)}/day`, `${roleDays}`, formatEur(roleCost)];
    });

    autoTable(doc, {
      startY: y,
      head: [["Role", "Daily Rate", "Days", "Total"]],
      body: roleRows,
      margin: { left: margin, right: margin },
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [27, 77, 74], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [250, 248, 240] },
    });
  }

  // ── Footer on all pages ──
  addFooter();

  // ── Save ──
  const filename = `${clientName.replace(/\s+/g, "_")}_Proposal_${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(filename);
}

function formatEur(amount: number): string {
  return `€${amount.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}
