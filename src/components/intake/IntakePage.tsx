"use client";

import { useAppState, useAppDispatch, getSectionSummaries } from "@/lib/store";
import QuestionInput from "./QuestionInput";
import ClientContextForm from "./ClientContextForm";
import QuestionList from "./QuestionList";
import { useDeckGeneration, PIPELINE_STEPS } from "@/hooks/useDeckGeneration";
import DeckOutlineEditor from "@/components/deck/DeckOutlineEditor";
import {
  ArrowRight,
  FileText,
  Globe2,
  FolderOpen,
  Presentation,
  Loader2,
  Sparkles,
  Eye,
  EyeOff,
} from "lucide-react";

export default function IntakePage() {
  const { questions, client } = useAppState();
  const dispatch = useAppDispatch();
  const sections = getSectionSummaries(questions);

  const {
    status,
    progress,
    stage,
    error,
    outline,
    generateDeck,
    approveOutline,
    cancelOutline,
    enableOutlineReview,
    setEnableOutlineReview,
    targetSlideCount,
    setTargetSlideCount,
  } = useDeckGeneration();

  const canProceed = questions.length > 0;
  const canGenerate = questions.length > 0 || client.companyName.trim().length > 0;

  const handleProceed = () => {
    if (!canProceed) return;
    dispatch({ type: "SET_VIEW", view: "studio" });
    dispatch({ type: "SET_ACTIVE_QUESTION", id: questions[0]?.id ?? null });
  };

  return (
    <div className="h-full overflow-y-auto bg-[var(--bg)]">
      {/* ═══════════════════════════════════════════════════════════ */}
      {/* NAV BAR                                                   */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <nav className="px-10 py-5 flex items-center justify-between border-b border-[var(--border)]">
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
              className="flex items-center gap-2 px-5 py-[10px] rounded-lg text-xs font-semibold text-[var(--accent)] border border-[var(--accent-bd)] bg-[var(--accent-pale)] hover:bg-[var(--accent)]/15 transition-all"
            >
              Open Studio
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* HERO                                                       */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        {/* Subtle gradient blobs */}
        <div className="absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full bg-[var(--accent)]/[0.04] blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-16 -left-24 w-[300px] h-[300px] rounded-full bg-[var(--gold)]/[0.03] blur-[60px] pointer-events-none" />

        <div className="max-w-[960px] mx-auto px-8 pt-14 pb-10 relative">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={14} className="text-[var(--accent)]" />
            <span className="text-[10px] font-mono font-semibold text-[var(--accent)] uppercase tracking-[1.5px]">
              AI-Powered Proposal Engine
            </span>
          </div>
          <h1 className="text-[36px] font-bold text-[var(--text)] leading-[1.15] mb-3 tracking-[-0.5px]">
            Build Your Proposal Deck
          </h1>
          <p className="text-[15px] text-[var(--text3)] max-w-[560px] leading-relaxed">
            Add RFP questions, set client context, and let Orion generate a
            McKinsey-quality PPTX deck — ready to download in minutes.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* TWO-COLUMN LAYOUT                                          */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="pb-16 px-8">
        <div className="max-w-[960px] mx-auto">
          <div className="grid grid-cols-[1fr_380px] gap-8">
            {/* ─── Left Column: Questions ─── */}
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

            {/* ─── Right Column: Context + Summary + CTA ─── */}
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
                        Client:{" "}
                        <span className="text-[var(--text2)] font-medium">
                          {client.companyName}
                        </span>
                        {client.industry && (
                          <span> &middot; {client.industry}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ═══════════════════════════════════════════════════ */}
              {/* GENERATE DECK — PRIMARY CTA                        */}
              {/* ═══════════════════════════════════════════════════ */}
              <div className="rounded-xl overflow-hidden shadow-[var(--sh-lg)]">
                {/* Review toggle */}
                <div className="bg-[var(--surface2)] px-4 py-2.5 flex items-center justify-between border border-[var(--border)] border-b-0 rounded-t-xl gap-3">
                  {/* Slide count selector */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-[var(--text3)] font-medium whitespace-nowrap">
                      Slides
                    </span>
                    <select
                      value={targetSlideCount}
                      onChange={(e) => setTargetSlideCount(Number(e.target.value))}
                      className="bg-[var(--surface)] border border-[var(--border)] rounded-md px-2 py-1 text-[11px] font-semibold text-[var(--text2)] cursor-pointer"
                    >
                      <option value={0}>Auto</option>
                      <option value={8}>~8 (Brief)</option>
                      <option value={12}>~12 (Standard)</option>
                      <option value={18}>~18 (Detailed)</option>
                      <option value={25}>~25 (Comprehensive)</option>
                    </select>
                  </div>
                  {/* Review toggle */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-[var(--text3)] font-medium whitespace-nowrap">
                      Review outline
                    </span>
                    <button
                      onClick={() => setEnableOutlineReview(!enableOutlineReview)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all ${
                        enableOutlineReview
                          ? "bg-[var(--accent-pale)] text-[var(--accent)] border border-[var(--accent-bd)]"
                          : "bg-[var(--surface3)] text-[var(--text4)] border border-[var(--border)]"
                      }`}
                    >
                      {enableOutlineReview ? <Eye size={11} /> : <EyeOff size={11} />}
                      {enableOutlineReview ? "On" : "Off"}
                    </button>
                  </div>
                </div>

                {/* Main CTA button */}
                <button
                  onClick={generateDeck}
                  disabled={!canGenerate || status === "generating"}
                  className={`w-full relative flex items-center justify-center gap-3 px-8 py-5 text-[15px] font-bold tracking-[-0.2px] transition-all duration-200 ${
                    status === "generating"
                      ? "bg-[var(--navy)] text-white/80 cursor-wait"
                      : status === "error"
                      ? "bg-red-900 text-white hover:bg-red-800"
                      : canGenerate
                      ? "bg-[var(--navy)] text-white hover:bg-[var(--navy2)] active:scale-[0.995]"
                      : "bg-[var(--navy)]/40 text-white/30 cursor-not-allowed"
                  }`}
                >
                  {status === "generating" ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <Presentation size={20} />
                  )}
                  {status === "generating"
                    ? "Generating Deck..."
                    : status === "error"
                    ? "Retry — Generate Deck"
                    : "Generate Deck"}
                </button>

                {/* Progress panel — slides down when generating */}
                {status === "generating" && (
                  <div className="bg-[var(--navy2)] px-6 py-5 border-t border-white/[0.06]">
                    {/* Progress bar */}
                    <div className="h-2 bg-white/[0.08] rounded-full overflow-hidden mb-3">
                      <div
                        className="h-full bg-[var(--accent2)] rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    {/* Stage label + percentage */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] text-white/50 truncate max-w-[260px]">
                        {stage}
                      </span>
                      <span className="text-[11px] font-mono font-semibold text-white/40 ml-2 shrink-0">
                        {progress}%
                      </span>
                    </div>

                    {/* Pipeline step indicators */}
                    <div className="flex items-center gap-2">
                      {PIPELINE_STEPS.map((step) => (
                        <div key={step.label} className="flex items-center gap-1.5">
                          <div
                            className={`w-[6px] h-[6px] rounded-full transition-colors duration-300 ${
                              progress >= step.threshold
                                ? "bg-[var(--accent2)]"
                                : "bg-white/[0.12]"
                            }`}
                          />
                          <span
                            className={`text-[8px] font-mono uppercase tracking-wider transition-colors duration-300 ${
                              progress >= step.threshold
                                ? "text-white/60"
                                : "text-white/20"
                            }`}
                          >
                            {step.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Error message */}
                {status === "error" && error && (
                  <div className="bg-red-950/80 px-6 py-3 border-t border-red-500/20">
                    <p className="text-[11px] text-red-300/80">{error}</p>
                  </div>
                )}
              </div>

              {/* ─── Secondary actions ─── */}
              <div className="flex items-center gap-3">
                {canProceed && (
                  <button
                    onClick={handleProceed}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-semibold text-[var(--accent)] border border-[var(--accent-bd)] bg-[var(--accent-pale)] hover:bg-[var(--accent)]/15 transition-all"
                  >
                    Open Proposal Studio
                    <ArrowRight size={14} />
                  </button>
                )}
                <button
                  onClick={() => dispatch({ type: "SET_VIEW", view: "proposals" })}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-semibold text-[var(--text3)] border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface2)] transition-all"
                >
                  <FolderOpen size={14} />
                  My Proposals
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* OUTLINE REVIEW MODAL                                       */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {status === "outline-review" && outline && (
        <DeckOutlineEditor
          outline={outline}
          onApprove={approveOutline}
          onCancel={cancelOutline}
        />
      )}

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
