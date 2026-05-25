"use client";

import { useAppState, useAppDispatch, getSectionSummaries } from "@/lib/store";
import QuestionInput from "./QuestionInput";
import ClientContextForm from "./ClientContextForm";
import QuestionList from "./QuestionList";
import {
  ArrowRight,
  FileText,
  Globe2,
  FolderOpen,
} from "lucide-react";

export default function IntakePage() {
  const { questions, client, clarification } = useAppState();
  const dispatch = useAppDispatch();
  const sections = getSectionSummaries(questions);

  const canProceed = questions.length > 0;

  const handleProceed = () => {
    if (!canProceed) return;
    dispatch({ type: "SET_VIEW", view: "studio" });
    dispatch({ type: "SET_ACTIVE_QUESTION", id: questions[0]?.id ?? null });
    if (!clarification.isComplete) {
      dispatch({ type: "SHOW_CLARIFICATION", show: true });
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-[var(--bg)]">
      {/* ═══════════════════════════════════════════════════════════ */}
      {/* NAV BAR                                                   */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <nav className="px-10 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[var(--accent)] flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
          </div>
          <div>
            <div className="text-[var(--text)] text-lg font-bold tracking-tight">
              Orion<span className="text-[var(--accent)]">.</span>
            </div>
            <div className="text-[9px] text-[var(--text4)] font-mono uppercase tracking-[2px]">
              by EyeOn
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => dispatch({ type: "SET_VIEW", view: "proposals" })}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium text-[var(--text3)] hover:text-[var(--text)] hover:bg-[var(--surface2)] transition-all"
          >
            <FolderOpen size={14} />
            My Proposals
          </button>
          {canProceed && (
            <button
              onClick={handleProceed}
              className="flex items-center gap-2 px-5 py-[10px] rounded-lg text-xs font-semibold bg-[var(--accent)] text-white hover:bg-[var(--accent2)] transition-all"
            >
              Open Studio
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* INTAKE FORM                                                */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="pt-6 pb-16 px-8">
        <div className="max-w-[960px] mx-auto">
          {/* Section header */}
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="text-[10px] font-mono font-semibold text-[var(--accent)] uppercase tracking-[1.5px] mb-2">
                New Proposal
              </div>
              <h2 className="text-2xl font-bold text-[var(--text)] mb-1">
                Configure your proposal
              </h2>
              <p className="text-sm text-[var(--text3)]">
                Add RFP questions and client context. Orion handles the rest.
              </p>
            </div>
            <button
              onClick={handleProceed}
              disabled={!canProceed}
              className="flex items-center gap-2 px-6 py-3 rounded-lg text-xs font-semibold bg-[var(--accent)] text-white hover:bg-[var(--accent2)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Open Proposal Studio
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Form content */}
          <div className="grid grid-cols-[1fr_340px] gap-8">
            {/* Left Column: Questions */}
            <div className="space-y-6">
              {/* Add Questions Card */}
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 shadow-[var(--sh-sm)]">
                <div className="flex items-center gap-2 mb-4">
                  <FileText size={15} className="text-[var(--accent)]" />
                  <h3 className="text-sm font-semibold text-[var(--text)]">
                    Add Questions
                  </h3>
                </div>
                <QuestionInput />
              </div>

              {/* Question List */}
              {questions.length > 0 && (
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 shadow-[var(--sh-sm)]">
                  <QuestionList />
                </div>
              )}
            </div>

            {/* Right Column: Client Context + Summary */}
            <div className="space-y-6">
              {/* Client Context Card */}
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 shadow-[var(--sh-sm)]">
                <div className="flex items-center gap-2 mb-1">
                  <Globe2 size={15} className="text-[var(--accent)]" />
                  <h3 className="text-sm font-semibold text-[var(--text)]">
                    Client Context
                  </h3>
                </div>
                <p className="text-[11px] text-[var(--text4)] mb-4 ml-[23px]">
                  Tailors AI responses to the client
                </p>
                <ClientContextForm />
              </div>

              {/* Summary Card */}
              {questions.length > 0 && (
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 shadow-[var(--sh-sm)]">
                  <h3 className="text-sm font-semibold text-[var(--text)] mb-4">
                    Intake Summary
                  </h3>

                  <div className="space-y-2.5 mb-4">
                    {sections.map((s) => (
                      <div key={s.category} className="flex items-center gap-3">
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ background: s.color }}
                        />
                        <span className="text-xs text-[var(--text2)] flex-1 capitalize">
                          {s.category}
                        </span>
                        <span className="font-mono text-[10px] font-semibold text-[var(--text3)]">
                          {s.total}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-[var(--border)]">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs text-[var(--text3)]">Total</span>
                      <span className="font-mono text-lg font-bold text-[var(--text)]">
                        {questions.length}
                      </span>
                    </div>
                    {client.companyName && (
                      <div className="mt-2 text-[11px] text-[var(--text4)]">
                        Client: <span className="text-[var(--text2)] font-medium">{client.companyName}</span>
                        {client.industry && (
                          <span> &middot; {client.industry}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Ready state */}
              {canProceed && (
                <button
                  onClick={handleProceed}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl text-sm font-semibold bg-[var(--accent)] text-white hover:bg-[var(--accent2)] transition-all"
                >
                  Open Proposal Studio
                  <ArrowRight size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* FOOTER                                                    */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <footer className="border-t border-[var(--border)] px-8 py-6">
        <div className="max-w-[960px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[var(--text3)]">
              Orion
            </span>
            <span className="text-[10px] text-[var(--text4)] font-mono">
              by EyeOn
            </span>
          </div>
          <div className="text-[10px] text-[var(--text4)] font-mono uppercase tracking-wider">
            Confidential
          </div>
        </div>
      </footer>
    </div>
  );
}
