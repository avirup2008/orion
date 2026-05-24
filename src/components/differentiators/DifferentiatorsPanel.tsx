"use client";

import { useMemo } from "react";
import { useAppState } from "@/lib/store";
import { generateCostSummary, formatCurrency } from "@/lib/costing";
import { generateTimeline } from "@/lib/differentiators/timeline";
import { generateCompetitiveInserts } from "@/lib/differentiators/competitive";
import {
  generateRiskRegister,
  type Risk,
} from "@/lib/differentiators/risk-register";
import {
  ArrowLeft,
  Calendar,
  Shield,
  Swords,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileDown,
} from "lucide-react";
import { exportProposalDocx } from "@/lib/export/generate-docx";
import { exportProposalPdf } from "@/lib/export/generate-pdf";

interface DifferentiatorsPanelProps {
  onBack: () => void;
}

function riskBadge(level: "High" | "Medium" | "Low") {
  const styles = {
    High: "bg-[var(--neg)]/10 text-[var(--neg)]",
    Medium: "bg-[var(--gold)]/20 text-[var(--gold)]",
    Low: "bg-[var(--pos-pale)] text-[var(--pos)]",
  };
  return (
    <span
      className={`font-mono text-[9px] px-2 py-[2px] rounded-full font-semibold ${styles[level]}`}
    >
      {level}
    </span>
  );
}

