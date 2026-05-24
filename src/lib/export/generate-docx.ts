/**
 * DOCX proposal document generator.
 * Creates a professional Word document from generated RFP responses.
 */

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  TableRow,
  TableCell,
  Table,
  WidthType,
  ShadingType,
} from "docx";
import { saveAs } from "file-saver";
import type { RfpQuestion, QuestionCategory } from "@/types";
import type { CostSummary } from "@/lib/costing";
import { formatCurrency } from "@/lib/costing";

// ── Section ordering for the document ──

const SECTION_ORDER: QuestionCategory[] = [
  "methodology",
  "functional",
  "technical",
  "team",
  "pricing",
  "references",
];

const SECTION_TITLES: Record<QuestionCategory, string> = {
  methodology: "Implementation Methodology",
  functional: "Functional Capabilities",
  technical: "Technical Architecture",
  team: "Team & Staffing",
  pricing: "Commercial Approach",
  references: "References & Case Studies",
};

// ── Markdown-like text parser ──

function parseResponseText(text: string): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  for (const block of text.split("\n\n")) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    // Handle bullet points
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      const items = trimmed.split("\n").filter((l) => l.trim());
      for (const item of items) {
        const content = item.replace(/^[-*]\s*/, "");
        paragraphs.push(
          new Paragraph({
            children: parseBoldText(content),
            bullet: { level: 0 },
            spacing: { after: 80 },
          })
        );
      }
      continue;
    }

    // Handle headers (### or ##)
    if (trimmed.startsWith("## ") || trimmed.startsWith("### ")) {
      const headerText = trimmed.replace(/^#{2,3}\s*/, "");
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: headerText,
              bold: true,
              size: 24,
              color: "1B4D4A",
            }),
          ],
          spacing: { before: 200, after: 100 },
        })
      );
      continue;
    }

    // Regular paragraph with bold parsing
    paragraphs.push(
      new Paragraph({
        children: parseBoldText(trimmed),
        spacing: { after: 120 },
      })
    );
  }

  return paragraphs;
}

function parseBoldText(text: string): TextRun[] {
  const runs: TextRun[] = [];
  const parts = text.split(/(\*\*[^*]+\*\*)/);

  for (const part of parts) {
    if (part.startsWith("**") && part.endsWith("**")) {
      runs.push(
        new TextRun({
          text: part.slice(2, -2),
          bold: true,
          font: "IBM Plex Sans",
          size: 22,
        })
      );
    } else if (part) {
      runs.push(
        new TextRun({
          text: part,
          font: "IBM Plex Sans",
          size: 22,
        })
      );
    }
  }

  return runs;
}

// ── Main export function ──

