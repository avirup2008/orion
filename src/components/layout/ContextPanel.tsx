"use client";

import { useState } from "react";
import type { KbMatch, PastProposal } from "@/types";

interface ContextPanelProps {
  kbMatches: KbMatch[];
  pastProposals: PastProposal[];
}

type Tab = "kb" | "past" | "scoring";

export default function ContextPanel({
  kbMatches,
  pastProposals,
}: ContextPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>("kb");

  const tabs: { id: Tab; label: string }[] = [
    { id: "kb", label: "KB Matches" },
    { id: "past", label: "Past Answers" },
    { id: "scoring", label: "Scoring" },
  ];

  return (
    <aside className="w-[300px] min-w-[300px] bg-[var(--surface2)] border-l border-[var(--border)] overflow-hidden flex flex-col">
      {/* Tab header */}
      <div className="sticky top-0 z-[5] bg-[var(--surface2)]/95 backdrop-blur-[8px] border-b border-[var(--border)] px-[18px] py-3">
        <div className="flex gap-[2px]">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`font-mono text-[9px] font-medium uppercase tracking-[1px] px-3 py-[6px] rounded-md transition-all ${
                activeTab === tab.id
                  ? "bg-[var(--accent-pale)] text-[var(--accent)] font-semibold"
                  : "text-[var(--text4)] hover:bg-[var(--surface3)] hover:text-[var(--text2)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-[18px] pt-4">
        {activeTab === "kb" && (
          <>
            <div className="font-mono text-[9px] font-semibold uppercase tracking-[1.5px] text-[var(--text3)] mb-[10px]">
              Relevant Knowledge
            </div>
            {kbMatches.map((match) => (
              <div
                key={match.id}
                className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-[14px] mb-2 shadow-[var(--sh-sm)] cursor-pointer transition-all hover:shadow-[var(--sh)] hover:-translate-y-px"
              >
                <div className="text-xs font-semibold text-[var(--text)] mb-1">
                  {match.title}
                </div>
                <div className="font-mono text-[9px] text-[var(--text4)]">
                  {match.source} &middot; {match.matchScore}% match
                </div>
                <div className="text-[11px] text-[var(--text3)] leading-[1.5] mt-[6px]">
                  {match.preview}
                </div>
                <div className="flex items-center gap-[6px] mt-[6px]">
                  <div className="flex-1 h-[3px] bg-[var(--surface3)] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${match.matchScore}%`,
                        background:
                          match.matchScore >= 90
                            ? "var(--pos)"
                            : match.matchScore >= 80
                            ? "var(--gold)"
                            : "var(--blue)",
                      }}
                    />
                  </div>
                  <span className="font-mono text-[9px] font-semibold text-[var(--text3)]">
                    {match.matchScore}%
                  </span>
                </div>
              </div>
            ))}
          </>
        )}

        {activeTab === "past" && (
          <>
            <div className="font-mono text-[9px] font-semibold uppercase tracking-[1.5px] text-[var(--text3)] mb-[10px]">
              Past Proposals
            </div>
            {pastProposals.map((p) => (
              <div
                key={p.id}
                className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-[14px] mb-2 shadow-[var(--sh-sm)] cursor-pointer transition-all hover:shadow-[var(--sh)] hover:-translate-y-px"
              >
                <div className="text-xs font-semibold text-[var(--text)] mb-1">
                  {p.title}
                </div>
                <div className="font-mono text-[9px] text-[var(--text4)]">
                  {p.year} &middot;{" "}
                  <span
                    className={
                      p.outcome === "won"
                        ? "text-[var(--pos)]"
                        : p.outcome === "lost"
                        ? "text-[var(--neg)]"
                        : "text-[var(--gold)]"
                    }
                  >
                    {p.outcome === "won"
                      ? "Won"
                      : p.outcome === "lost"
                      ? "Lost"
                      : "Pending"}
                  </span>{" "}
                  &middot; {p.similarityScore}% similar
                </div>
                <div className="text-[11px] text-[var(--text3)] leading-[1.5] mt-[6px]">
                  {p.preview}
                </div>
              </div>
            ))}
          </>
        )}

        {activeTab === "scoring" && (
          <>
            <div className="font-mono text-[9px] font-semibold uppercase tracking-[1.5px] text-[var(--text3)] mb-[10px]">
              Scoring Criteria
            </div>
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-[14px] shadow-[var(--sh-sm)]">
              <div className="text-[11px] text-[var(--text3)] leading-[1.6]">
                Scoring criteria will be extracted from the RFP document when
                available. This panel will show how well the current response
                aligns with each evaluation criterion.
              </div>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
