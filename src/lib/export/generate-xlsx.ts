/**
 * XLSX export generator for cost/effort data.
 * Creates a formatted Excel workbook with effort matrix,
 * cost breakdown, rate cards, and licensing details.
 */

import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import type { CostSummary } from "@/lib/costing";
import { formatCurrency, getEffortByPhase, getEffortByRole } from "@/lib/costing";

// ── Style constants ──

const HEADER_FILL: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FF1B4D4A" },
};

const HEADER_FONT: Partial<ExcelJS.Font> = {
  bold: true,
  color: { argb: "FFFFFFFF" },
  size: 11,
  name: "IBM Plex Sans",
};

const DATA_FONT: Partial<ExcelJS.Font> = {
  size: 11,
  name: "IBM Plex Sans",
};

const MONO_FONT: Partial<ExcelJS.Font> = {
  size: 11,
  name: "IBM Plex Mono",
};

const TOTAL_FILL: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFF0F0F0" },
};

const BORDER_THIN: Partial<ExcelJS.Borders> = {
  bottom: { style: "thin", color: { argb: "FFE0E0E0" } },
};

function applyHeaderRow(row: ExcelJS.Row): void {
  row.eachCell((cell) => {
    cell.fill = HEADER_FILL;
    cell.font = HEADER_FONT;
    cell.alignment = { vertical: "middle", horizontal: "left" };
  });
  row.height = 28;
}

function applyDataRow(row: ExcelJS.Row, isTotal = false): void {
  row.eachCell((cell) => {
    cell.font = DATA_FONT;
    cell.alignment = { vertical: "middle" };
    cell.border = BORDER_THIN;
    if (isTotal) {
      cell.fill = TOTAL_FILL;
      cell.font = { ...DATA_FONT, bold: true };
    }
  });
}

// ── Main export function ──