export async function exportProposalDocx(
  questions: RfpQuestion[],
  clientName: string,
  rfpTitle: string,
  costSummary?: CostSummary
): Promise<void> {
  const answeredQuestions = questions.filter((q) => q.response);

  // Group by category
  const grouped = new Map<QuestionCategory, RfpQuestion[]>();
  for (const q of answeredQuestions) {
    const list = grouped.get(q.category) || [];
    list.push(q);
    grouped.set(q.category, list);
  }

  const sections: (Paragraph | Table)[] = [];

  // ── Cover page ──
  sections.push(
    new Paragraph({ spacing: { before: 2000 } }),
    new Paragraph({
      children: [
        new TextRun({
          text: "Proposal Response",
          bold: true,
          size: 56,
          color: "1B4D4A",
          font: "IBM Plex Sans",
        }),
      ],
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: rfpTitle,
          size: 28,
          color: "666666",
          font: "IBM Plex Sans",
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Prepared for: ${clientName}`,
          size: 24,
          color: "1C2129",
          font: "IBM Plex Sans",
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Prepared by: EyeOn B.V. — Anaplan Platinum Partner`,
          size: 22,
          color: "666666",
          font: "IBM Plex Sans",
        }),
      ],
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: new Date().toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }),
          size: 22,
          color: "999999",
          font: "IBM Plex Sans",
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: "CONFIDENTIAL",
          bold: true,
          size: 18,
          color: "999999",
          font: "IBM Plex Mono",
        }),
      ],
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({ pageBreakBefore: true }) // Page break after cover
  );

  // ── Response sections ──
  for (const category of SECTION_ORDER) {
    const sectionQuestions = grouped.get(category);
    if (!sectionQuestions || sectionQuestions.length === 0) continue;

    // Section header
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: SECTION_TITLES[category],
            bold: true,
            size: 32,
            color: "1B4D4A",
            font: "IBM Plex Sans",
          }),
        ],
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
        border: {
          bottom: {
            style: BorderStyle.SINGLE,
            size: 2,
            color: "1B4D4A",
          },
        },
      })
    );

    // Each question + response
    for (const q of sectionQuestions) {
      // Question
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Q${q.number}. ${q.text}`,
              bold: true,
              size: 24,
              color: "1C2129",
              font: "IBM Plex Sans",
            }),
          ],
          spacing: { before: 300, after: 120 },
        })
      );

      // Response
      if (q.response) {
        sections.push(...parseResponseText(q.response.content));
      }
    }
  }

  // ── Cost summary appendix ──
  if (costSummary) {
    sections.push(
      new Paragraph({ pageBreakBefore: true }),
      new Paragraph({
        children: [
          new TextRun({
            text: "Appendix: Investment Summary",
            bold: true,
            size: 32,
            color: "1B4D4A",
            font: "IBM Plex Sans",
          }),
        ],
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200, after: 200 },
        border: {
          bottom: {
            style: BorderStyle.SINGLE,
            size: 2,
            color: "1B4D4A",
          },
        },
      })
    );

    // Cost summary table
    const costRows = [
      ["Component", "Amount"],
      ["Labor", formatCurrency(costSummary.breakdown.laborCost)],
      ["Anaplan Licensing", formatCurrency(costSummary.breakdown.licensingCost)],
      ["Travel & Expenses", formatCurrency(costSummary.breakdown.travelCost)],
      ["Subtotal", formatCurrency(costSummary.breakdown.subtotal)],
      [`Margin (${costSummary.breakdown.marginPercent}%)`, formatCurrency(costSummary.breakdown.marginAmount)],
      ["Total Investment", formatCurrency(costSummary.breakdown.totalCost)],
    ];

    const table = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: costRows.map(
        (row, i) =>
          new TableRow({
            children: row.map(
              (cell, j) =>
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: cell,
                          bold: i === 0 || i === costRows.length - 1,
                          size: 22,
                          font: j === 1 ? "IBM Plex Mono" : "IBM Plex Sans",
                          color: i === costRows.length - 1 ? "1B4D4A" : "1C2129",
                        }),
                      ],
                      alignment: j === 1 ? AlignmentType.RIGHT : AlignmentType.LEFT,
                    }),
                  ],
                  shading:
                    i === 0
                      ? { type: ShadingType.SOLID, color: "1B4D4A", fill: "1B4D4A" }
                      : i === costRows.length - 1
                      ? { type: ShadingType.SOLID, color: "F0F0F0", fill: "F0F0F0" }
                      : undefined,
                  width: { size: j === 0 ? 60 : 40, type: WidthType.PERCENTAGE },
                })
            ),
          })
      ),
    });

    sections.push(table);

    // Duration and team info
    sections.push(
      new Paragraph({ spacing: { before: 200 } }),
      new Paragraph({
        children: [
          new TextRun({
            text: `Engagement Duration: ${costSummary.totalWeeks} weeks (${costSummary.totalDays} working days)`,
            size: 22,
            font: "IBM Plex Sans",
          }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: `Team: ${costSummary.rateCards.map((r) => r.role).join(", ")}`,
            size: 22,
            font: "IBM Plex Sans",
          }),
        ],
      })
    );
  }

  // ── Build and download ──
  const doc = new Document({
    sections: [{ children: sections }],
    styles: {
      default: {
        document: {
          run: {
            font: "IBM Plex Sans",
            size: 22,
            color: "1C2129",
          },
        },
      },
    },
  });

  const blob = await Packer.toBlob(doc);
  const filename = `${clientName.replace(/\s+/g, "_")}_Proposal_${new Date().toISOString().split("T")[0]}.docx`;
  saveAs(blob, filename);
}
