"use client";

import { useState, useMemo } from "react";
import type { RfpQuestion } from "@/types";
import {
  generateChecklist,
  getChecklistSummaryText,
  getCategoryCompliance,
} from "@/lib/compliance-checklist";
import type { ChecklistItem, ChecklistItemStatus } from "@/lib/compliance-checklist";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Info,
} from "lucide-react";

interface ComplianceChecklistPanelProps {
  questions: RfpQuestion[];
}

// ── Status display helpers ──

const STATUS_ORDER: ChecklistItemStatus[] = ["missing", "partial", "needs-review", "complete"];

const STATUS_META: Record<
  ChecklistItemStatus,
  { label: string; color: string; paleBg: string; Icon: typeof CheckCircle2 }
> = {
  complete: {
    label: "Complete",
    color: "var(--pos)",
    paleBg: "var(--pos-pale)",
    Icon: CheckCircle2,
  },
  partial: {
    label: "Partial",
    color: "var(--gold)",
    paleBg: "var(--gold-pale)",
    Icon: AlertCircle,
  },
  missing: {
    label: "Missing",
    color: "var(--neg)",
    paleBg: "var(--neg-pale)",
    Icon: XCircle,
  },
  "needs-review": {
    label: "Needs Review",
    color: "#5D7FA3",
    paleBg: "var(--blue-pale)",
    Icon: Clock,
  },
};

function scoreRingColor(score: number): string {
  if (score >= 80) return "var(--pos)";
  if (score >= 60) return "var(--gold)";
  return "var(--neg)";
}

function scoreRingPaleBg(score: number): string {
  if (score >= 80) return "var(--pos-pale)";
  if (score >= 60) return "var(--gold-pale)";
  return "var(--neg-pale)";
}

// ── Component ──

