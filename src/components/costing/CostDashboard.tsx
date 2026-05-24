"use client";

import { useMemo } from "react";
import { useAppState } from "@/lib/store";
import {
  generateCostSummary,
  getEffortByPhase,
  getEffortByRole,
  formatCurrency,
} from "@/lib/costing";
import {
  Calculator,
  Users,
  Clock,
  TrendingUp,
  ArrowLeft,
  FileSpreadsheet,
} from "lucide-react";
import { exportCostingXlsx } from "@/lib/export/generate-xlsx";

interface CostDashboardProps {
  onBack: () => void;
}

export default function CostDashboard({ onBack }: CostDashboardProps) {
  const { clarification, client } = useAppState();

  const costSummary = useMemo(
    () =>
      generateCostSummary(
        clarification.answers,
        clarification.detectedModules
      ),
    [clarification.answers, clarification.detectedModules]
  );

  const byPhase = useMemo(
    () => getEffortByPhase(costSummary.effortMatrix),
    [costSummary.effortMatrix]
  );

  const byRole = useMemo(
    () => getEffortByRole(costSummary.effortMatrix),
    [costSummary.effortMatrix]
  );

  const { breakdown } = costSummary;

  // Bar chart max for scaling
  const maxPhaseDays = Math.max(...byPhase.map((p) => p.days), 1);
  const maxRoleDays = Math.max(...byRole.map((r) => r.days), 1);

  return (
    <div className="h-full overflow-y-auto bg-[var(--bg)]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[var(--bg)]/95 backdrop-blur-[12px] border-b border-[var(--border)] px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="text-xs font-medium px-3 py-[7px] rounded-lg border border-[var(--border2)] bg-[var(--surface)] text-[var(--text2)] transition-all hover:border-[var(--text4)]"
          >
            <ArrowLeft className="w-3.5 h-3.5 inline -mt-px mr-1" />
            Back to Studio
          </button>
          <div>
            <h1 className="text-lg font-bold text-[var(--text)]">
              Cost Dashboard
            </h1>
            <p className="text-[11px] text-[var(--text4)]">
              Internal metrics — effort, cost & margin analysis
            </p>
          </div>
        </div>
        <button
          onClick={() =>
            exportCostingXlsx(costSummary, client.companyName || "Client")
          }
          className="text-xs font-medium px-4 py-[7px] rounded-lg border border-[var(--border2)] bg-[var(--surface)] text-[var(--text2)] transition-all hover:border-[var(--text4)] hover:-translate-y-px hover:shadow-[var(--sh-sm)]"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 inline -mt-px mr-1" />
          Export XLSX
        </button>
      </div>

      <div className="max-w-[1100px] mx-auto px-8 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Total Project Cost",
              value: formatCurrency(breakdown.totalCost),
              sub: `incl. ${breakdown.marginPercent}% margin`,
              icon: Calculator,
              color: "var(--accent)",
            },
            {
              label: "Total Effort",
              value: `${costSummary.totalDays} days`,
              sub: `${costSummary.totalWeeks} weeks`,
              icon: Clock,
              color: "var(--gold)",
            },
            {
              label: "Avg Daily Rate",
              value: formatCurrency(costSummary.averageDailyRate),
              sub: "blended across roles",
              icon: TrendingUp,
              color: "#7B6FAB",
            },
            {
              label: "Team Size",
              value: `${costSummary.rateCards.length} roles`,
              sub: "configured",
              icon: Users,
              color: "#5D7FA3",
            },
          ].map((kpi) => (
            <div
              key={kpi.label}
              className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--r-lg)] p-5 shadow-[var(--sh-sm)]"
            >
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: `${kpi.color}15` }}
                >
                  <kpi.icon size={14} style={{ color: kpi.color }} />
                </div>
                <span className="font-mono text-[9px] uppercase tracking-[1.5px] text-[var(--text4)]">
                  {kpi.label}
                </span>
              </div>
              <div className="text-xl font-bold text-[var(--text)]">
                {kpi.value}
              </div>
              <div className="text-[10px] text-[var(--text4)] mt-1">
                {kpi.sub}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* Cost Breakdown */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--r-lg)] p-6 shadow-[var(--sh-sm)]">
            <h3 className="text-sm font-semibold text-[var(--text)] mb-4">
              Cost Breakdown
            </h3>
            <div className="space-y-3">
              {[
                { label: "Labor", value: breakdown.laborCost, pct: breakdown.subtotal > 0 ? (breakdown.laborCost / breakdown.subtotal * 100) : 0 },
                { label: "Licensing", value: breakdown.licensingCost, pct: breakdown.subtotal > 0 ? (breakdown.licensingCost / breakdown.subtotal * 100) : 0 },
                { label: "Travel", value: breakdown.travelCost, pct: breakdown.subtotal > 0 ? (breakdown.travelCost / breakdown.subtotal * 100) : 0 },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[var(--text2)]">{item.label}</span>
                    <span className="font-mono text-[var(--text)] font-semibold">
                      {formatCurrency(item.value)}
                    </span>
                  </div>
                  <div className="h-2 bg-[var(--surface3)] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[var(--accent)] transition-all"
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                  <div className="text-[9px] text-[var(--text4)] mt-0.5 text-right font-mono">
                    {item.pct.toFixed(0)}%
                  </div>
                </div>
              ))}
              <div className="pt-3 mt-3 border-t border-[var(--border)]">
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--text3)]">Subtotal</span>
                  <span className="font-mono text-[var(--text)]">
                    {formatCurrency(breakdown.subtotal)}
                  </span>
                </div>
                {breakdown.discountAmount > 0 && (
                  <div className="flex justify-between text-xs mt-1">
                    <span className="text-[var(--neg)]">
                      Discount ({breakdown.discountPercent}%)
                    </span>
                    <span className="font-mono text-[var(--neg)]">
                      -{formatCurrency(breakdown.discountAmount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-[var(--pos)]">
                    Margin ({breakdown.marginPercent}%)
                  </span>
                  <span className="font-mono text-[var(--pos)]">
                    +{formatCurrency(breakdown.marginAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold mt-3 pt-2 border-t border-[var(--border)]">
                  <span className="text-[var(--text)]">Total</span>
                  <span className="text-[var(--accent)]">
                    {formatCurrency(breakdown.totalCost)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Licensing Estimate */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--r-lg)] p-6 shadow-[var(--sh-sm)]">
            <h3 className="text-sm font-semibold text-[var(--text)] mb-4">
              Anaplan Licensing Estimate
            </h3>
            <div className="space-y-4">
              {[
                {
                  tier: "Model Builder",
                  seats: costSummary.licensing.modelBuilderSeats,
                  monthly: costSummary.licensing.monthlyModelBuilder,
                },
                {
                  tier: "End User",
                  seats: costSummary.licensing.endUserSeats,
                  monthly: costSummary.licensing.monthlyEndUser,
                },
                {
                  tier: "Admin",
                  seats: costSummary.licensing.adminSeats,
                  monthly: costSummary.licensing.monthlyAdmin,
                },
              ].map((lic) => (
                <div
                  key={lic.tier}
                  className="flex items-center justify-between p-3 bg-[var(--surface2)] rounded-lg"
                >
                  <div>
                    <div className="text-xs font-semibold text-[var(--text)]">
                      {lic.tier}
                    </div>
                    <div className="text-[10px] text-[var(--text4)]">
                      {lic.seats} seats &times; {formatCurrency(lic.monthly)}/mo
                    </div>
                  </div>
                  <div className="font-mono text-sm font-bold text-[var(--text)]">
                    {formatCurrency(
                      lic.seats *
                        lic.monthly *
                        costSummary.licensing.durationMonths
                    )}
                  </div>
                </div>
              ))}
              <div className="pt-3 border-t border-[var(--border)]">
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--text3)]">
                    Duration: {costSummary.licensing.durationMonths} months
                  </span>
                  <span className="font-mono font-semibold text-[var(--text)]">
                    {formatCurrency(breakdown.licensingCost)} total
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Effort Charts */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* By Phase */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--r-lg)] p-6 shadow-[var(--sh-sm)]">
            <h3 className="text-sm font-semibold text-[var(--text)] mb-4">
              Effort by Phase
            </h3>
            <div className="space-y-3">
              {byPhase.map((p) => (
                <div key={p.phase}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[var(--text2)] truncate max-w-[200px]">
                      {p.phase}
                    </span>
                    <span className="font-mono text-[var(--text3)] ml-2 shrink-0">
                      {p.days}d &middot; {formatCurrency(p.cost)}
                    </span>
                  </div>
                  <div className="h-[6px] bg-[var(--surface3)] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${(p.days / maxPhaseDays) * 100}%`,
                        background: "var(--accent)",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* By Role */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--r-lg)] p-6 shadow-[var(--sh-sm)]">
            <h3 className="text-sm font-semibold text-[var(--text)] mb-4">
              Effort by Role
            </h3>
            <div className="space-y-3">
              {byRole.map((r) => (
                <div key={r.role}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[var(--text2)]">{r.role}</span>
                    <span className="font-mono text-[var(--text3)]">
                      {r.days}d &middot; {formatCurrency(r.cost)}
                    </span>
                  </div>
                  <div className="h-[6px] bg-[var(--surface3)] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${(r.days / maxRoleDays) * 100}%`,
                        background: "#7B6FAB",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Effort Matrix Table */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--r-lg)] p-6 shadow-[var(--sh-sm)]">
          <h3 className="text-sm font-semibold text-[var(--text)] mb-4">
            Full Effort Matrix
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left py-2 pr-4 font-mono text-[9px] text-[var(--text4)] uppercase tracking-wider">
                    Phase
                  </th>
                  <th className="text-left py-2 pr-4 font-mono text-[9px] text-[var(--text4)] uppercase tracking-wider">
                    Role
                  </th>
                  <th className="text-right py-2 pr-4 font-mono text-[9px] text-[var(--text4)] uppercase tracking-wider">
                    Days
                  </th>
                  <th className="text-right py-2 font-mono text-[9px] text-[var(--text4)] uppercase tracking-wider">
                    Cost
                  </th>
                </tr>
              </thead>
              <tbody>
                {costSummary.effortMatrix.map((e, i) => (
                  <tr
                    key={i}
                    className="border-b border-[var(--border)]/50 hover:bg-[var(--surface2)] transition-colors"
                  >
                    <td className="py-2 pr-4 text-[var(--text2)]">
                      {e.phase}
                    </td>
                    <td className="py-2 pr-4 text-[var(--text3)]">
                      {e.role}
                    </td>
                    <td className="py-2 pr-4 text-right font-mono text-[var(--text)]">
                      {e.days}
                    </td>
                    <td className="py-2 text-right font-mono font-semibold text-[var(--text)]">
                      {formatCurrency(e.cost)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-[var(--border)]">
                  <td
                    colSpan={2}
                    className="py-2 pr-4 font-semibold text-[var(--text)]"
                  >
                    Total
                  </td>
                  <td className="py-2 pr-4 text-right font-mono font-bold text-[var(--text)]">
                    {costSummary.totalDays}
                  </td>
                  <td className="py-2 text-right font-mono font-bold text-[var(--accent)]">
                    {formatCurrency(breakdown.laborCost)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Rate Card Reference */}
        <div className="mt-6 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--r-lg)] p-6 shadow-[var(--sh-sm)]">
          <h3 className="text-sm font-semibold text-[var(--text)] mb-4">
            Rate Card
          </h3>
          <div className="grid grid-cols-5 gap-3">
            {costSummary.rateCards.map((rc) => (
              <div
                key={rc.role}
                className="p-3 bg-[var(--surface2)] rounded-lg text-center"
              >
                <div className="text-[10px] text-[var(--text3)] mb-1">
                  {rc.role}
                </div>
                <div className="font-mono text-sm font-bold text-[var(--text)]">
                  {formatCurrency(rc.dailyRate)}
                </div>
                <div className="text-[9px] text-[var(--text4)]">per day</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
