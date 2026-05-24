"use client";

import { CATEGORY_CONFIG } from "@/types";
import type { ProposalProject, RfpQuestion } from "@/types";
import { useAppDispatch, useAppState } from "@/lib/store";
import { Settings2 } from "lucide-react";

interface OutlinePanelProps {
  project: ProposalProject;
  activeQuestionId: string | null;
  onSelectQuestion: (id: string) => void;
}

function statusLabel(q: RfpQuestion) {
  switch (q.status) {
    case "final":
      return <span className="ml-auto font-mono text-[9px] text-[var(--pos)]">✓</span>;
    case "review":
      return <span className="ml-auto font-mono text-[9px] text-[var(--gold)]">review</span>;
    case "draft":
      return <span className="ml-auto font-mono text-[9px] text-[var(--gold)]">draft</span>;
    case "generating":
      return <span className="ml-auto font-mono text-[9px] text-[var(--accent2)]">editing</span>;
    case "queued":
      return <span className="ml-auto font-mono text-[9px] text-white/20">&mdash;</span>;
  }
}

export default function OutlinePanel({
  project,
  activeQuestionId,
  onSelectQuestion,
}: OutlinePanelProps) {
  const dispatch = useAppDispatch();
  const { clarification } = useAppState();

  return (
    <aside className="w-[260px] min-w-[260px] bg-[var(--navy)] text-white/70 flex flex-col overflow-hidden">
      {/* Brand header */}
      <div className="px-5 pt-[18px] pb-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-[10px] mb-[14px]">
          <div className="w-7 h-7 rounded-[7px] bg-[var(--accent)] flex items-center justify-center font-bold text-xs text-white">
            O
          </div>
          <div>
            <div className="text-[15px] font-bold text-white tracking-[0.5px]">
              Orion<span className="text-[var(--accent2)]">.</span>
            </div>
            <div className="font-mono text-[8px] text-white/30 uppercase tracking-[1.5px] mt-[1px]">
              by EyeOn
            </div>
          </div>
        </div>
        <div className="text-xs text-white/45">
          {project.clientName} &mdash; {project.rfpTitle}
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-5 py-4 border-b border-white/[0.06]">
        <div className="font-mono text-[9px] text-white/30 uppercase tracking-[1.5px] mb-2 flex justify-between">
          <span>Proposal Progress</span>
          <span className="text-white/50 font-semibold">
            {project.completionPercent}%
          </span>
        </div>
        <div className="h-1 bg-white/[0.08] rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--accent2)] rounded-full transition-all duration-500"
            style={{ width: `${project.completionPercent}%` }}
          />
        </div>
      </div>

      {/* Clarification button */}
      <div className="px-5 py-3 border-b border-white/[0.06]">
        <button
          onClick={() => dispatch({ type: "SHOW_CLARIFICATION", show: true })}
          className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-medium transition-all ${
            clarification.isComplete
              ? "bg-white/[0.04] text-white/40 hover:bg-white/[0.08] hover:text-white/60"
              : "bg-[var(--accent)]/20 text-[var(--accent2)] hover:bg-[var(--accent)]/30"
          }`}
        >
          <Settings2 size={13} />
          {clarification.isComplete ? "Edit Engagement Settings" : "Configure Engagement"}
          {!clarification.isComplete && (
            <span className="ml-auto w-2 h-2 rounded-full bg-[var(--accent2)] animate-pulse" />
          )}
        </button>
      </div>

      {/* Sections + questions */}
      <div className="flex-1 overflow-y-auto py-2 dark-scroll">
        {/* Sections overview */}
        <div className="font-mono text-[8px] text-white/20 uppercase tracking-[2px] px-5 pt-3 pb-1">
          Sections
        </div>
        {project.sections.map((s) => {
          const cfg = CATEGORY_CONFIG[s.category];
          const isDone = s.completed === s.total;
          const hasDrafts = s.completed > 0 && !isDone;
          return (
            <div
              key={s.category}
              className="flex items-center gap-[10px] px-5 py-2 text-xs cursor-pointer transition-colors hover:bg-white/[0.04]"
            >
              <div
                className="w-[6px] h-[6px] rounded-full shrink-0"
                style={{ background: s.color }}
              />
              <span>
                {cfg.label} ({s.total})
              </span>
              <span
                className={`ml-auto font-mono text-[9px] ${
                  isDone
                    ? "text-[var(--pos)]"
                    : hasDrafts
                    ? "text-[var(--gold)]"
                    : "text-white/20"
                }`}
              >
                {s.completed}/{s.total}
              </span>
            </div>
          );
        })}

        {/* Questions list */}
        <div className="font-mono text-[8px] text-white/20 uppercase tracking-[2px] px-5 pt-4 pb-1">
          Questions
        </div>
        {project.questions.map((q) => {
          const isActive = q.id === activeQuestionId;
          const isDone = q.status === "final";
          return (
            <div
              key={q.id}
              onClick={() => onSelectQuestion(q.id)}
              className={`flex items-center gap-[10px] px-5 py-2 cursor-pointer transition-colors text-[11px] ${
                isActive
                  ? "bg-white/[0.08] text-white"
                  : isDone
                  ? "text-white/30 hover:bg-white/[0.04]"
                  : q.status === "queued"
                  ? "text-white/45 hover:bg-white/[0.04]"
                  : "text-white/60 hover:bg-white/[0.04]"
              }`}
            >
              <span className="truncate flex-1">
                Q{q.number}. {q.text}
              </span>
              {statusLabel(q)}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