export default function ComplianceChecklistPanel({
  questions,
}: ComplianceChecklistPanelProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const report = useMemo(() => generateChecklist(questions), [questions]);
  const categoryBreakdown = useMemo(() => getCategoryCompliance(report), [report]);
  const summaryText = useMemo(() => getChecklistSummaryText(report), [report]);

  // Group items by status in display order
  const groupedItems = useMemo(() => {
    const groups: Array<{ status: ChecklistItemStatus; items: ChecklistItem[] }> = [];
    for (const status of STATUS_ORDER) {
      const items = report.items.filter((i) => i.status === status);
      if (items.length > 0) {
        groups.push({ status, items });
      }
    }
    return groups;
  }, [report]);

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (questions.length === 0) {
    return (
      <div className="p-4 text-center">
        <BarChart3 size={20} className="mx-auto mb-2 text-[var(--text4)]" />
        <div className="text-[11px] text-[var(--text4)]">
          No questions loaded for compliance review
        </div>
      </div>
    );
  }

  const ringColor = scoreRingColor(report.overallScore);

  return (
    <div className="flex flex-col gap-3">
      {/* ── 1. Score Header ── */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-3 shadow-[var(--sh-sm)]">
        <div className="flex items-center gap-3">
          {/* Score ring */}
          <div
            className="relative w-[52px] h-[52px] shrink-0 rounded-full flex items-center justify-center"
            style={{ background: scoreRingPaleBg(report.overallScore) }}
          >
            <svg
              viewBox="0 0 36 36"
              className="absolute inset-0 w-full h-full -rotate-90"
            >
              <circle
                cx="18"
                cy="18"
                r="15.5"
                fill="none"
                stroke="var(--border)"
                strokeWidth="3"
              />
              <circle
                cx="18"
                cy="18"
                r="15.5"
                fill="none"
                stroke={ringColor}
                strokeWidth="3"
                strokeDasharray={`${(report.overallScore / 100) * 97.4} 97.4`}
                strokeLinecap="round"
              />
            </svg>
            <span
              className="text-sm font-bold relative z-[1]"
              style={{ color: ringColor }}
            >
              {report.overallScore}
            </span>
          </div>

          {/* Status counts */}
          <div className="flex-1 min-w-0 grid grid-cols-2 gap-x-3 gap-y-1">
            {(
              [
                ["complete", report.complete],
                ["partial", report.partial],
                ["missing", report.missing],
                ["needs-review", report.needsReview],
              ] as [ChecklistItemStatus, number][]
            ).map(([status, count]) => {
              const meta = STATUS_META[status];
              return (
                <div key={status} className="flex items-center gap-[5px]">
                  <span
                    className="w-[6px] h-[6px] rounded-full shrink-0"
                    style={{ background: meta.color }}
                  />
                  <span className="font-mono text-[9px] text-[var(--text3)] truncate">
                    {count} {meta.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 2. Category Breakdown ── */}
      {categoryBreakdown.length > 0 && (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-3 shadow-[var(--sh-sm)]">
          <div className="font-mono text-[9px] font-semibold uppercase tracking-[1.5px] text-[var(--text3)] mb-2">
            By Category
          </div>
          <div className="space-y-[6px]">
            {categoryBreakdown.map((cat) => (
              <div key={cat.category} className="flex items-center gap-2">
                <span className="text-[10px] text-[var(--text2)] w-[60px] truncate shrink-0">
                  {cat.label}
                </span>
                <div className="flex-1 h-[4px] bg-[var(--surface3)] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${cat.score}%`,
                      background: scoreRingColor(cat.score),
                    }}
                  />
                </div>
                <span className="font-mono text-[9px] font-semibold text-[var(--text3)] w-[26px] text-right shrink-0">
                  {cat.complete}/{cat.total}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 3. Item List (grouped by status) ── */}
      <div className="space-y-2">
        {groupedItems.map(({ status, items }) => {
          const meta = STATUS_META[status];
          return (
            <div key={status}>
              {/* Group header */}
              <div className="flex items-center gap-[5px] mb-1 px-1">
                <meta.Icon
                  size={10}
                  style={{ color: meta.color }}
                />
                <span
                  className="font-mono text-[8px] font-semibold uppercase tracking-[1px]"
                  style={{ color: meta.color }}
                >
                  {meta.label} ({items.length})
                </span>
              </div>

              {/* Items */}
              <div className="space-y-[3px]">
                {items.map((item) => {
                  const isExpanded = expandedItems.has(item.questionId);
                  const hasDetails =
                    item.issues.length > 0 || item.suggestions.length > 0;

                  return (
                    <div
                      key={item.questionId}
                      className="bg-[var(--surface)] border border-[var(--border)] rounded-md overflow-hidden"
                    >
                      <button
                        onClick={() => hasDetails && toggleExpand(item.questionId)}
                        className={`w-full text-left px-2.5 py-[7px] flex items-start gap-[6px] transition-colors ${
                          hasDetails
                            ? "hover:bg-[var(--surface2)] cursor-pointer"
                            : "cursor-default"
                        }`}
                      >
                        {/* Expand chevron */}
                        <span className="shrink-0 mt-[1px]">
                          {hasDetails ? (
                            isExpanded ? (
                              <ChevronDown size={10} className="text-[var(--text4)]" />
                            ) : (
                              <ChevronRight size={10} className="text-[var(--text4)]" />
                            )
                          ) : (
                            <span className="w-[10px] inline-block" />
                          )}
                        </span>

                        {/* Status dot */}
                        <span
                          className="w-[6px] h-[6px] rounded-full shrink-0 mt-[3px]"
                          style={{ background: meta.color }}
                        />

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="font-mono text-[9px] font-semibold text-[var(--text2)] shrink-0">
                              Q{item.questionNumber}
                            </span>
                            <span className="text-[10px] text-[var(--text3)] truncate">
                              {item.questionText}
                            </span>
                          </div>

                          {/* Badges row */}
                          <div className="flex items-center gap-[4px] mt-[3px] flex-wrap">
                            {/* Word count */}
                            <span className="font-mono text-[8px] px-[5px] py-[1px] rounded bg-[var(--surface2)] text-[var(--text4)]">
                              {item.responseWordCount}w
                            </span>

                            {/* Quality score */}
                            {item.qualityScore !== undefined && (
                              <span
                                className="font-mono text-[8px] px-[5px] py-[1px] rounded"
                                style={{
                                  background: scoreRingPaleBg(item.qualityScore),
                                  color: scoreRingColor(item.qualityScore),
                                }}
                              >
                                {item.qualityScore}%
                              </span>
                            )}
                          </div>
                        </div>
                      </button>

                      {/* Expanded details */}
                      {isExpanded && hasDetails && (
                        <div className="px-2.5 pb-2 pt-0 border-t border-[var(--border)]">
                          {item.issues.length > 0 && (
                            <div className="mt-[6px]">
                              <div className="font-mono text-[8px] uppercase tracking-[1px] text-[var(--neg)] font-semibold mb-[3px]">
                                Issues
                              </div>
                              {item.issues.map((issue, i) => (
                                <div
                                  key={i}
                                  className="text-[9px] text-[var(--text3)] leading-[1.5] pl-2 mb-[2px]"
                                >
                                  &bull; {issue}
                                </div>
                              ))}
                            </div>
                          )}

                          {item.suggestions.length > 0 && (
                            <div className="mt-[6px]">
                              <div className="font-mono text-[8px] uppercase tracking-[1px] text-[var(--blue)] font-semibold mb-[3px]">
                                Suggestions
                              </div>
                              {item.suggestions.map((suggestion, i) => (
                                <div
                                  key={i}
                                  className="text-[9px] text-[var(--text3)] leading-[1.5] pl-2 mb-[2px]"
                                >
                                  &bull; {suggestion}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── 4. Summary Text ── */}
      <div
        className="rounded-lg p-2.5 flex items-start gap-2"
        style={{
          background: "var(--blue-pale)",
          border: "1px solid rgba(23, 90, 166, 0.12)",
        }}
      >
        <Info size={12} className="text-[var(--blue)] shrink-0 mt-[1px]" />
        <p className="text-[10px] leading-[1.55] text-[var(--text3)]">
          {summaryText}
        </p>
      </div>
    </div>
  );
}
