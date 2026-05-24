"use client";

import { useAppState, useAppDispatch, getSectionSummaries } from "@/lib/store";
import QuestionInput from "./QuestionInput";
import ClientContextForm from "./ClientContextForm";
import QuestionList from "./QuestionList";
import {
  ArrowRight,
  FileText,
  Zap,
  BarChart3,
  Shield,
  Globe2,
  Sparkles,
  ChevronDown,
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

  const handleScrollToIntake = () => {
    document.getElementById("intake-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="h-full overflow-y-auto bg-[var(--bg)] scroll-smooth">
      {/* ═══════════════════════════════════════════════════════════ */}
      {/* HERO SECTION — Full-bleed Meridian-inspired dark gradient  */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[100vh] flex flex-col overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-[#0A1628]">
          {/* Mesh gradient blobs */}
          <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full opacity-[0.15] blur-[120px] animate-[drift_20s_ease-in-out_infinite]"
            style={{ background: "radial-gradient(circle, #1B4D4A 0%, transparent 70%)" }}
          />
          <div className="absolute bottom-[-30%] left-[-15%] w-[900px] h-[900px] rounded-full opacity-[0.1] blur-[140px] animate-[drift_25s_ease-in-out_infinite_reverse]"
            style={{ background: "radial-gradient(circle, #2A6B67 0%, transparent 70%)" }}
          />
          <div className="absolute top-[30%] left-[40%] w-[500px] h-[500px] rounded-full opacity-[0.08] blur-[100px] animate-[drift_15s_ease-in-out_infinite_2s]"
            style={{ background: "radial-gradient(circle, #BF801E 0%, transparent 70%)" }}
          />
          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: "60px 60px",
            }}
          />
          {/* Radial vignette */}
          <div className="absolute inset-0"
            style={{ background: "radial-gradient(ellipse 80% 60% at 50% 40%, transparent 0%, #0A1628 100%)" }}
          />
        </div>

        {/* Nav bar */}
        <nav className="relative z-10 px-10 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent2)] flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-[var(--accent)]/20">
              O
            </div>
            <div>
              <div className="text-white text-lg font-bold tracking-wide">
                Orion<span className="text-[var(--accent2)]">.</span>
              </div>
              <div className="text-[9px] text-white/30 font-mono uppercase tracking-[3px]">
                Proposal Engine
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => dispatch({ type: "SET_VIEW", view: "proposals" })}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium text-white/50 hover:text-white/80 hover:bg-white/[0.06] transition-all"
            >
              <FolderOpen size={14} />
              My Proposals
            </button>
            {canProceed && (
              <button
                onClick={handleProceed}
                className="flex items-center gap-2 px-5 py-[10px] rounded-xl text-xs font-semibold bg-gradient-to-r from-[var(--accent)] to-[var(--accent2)] text-white hover:brightness-110 transition-all shadow-lg shadow-[var(--accent)]/30"
              >
                Open Studio
                <ArrowRight size={14} />
              </button>
            )}
          </div>
        </nav>

        {/* Hero content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 text-center -mt-10">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 px-4 py-[6px] rounded-full bg-white/[0.06] border border-white/[0.08] backdrop-blur-sm mb-8">
            <Sparkles size={12} className="text-[var(--accent2)]" />
            <span className="text-[11px] text-white/60 font-medium">
              Powered by Claude AI &mdash; Built for Anaplan Partners
            </span>
          </div>

          {/* Main headline */}
          <h1 className="text-[56px] leading-[1.08] font-bold text-white tracking-[-1.5px] max-w-[800px] mb-6">
            Win more deals with{" "}
            <span className="bg-gradient-to-r from-[#2A9D8F] via-[#2A6B67] to-[#1B4D4A] bg-clip-text text-transparent">
              AI-powered
            </span>{" "}
            proposals
          </h1>

          {/* Subheading */}
          <p className="text-lg text-white/45 max-w-[520px] leading-[1.7] mb-10 font-light">
            Transform RFP questions into compelling, differentiated Anaplan proposals in minutes &mdash; not days.
          </p>

          {/* CTA buttons */}
          <div className="flex items-center gap-4 mb-16">
            <button
              onClick={handleScrollToIntake}
              className="group flex items-center gap-3 px-8 py-4 rounded-xl text-sm font-semibold bg-gradient-to-r from-[var(--accent)] to-[var(--accent2)] text-white hover:brightness-110 transition-all shadow-xl shadow-[var(--accent)]/25 hover:shadow-[var(--accent)]/40 hover:-translate-y-[1px]"
            >
              Start New Proposal
              <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={() => dispatch({ type: "SET_VIEW", view: "proposals" })}
              className="flex items-center gap-2 px-6 py-4 rounded-xl text-sm font-medium text-white/60 border border-white/[0.1] hover:bg-white/[0.04] hover:text-white/80 hover:border-white/[0.18] transition-all"
            >
              <FolderOpen size={15} />
              Load Existing
            </button>
          </div>

          {/* Stats bar */}
          <div className="flex items-center gap-[1px] rounded-2xl overflow-hidden bg-white/[0.03] border border-white/[0.06] backdrop-blur-md">
            {[
              { value: "6", label: "RFP Categories", icon: FileText },
              { value: "50+", label: "KB Entries", icon: Globe2 },
              { value: "3", label: "Export Formats", icon: BarChart3 },
              { value: "5", label: "AI Agents", icon: Zap },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className={`flex items-center gap-3 px-6 py-4 ${
                  i > 0 ? "border-l border-white/[0.06]" : ""
                }`}
              >
                <stat.icon size={14} className="text-[var(--accent2)]" />
                <div className="text-left">
                  <div className="text-white font-bold text-sm">{stat.value}</div>
                  <div className="text-[10px] text-white/35 font-mono uppercase tracking-wider">
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="relative z-10 flex justify-center pb-8">
          <button
            onClick={handleScrollToIntake}
            className="flex flex-col items-center gap-1 text-white/20 hover:text-white/40 transition-all animate-bounce"
          >
            <span className="text-[9px] font-mono uppercase tracking-[2px]">
              Begin
            </span>
            <ChevronDown size={16} />
          </button>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* FEATURES STRIP — Capability highlights                    */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="bg-[var(--navy)] border-y border-white/[0.05]">
        <div className="max-w-[1100px] mx-auto px-10 py-16">
          <div className="text-center mb-12">
            <h2 className="text-xl font-bold text-white mb-2">
              Everything you need to win
            </h2>
            <p className="text-sm text-white/40">
              End-to-end proposal generation from intake to export
            </p>
          </div>

          <div className="grid grid-cols-4 gap-6">
            {[
              {
                icon: FileText,
                title: "Multi-Format Input",
                desc: "Paste, PDF, Excel, CSV — any format, instant parsing with auto-categorization",
                color: "#5D7FA3",
              },
              {
                icon: Zap,
                title: "AI Response Engine",
                desc: "Multi-agent orchestration generates unique, client-tailored responses per question",
                color: "#2A9D8F",
              },
              {
                icon: BarChart3,
                title: "Full Costing Engine",
                desc: "Rate cards, effort matrices, licensing, margin analysis — complete commercial model",
                color: "#BF801E",
              },
              {
                icon: Shield,
                title: "Anaplan Expertise",
                desc: "Deep embedded KB covering 6 modules, CloudWorks, Polaris, PlanIQ, and 50+ accelerators",
                color: "#7B6FAB",
              },
            ].map((feat) => (
              <div
                key={feat.title}
                className="group relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 hover:bg-white/[0.05] hover:border-white/[0.1] transition-all duration-300 hover:-translate-y-1"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                  style={{ background: `${feat.color}20` }}
                >
                  <feat.icon size={18} style={{ color: feat.color }} />
                </div>
                <h3 className="text-sm font-semibold text-white mb-2">
                  {feat.title}
                </h3>
                <p className="text-[12px] text-white/40 leading-[1.6]">
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* INTAKE SECTION — The actual functional form                */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section id="intake-section" className="scroll-mt-0">
        {/* Section header with gradient transition */}
        <div className="bg-gradient-to-b from-[var(--navy)] to-[var(--bg)] pt-16 pb-8 px-8">
          <div className="max-w-[960px] mx-auto">
            <div className="flex items-end justify-between">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-[5px] rounded-full bg-[var(--accent-pale)] border border-[var(--accent-bd)] mb-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent2)] animate-pulse" />
                  <span className="text-[10px] font-mono font-semibold text-[var(--accent)] uppercase tracking-[1.5px]">
                    New Proposal
                  </span>
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
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-semibold bg-gradient-to-r from-[var(--accent)] to-[var(--accent2)] text-white hover:brightness-110 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg shadow-[var(--accent)]/15 disabled:shadow-none"
              >
                Open Proposal Studio
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Form content */}
        <div className="max-w-[960px] mx-auto px-8 pb-16">
          <div className="grid grid-cols-[1fr_340px] gap-8">
            {/* Left Column: Questions */}
            <div className="space-y-6">
              {/* Add Questions Card */}
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-[var(--sh-sm)] hover:shadow-[var(--sh)] transition-shadow">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-[var(--accent-pale)] flex items-center justify-center">
                    <FileText size={14} className="text-[var(--accent)]" />
                  </div>
                  <h3 className="text-sm font-semibold text-[var(--text)]">
                    Add Questions
                  </h3>
                </div>
                <QuestionInput />
              </div>

              {/* Question List */}
              {questions.length > 0 && (
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-[var(--sh-sm)] hover:shadow-[var(--sh)] transition-shadow">
                  <QuestionList />
                </div>
              )}
            </div>

            {/* Right Column: Client Context + Summary */}
            <div className="space-y-6">
              {/* Client Context Card */}
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-[var(--sh-sm)] hover:shadow-[var(--sh)] transition-shadow">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded-lg bg-[var(--accent-pale)] flex items-center justify-center">
                    <Globe2 size={14} className="text-[var(--accent)]" />
                  </div>
                  <h3 className="text-sm font-semibold text-[var(--text)]">
                    Client Context
                  </h3>
                </div>
                <p className="text-[11px] text-[var(--text4)] mb-4 ml-9">
                  Tailors AI responses to the client
                </p>
                <ClientContextForm />
              </div>

              {/* Summary Card */}
              {questions.length > 0 && (
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-[var(--sh-sm)] hover:shadow-[var(--sh)] transition-shadow">
                  <h3 className="text-sm font-semibold text-[var(--text)] mb-4">
                    Intake Summary
                  </h3>

                  <div className="space-y-2.5 mb-4">
                    {sections.map((s) => (
                      <div key={s.category} className="flex items-center gap-3">
                        <div
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{
                            background: s.color,
                            boxShadow: `0 0 0 2px var(--surface), 0 0 0 4px ${s.color}30`,
                          }}
                        />
                        <span className="text-xs text-[var(--text2)] flex-1 capitalize font-medium">
                          {s.category}
                        </span>
                        <span className="font-mono text-[10px] font-bold text-[var(--text3)]">
                          {s.total}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-[var(--border)]">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs text-[var(--text3)] font-medium">
                        Total Questions
                      </span>
                      <span className="font-mono text-2xl font-bold text-[var(--accent)]">
                        {questions.length}
                      </span>
                    </div>
                    {client.companyName && (
                      <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--accent-pale)]">
                        <Globe2 size={12} className="text-[var(--accent)] flex-shrink-0" />
                        <span className="text-[11px] text-[var(--accent)]">
                          <strong>{client.companyName}</strong>
                          {client.industry && (
                            <span className="text-[var(--accent)]/70">
                              {" "}&middot; {client.industry}
                            </span>
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Ready state */}
              {canProceed && (
                <button
                  onClick={handleProceed}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl text-sm font-semibold bg-gradient-to-r from-[var(--accent)] to-[var(--accent2)] text-white hover:brightness-110 transition-all shadow-lg shadow-[var(--accent)]/20 hover:shadow-[var(--accent)]/35 hover:-translate-y-[1px]"
                >
                  <Sparkles size={16} />
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
      <footer className="bg-[var(--navy)] border-t border-white/[0.05] px-8 py-8">
        <div className="max-w-[960px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-md bg-[var(--accent)] flex items-center justify-center text-white text-[10px] font-bold">
              O
            </div>
            <span className="text-xs text-white/30 font-mono">
              Orion v2.0 &mdash; Anaplan Proposal Engine
            </span>
          </div>
          <div className="text-[10px] text-white/20 font-mono uppercase tracking-wider">
            Confidential &mdash; EyeOn B.V.
          </div>
        </div>
      </footer>
    </div>
  );
}