export async function exportCostingXlsx(
  costSummary: CostSummary,
  clientName: string,
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Orion — EyeOn Proposal Engine";
  workbook.created = new Date();

  // ── Sheet 1: Effort Matrix ──
  const effortSheet = workbook.addWorksheet("Effort Matrix", {
    properties: { tabColor: { argb: "FF1B4D4A" } },
  });

  effortSheet.columns = [
    { header: "Phase", key: "phase", width: 25 },
    { header: "Role", key: "role", width: 22 },
    { header: "Days", key: "days", width: 10 },
    { header: "Daily Rate", key: "rate", width: 15 },
    { header: "Cost", key: "cost", width: 15 },
  ];

  applyHeaderRow(effortSheet.getRow(1));

  for (const entry of costSummary.effortMatrix) {
    const rateCard = costSummary.rateCards.find(
      (r) => r.role === entry.role
    );
    const row = effortSheet.addRow({
      phase: entry.phase,
      role: entry.role,
      days: entry.days,
      rate: rateCard?.dailyRate || 0,
      cost: entry.cost,
    });
    applyDataRow(row);

    // Format currency columns
    row.getCell("rate").numFmt = "#,##0";
    row.getCell("cost").numFmt = "#,##0";
    row.getCell("rate").font = MONO_FONT;
    row.getCell("cost").font = MONO_FONT;
    row.getCell("days").font = MONO_FONT;
    row.getCell("days").alignment = { horizontal: "right" };
    row.getCell("rate").alignment = { horizontal: "right" };
    row.getCell("cost").alignment = { horizontal: "right" };
  }

  // Total row
  const totalRow = effortSheet.addRow({
    phase: "TOTAL",
    role: "",
    days: costSummary.totalDays,
    rate: "",
    cost: costSummary.breakdown.laborCost,
  });
  applyDataRow(totalRow, true);
  totalRow.getCell("cost").numFmt = "#,##0";
  totalRow.getCell("cost").font = { ...MONO_FONT, bold: true };
  totalRow.getCell("days").font = { ...MONO_FONT, bold: true };
  totalRow.getCell("days").alignment = { horizontal: "right" };
  totalRow.getCell("cost").alignment = { horizontal: "right" };

  // ── Sheet 2: Cost Breakdown ──
  const costSheet = workbook.addWorksheet("Cost Summary", {
    properties: { tabColor: { argb: "FF7B6FAB" } },
  });

  costSheet.columns = [
    { header: "Component", key: "component", width: 30 },
    { header: "Amount", key: "amount", width: 18 },
    { header: "% of Total", key: "pct", width: 12 },
  ];

  applyHeaderRow(costSheet.getRow(1));

  const { breakdown } = costSummary;
  const costRows = [
    {
      component: "Professional Services (Labor)",
      amount: breakdown.laborCost,
      pct: breakdown.subtotal > 0 ? breakdown.laborCost / breakdown.subtotal : 0,
    },
    {
      component: "Anaplan Platform Licensing",
      amount: breakdown.licensingCost,
      pct: breakdown.subtotal > 0 ? breakdown.licensingCost / breakdown.subtotal : 0,
    },
    {
      component: "Travel & Expenses",
      amount: breakdown.travelCost,
      pct: breakdown.subtotal > 0 ? breakdown.travelCost / breakdown.subtotal : 0,
    },
  ];

  for (const item of costRows) {
    const row = costSheet.addRow(item);
    applyDataRow(row);
    row.getCell("amount").numFmt = "#,##0";
    row.getCell("amount").font = MONO_FONT;
    row.getCell("amount").alignment = { horizontal: "right" };
    row.getCell("pct").numFmt = "0%";
    row.getCell("pct").font = MONO_FONT;
    row.getCell("pct").alignment = { horizontal: "right" };
  }

  // Subtotal
  const subRow = costSheet.addRow({
    component: "Subtotal",
    amount: breakdown.subtotal,
    pct: 1,
  });
  applyDataRow(subRow, true);
  subRow.getCell("amount").numFmt = "#,##0";
  subRow.getCell("amount").font = { ...MONO_FONT, bold: true };
  subRow.getCell("amount").alignment = { horizontal: "right" };
  subRow.getCell("pct").numFmt = "0%";
  subRow.getCell("pct").alignment = { horizontal: "right" };

  // Discount (if any)
  if (breakdown.discountAmount > 0) {
    const discRow = costSheet.addRow({
      component: `Discount (${breakdown.discountPercent}%)`,
      amount: -breakdown.discountAmount,
      pct: "",
    });
    applyDataRow(discRow);
    discRow.getCell("amount").numFmt = "#,##0";
    discRow.getCell("amount").font = { ...MONO_FONT, color: { argb: "FFCC0000" } };
    discRow.getCell("amount").alignment = { horizontal: "right" };
  }

  // Margin
  const marginRow = costSheet.addRow({
    component: `Margin (${breakdown.marginPercent}%)`,
    amount: breakdown.marginAmount,
    pct: "",
  });
  applyDataRow(marginRow);
  marginRow.getCell("amount").numFmt = "#,##0";
  marginRow.getCell("amount").font = { ...MONO_FONT, color: { argb: "FF008800" } };
  marginRow.getCell("amount").alignment = { horizontal: "right" };

  // Grand total
  const grandRow = costSheet.addRow({
    component: "TOTAL INVESTMENT",
    amount: breakdown.totalCost,
    pct: "",
  });
  applyDataRow(grandRow, true);
  grandRow.getCell("amount").numFmt = "#,##0";
  grandRow.getCell("amount").font = { ...MONO_FONT, bold: true, size: 13, color: { argb: "FF1B4D4A" } };
  grandRow.getCell("amount").alignment = { horizontal: "right" };
  grandRow.getCell("component").font = { ...DATA_FONT, bold: true, size: 13 };

  // ── Sheet 3: Rate Card ──
  const rateSheet = workbook.addWorksheet("Rate Card", {
    properties: { tabColor: { argb: "FFA68458" } },
  });

  rateSheet.columns = [
    { header: "Role", key: "role", width: 22 },
    { header: "Daily Rate (EUR)", key: "dailyRate", width: 18 },
    { header: "Total Days", key: "totalDays", width: 12 },
    { header: "Total Cost", key: "totalCost", width: 15 },
  ];

  applyHeaderRow(rateSheet.getRow(1));

  const byRole = getEffortByRole(costSummary.effortMatrix);
  for (const roleData of byRole) {
    const rateCard = costSummary.rateCards.find((r) => r.role === roleData.role);
    const row = rateSheet.addRow({
      role: roleData.role,
      dailyRate: rateCard?.dailyRate || 0,
      totalDays: roleData.days,
      totalCost: roleData.cost,
    });
    applyDataRow(row);
    row.getCell("dailyRate").numFmt = "#,##0";
    row.getCell("dailyRate").font = MONO_FONT;
    row.getCell("dailyRate").alignment = { horizontal: "right" };
    row.getCell("totalDays").font = MONO_FONT;
    row.getCell("totalDays").alignment = { horizontal: "right" };
    row.getCell("totalCost").numFmt = "#,##0";
    row.getCell("totalCost").font = MONO_FONT;
    row.getCell("totalCost").alignment = { horizontal: "right" };
  }

  // ── Sheet 4: Licensing ──
  const licSheet = workbook.addWorksheet("Licensing", {
    properties: { tabColor: { argb: "FF5D7FA3" } },
  });

  licSheet.columns = [
    { header: "License Tier", key: "tier", width: 22 },
    { header: "Seats", key: "seats", width: 10 },
    { header: "Monthly Cost", key: "monthly", width: 15 },
    { header: "Duration (months)", key: "months", width: 18 },
    { header: "Total Cost", key: "total", width: 15 },
  ];

  applyHeaderRow(licSheet.getRow(1));

  const { licensing } = costSummary;
  const licRows = [
    {
      tier: "Model Builder",
      seats: licensing.modelBuilderSeats,
      monthly: licensing.monthlyModelBuilder,
      months: licensing.durationMonths,
      total: licensing.modelBuilderSeats * licensing.monthlyModelBuilder * licensing.durationMonths,
    },
    {
      tier: "End User",
      seats: licensing.endUserSeats,
      monthly: licensing.monthlyEndUser,
      months: licensing.durationMonths,
      total: licensing.endUserSeats * licensing.monthlyEndUser * licensing.durationMonths,
    },
    {
      tier: "Admin",
      seats: licensing.adminSeats,
      monthly: licensing.monthlyAdmin,
      months: licensing.durationMonths,
      total: licensing.adminSeats * licensing.monthlyAdmin * licensing.durationMonths,
    },
  ];

  for (const lic of licRows) {
    const row = licSheet.addRow(lic);
    applyDataRow(row);
    row.getCell("monthly").numFmt = "#,##0";
    row.getCell("monthly").font = MONO_FONT;
    row.getCell("monthly").alignment = { horizontal: "right" };
    row.getCell("seats").font = MONO_FONT;
    row.getCell("seats").alignment = { horizontal: "right" };
    row.getCell("months").font = MONO_FONT;
    row.getCell("months").alignment = { horizontal: "right" };
    row.getCell("total").numFmt = "#,##0";
    row.getCell("total").font = MONO_FONT;
    row.getCell("total").alignment = { horizontal: "right" };
  }

  // Total row
  const licTotalRow = licSheet.addRow({
    tier: "TOTAL",
    seats: "",
    monthly: "",
    months: "",
    total: breakdown.licensingCost,
  });
  applyDataRow(licTotalRow, true);
  licTotalRow.getCell("total").numFmt = "#,##0";
  licTotalRow.getCell("total").font = { ...MONO_FONT, bold: true };
  licTotalRow.getCell("total").alignment = { horizontal: "right" };

  // ── Sheet 5: Phase Summary ──
  const phaseSheet = workbook.addWorksheet("Phase Summary", {
    properties: { tabColor: { argb: "FF7A9461" } },
  });

  phaseSheet.columns = [
    { header: "Phase", key: "phase", width: 25 },
    { header: "Total Days", key: "days", width: 12 },
    { header: "Total Cost", key: "cost", width: 15 },
    { header: "% of Effort", key: "pct", width: 12 },
  ];

  applyHeaderRow(phaseSheet.getRow(1));

  const byPhase = getEffortByPhase(costSummary.effortMatrix);
  for (const phaseData of byPhase) {
    const row = phaseSheet.addRow({
      phase: phaseData.phase,
      days: phaseData.days,
      cost: phaseData.cost,
      pct: costSummary.totalDays > 0 ? phaseData.days / costSummary.totalDays : 0,
    });
    applyDataRow(row);
    row.getCell("days").font = MONO_FONT;
    row.getCell("days").alignment = { horizontal: "right" };
    row.getCell("cost").numFmt = "#,##0";
    row.getCell("cost").font = MONO_FONT;
    row.getCell("cost").alignment = { horizontal: "right" };
    row.getCell("pct").numFmt = "0%";
    row.getCell("pct").font = MONO_FONT;
    row.getCell("pct").alignment = { horizontal: "right" };
  }

  // ── Generate and download ──
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const filename = `${clientName.replace(/\s+/g, "_")}_Costing_${new Date().toISOString().split("T")[0]}.xlsx`;
  saveAs(blob, filename);
}
