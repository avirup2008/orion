"use client";

import { useAppState, useAppDispatch, getSectionSummaries } from "@/lib/store";
import QuestionInput from "./QuestionInput";
import ClientContextForm from "./ClientContextForm";
import QuestionList from "./QuestionList";
import { ArrowRight, FileText } from "lucide-react";

export default function IntakePage() {
  const { questions, client } = useAppState();
  const dispatch = useAppDispatch();
  const sections = getSectionSummaries(questions);

  const canProceed = questions.length > 0;

  const handleProceed = () => {
    if (!canProceed) return;
    dispatch({ type: "SET_VIEW", view: "studio" });
    dispatch({ type: "SET_ACTIVE_QUESTION", id: questions[0]?.id ?? null });
  };

  return (
    <div className="h-full overflow-y-auto bg-[var(--bg)]">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-[var(--navy)] px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center text-white font-bold text-sm">
            O
          </div>
          <div>
            <div className="text-white text-sm font-bold">
              Orion<span className="text-[var(--accent)]">.</span>
            </div>
            <div className="text-[10px] text-white/40 font-mono uppercase tracking-wider">
              by EyeOn
            </div>
          </div>
        </div>
        <button
          onClick={handleProceed}
          disabled={!canProceed}
          className="flex items-center gap-2 px-5 py-[10px] rounded-[var(--r)] text-xs font-semibold bg-[var(--accent)] text-white hover:brightness-110 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          Open Proposal Studio
          <ArrowRight size={14} />
        </button>
      </header>

      {/* Content */}
      <div className="max-w-[960px] mx-auto px-8 py-8">
        {/* Title Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[var(--text)] mb-1">
            New Proposal
          </h1>
          <p className="text-sm text-[var(--text3)]">
            Add your RFP questions and client context to get started.
          </p>
        </div>

        <div className="grid grid-cols-[1fr_340px] gap-8">
          {/* Left Column: Questions */}
          <div className="space-y-6">
            {/* Add Questions Card */}
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--r-lg)] p-6 shadow-[var(--sh-sm)]">
              <div className="flex items-center gap-2 mb-4">
                <FileText size={16} className="text-[var(--accent)]" />
                <h2 className="text-sm font-semibold text-[var(--text)]">
                  Add Questions
                </h2>
              </div>
              <QuestionInput />
            </div>

            {/* Question List */}
            {questions.length > 0 && (
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--r-lg)] p-6 shadow-[var(--sh-sm)]">
                <QuestionList />
              </div>
            )}
          </div>

          {/* Right Column: Client Context + Summary */}
          <div className="space-y-6">
            {/* Client Context Card */}
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--r-lg)] p-6 shadow-[var(--sh-sm)]">
              <h2 className="text-sm font-semibold text-[var(--text)] mb-1">
                Client Context
              </h2>
              <p className="text-[11px] text-[var(--text4)] mb-4">
                Tailors AI responses to the client
              </p>
              <ClientContextForm />
            </div>

            {/* Summary Card */}
            {questions.length > 0 && (
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--r-lg)] p-6 shadow-[var(--sh-sm)]">
                <h2 className="text-sm font-semibold text-[var(--text)] mb-3">
                  Intake Summary
                </h2>

                <div className="space-y-2 mb-4">
                  {sections.map((s) => (
                    <div key={s.category} className="flex items-center gap-2">
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

                <div className="pt-3 border-t border-[var(--border)]">
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
          </div>
        </div>
      </div>
    </div>
  );
}