export default function DifferentiatorsPanel({
  onBack,
}: DifferentiatorsPanelProps) {
  const { clarification, client, questions } = useAppState();

  const costSummary = useMemo(
    () =>
      generateCostSummary(
        clarification.answers,
        clarification.detectedModules
      ),
    [clarification.answers, clarification.detectedModules]
  );

  const timeline = useMemo(
    () => generateTimeline(costSummary),
    [costSummary]
  );

  const competitiveInserts = useMemo(
    () =>
      generateCompetitiveInserts({
        clientIndustry: client.industry || "",
        detectedModules: clarification.detectedModules,
        engagementWeeks: costSummary.totalWeeks,
        teamSize: costSummary.rateCards.length,
      }),
    [client.industry, clarification.detectedModules, costSummary]
  );

  const riskRegister = useMemo(
    () =>
      generateRiskRegister(
        costSummary,
        clarification.detectedModules,
        client.industry || ""
      ),
    [costSummary, clarification.detectedModules, client.industry]
  );

  // Gantt bar max
  const maxEndWeek = Math.max(...timeline.phases.map((p) => p.endWeek), 1);

  const handleExportDocx = async () => {
    const clientName = client.companyName || "Client";
    const rfpTitle = client.industry
      ? `${clientName} — ${client.industry} RFP`
      : `${clientName} Proposal`;
    await exportProposalDocx(questions, clientName, rfpTitle, costSummary);
  };

  const handleExportPdf = async () => {
    const clientName = client.companyName || "Client";
    const rfpTitle = client.industry
      ? `${clientName} — ${client.industry} RFP`
      : `${clientName} Proposal`;
    await exportProposalPdf(questions, clientName, rfpTitle, costSummary);
  };

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
              Differentiators
            </h1>
            <p className="text-[11px] text-[var(--text4)]">
              Timeline, competitive positioning & risk register
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportDocx}
            className="text-xs font-medium px-4 py-[7px] rounded-lg border border-[var(--border2)] bg-[var(--surface)] text-[var(--text2)] transition-all hover:border-[var(--text4)] hover:-translate-y-px hover:shadow-[var(--sh-sm)]"
          >
            <FileDown className="w-3.5 h-3.5 inline -mt-px mr-1" />
            Export DOCX
          </button>
          <button
            onClick={handleExportPdf}
            className="text-xs font-medium px-4 py-[7px] rounded-lg border border-[var(--border2)] bg-[var(--surface)] text-[var(--text2)] transition-all hover:border-[var(--text4)] hover:-translate-y-px hover:shadow-[var(--sh-sm)]"
          >
            <FileDown className="w-3.5 h-3.5 inline -mt-px mr-1" />
            Export PDF
          </button>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-8 py-8">
        {/* ── Timeline ── */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--r-lg)] p-6 shadow-[var(--sh-sm)] mb-6">
          <div className="flex items-center gap-2 mb-5">
            <Calendar size={16} className="text-[var(--accent)]" />
            <h3 className="text-sm font-semibold text-[var(--text)]">
              Implementation Timeline
            </h3>
            <span className="ml-auto font-mono text-[10px] text-[var(--text4)]">
              {timeline.totalWeeks} weeks &middot; {timeline.sprintCadence}
            </span>
          </div>

          {/* Gantt chart */}
          <div className="space-y-2 mb-6">
            {timeline.phases.map((phase) => (
              <div key={phase.name} className="flex items-center gap-3">
                <div className="w-[100px] text-xs text-[var(--text2)] truncate shrink-0">
                  {phase.name}
                </div>
                <div className="flex-1 h-7 bg-[var(--surface2)] rounded-md relative">
                  <div
                    className="absolute top-0 h-full rounded-md bg-[var(--accent)] flex items-center px-2"
                    style={{
                      left: `${((phase.startWeek - 1) / maxEndWeek) * 100}%`,
                      width: `${(phase.durationWeeks / maxEndWeek) * 100}%`,
                    }}
                  >
                    <span className="text-white text-[9px] font-mono font-semibold whitespace-nowrap">
                      W{phase.startWeek}–{phase.endWeek} ({phase.durationWeeks}w)
                    </span>
                  </div>
                </div>
                <div className="w-[60px] text-right font-mono text-[10px] text-[var(--text3)] shrink-0">
                  {phase.totalDays}d
                </div>
              </div>
            ))}
          </div>

          {/* Milestones */}
          <div className="border-t border-[var(--border)] pt-4">
            <div className="font-mono text-[8px] text-[var(--text4)] uppercase tracking-[2px] mb-3">
              Key Milestones
            </div>
            <div className="flex flex-wrap gap-2">
              {timeline.keyMilestones.map((m) => (
                <div
                  key={m.label}
                  className="flex items-center gap-1.5 text-[10px] px-3 py-1.5 rounded-full bg-[var(--accent-pale)] text-[var(--accent)] border border-[var(--accent-bd)]"
                >
                  <Clock size={10} />
                  <span className="font-mono font-semibold">W{m.week}</span>
                  <span>{m.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Competitive Positioning ── */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--r-lg)] p-6 shadow-[var(--sh-sm)] mb-6">
          <div className="flex items-center gap-2 mb-5">
            <Swords size={16} className="text-[#7B6FAB]" />
            <h3 className="text-sm font-semibold text-[var(--text)]">
              Competitive Positioning
            </h3>
          </div>

          <div className="space-y-4">
            {competitiveInserts.map((insert) => (
              <details
                key={insert.id}
                className="group bg-[var(--surface2)] rounded-lg border border-[var(--border)] overflow-hidden"
              >
                <summary className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-[var(--surface3)] transition-colors">
                  <div className="flex items-center gap-2">
                    <Shield size={13} className="text-[#7B6FAB]" />
                    <span className="text-xs font-semibold text-[var(--text)]">
                      {insert.title}
                    </span>
                  </div>
                  <span className="font-mono text-[9px] px-2 py-[2px] rounded-full bg-[#7B6FAB]/10 text-[#7B6FAB]">
                    {insert.targetSection}
                  </span>
                </summary>
                <div className="px-5 py-4 border-t border-[var(--border)] text-xs text-[var(--text2)] leading-[1.8]">
                  {insert.content.split("\n\n").map((para, i) => (
                    <p key={i} className="mb-3 last:mb-0">
                      {para.split(/(\*\*[^*]+\*\*)/).map((part, j) => {
                        if (part.startsWith("**") && part.endsWith("**")) {
                          return (
                            <strong
                              key={j}
                              className="text-[var(--text)] font-semibold"
                            >
                              {part.slice(2, -2)}
                            </strong>
                          );
                        }
                        return part;
                      })}
                    </p>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* ── Risk Register ── */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--r-lg)] p-6 shadow-[var(--sh-sm)] mb-6">
          <div className="flex items-center gap-2 mb-5">
            <AlertTriangle size={16} className="text-[var(--gold)]" />
            <h3 className="text-sm font-semibold text-[var(--text)]">
              Risk Register
            </h3>
            <span className="ml-auto font-mono text-[10px] text-[var(--text4)]">
              {riskRegister.risks.length} risks identified
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left py-2 pr-3 font-mono text-[9px] text-[var(--text4)] uppercase tracking-wider w-[40px]">
                    ID
                  </th>
                  <th className="text-left py-2 pr-3 font-mono text-[9px] text-[var(--text4)] uppercase tracking-wider w-[90px]">
                    Category
                  </th>
                  <th className="text-left py-2 pr-3 font-mono text-[9px] text-[var(--text4)] uppercase tracking-wider">
                    Description
                  </th>
                  <th className="text-center py-2 pr-3 font-mono text-[9px] text-[var(--text4)] uppercase tracking-wider w-[70px]">
                    Likelihood
                  </th>
                  <th className="text-center py-2 pr-3 font-mono text-[9px] text-[var(--text4)] uppercase tracking-wider w-[70px]">
                    Impact
                  </th>
                </tr>
              </thead>
              <tbody>
                {riskRegister.risks.map((risk) => (
                  <tr
                    key={risk.id}
                    className="border-b border-[var(--border)]/50 hover:bg-[var(--surface2)] transition-colors group"
                  >
                    <td className="py-2.5 pr-3 font-mono font-semibold text-[var(--text3)]">
                      {risk.id}
                    </td>
                    <td className="py-2.5 pr-3 text-[var(--text2)]">
                      {risk.category}
                    </td>
                    <td className="py-2.5 pr-3 text-[var(--text2)]">
                      <div>{risk.description}</div>
                      <div className="text-[10px] text-[var(--pos)] mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <CheckCircle2 className="w-3 h-3 inline -mt-px mr-1" />
                        {risk.mitigation}
                      </div>
                    </td>
                    <td className="py-2.5 pr-3 text-center">
                      {riskBadge(risk.likelihood)}
                    </td>
                    <td className="py-2.5 pr-3 text-center">
                      {riskBadge(risk.impact)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Assumptions ── */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--r-lg)] p-6 shadow-[var(--sh-sm)]">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 size={16} className="text-[var(--pos)]" />
            <h3 className="text-sm font-semibold text-[var(--text)]">
              Key Assumptions
            </h3>
          </div>
          <div className="space-y-2">
            {riskRegister.assumptions.map((a) => (
              <div
                key={a.id}
                className="flex items-start gap-3 p-3 bg-[var(--surface2)] rounded-lg"
              >
                <span className="font-mono text-[9px] text-[var(--text4)] font-semibold shrink-0 mt-0.5">
                  {a.id}
                </span>
                <div className="flex-1">
                  <span className="font-mono text-[9px] text-[var(--accent)] uppercase tracking-wider">
                    {a.category}
                  </span>
                  <div className="text-xs text-[var(--text2)] mt-0.5">
                    {a.statement}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
