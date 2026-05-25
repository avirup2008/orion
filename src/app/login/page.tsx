"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  MessageSquare,
  DollarSign,
  FileText,
} from "lucide-react";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setLoading(true);

      try {
        const res = await fetch("/api/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        });

        const data = await res.json();

        if (data.ok) {
          router.push("/");
          router.refresh();
        } else {
          setError(data.error || "Authentication failed");
        }
      } catch {
        setError("Connection error");
      } finally {
        setLoading(false);
      }
    },
    [password, router]
  );

  return (
    <div className="min-h-screen bg-[var(--bg)] overflow-y-auto">
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
      </nav>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* HERO + PASSWORD                                           */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="pt-16 pb-20 px-8">
        <div className="max-w-[820px] mx-auto text-center">
          <h1 className="text-[64px] leading-[1.06] font-bold text-[var(--navy)] tracking-[-2px] mb-6">
            Your Anaplan proposal,{" "}
            <span className="italic text-[var(--accent)]">
              fully crafted.
            </span>
          </h1>

          <p className="text-lg text-[var(--text3)] max-w-[560px] mx-auto leading-[1.7] mb-12">
            Orion transforms RFP questions into compelling, differentiated
            Anaplan proposals with full project costing and AI-powered
            response generation.
          </p>

          {/* Password form — centered, clean */}
          <form
            onSubmit={handleSubmit}
            className="max-w-[380px] mx-auto"
          >
            <div className="flex gap-2">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter access password"
                autoFocus
                className="flex-1 px-4 py-3.5 rounded-lg bg-[var(--surface)] border border-[var(--border2)] text-[var(--text)] text-sm placeholder:text-[var(--text4)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/20 transition-all"
              />
              <button
                type="submit"
                disabled={loading || !password}
                className="group flex items-center gap-2 px-6 py-3.5 rounded-lg text-sm font-semibold bg-[var(--accent)] text-white hover:bg-[var(--accent2)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                {loading ? "..." : "Enter"}
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
            {error && (
              <div className="mt-3 text-xs text-[var(--neg)] font-medium">
                {error}
              </div>
            )}
          </form>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* PRODUCT PREVIEW — Embedded app mockup                     */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="px-8 pb-24">
        <div className="max-w-[960px] mx-auto">
          <div className="bg-white rounded-2xl border border-[var(--border2)] shadow-[var(--sh-lg)] overflow-hidden">
            {/* Mock app header bar */}
            <div className="flex items-center gap-3 px-5 py-3 border-b border-[var(--border)] bg-[var(--surface)]">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-md bg-[var(--accent)] flex items-center justify-center">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 2 7 12 12 22 7 12 2" />
                    <polyline points="2 17 12 22 22 17" />
                    <polyline points="2 12 12 17 22 12" />
                  </svg>
                </div>
                <span className="text-xs font-semibold text-[var(--text)]">Orion.</span>
                <span className="text-[10px] text-[var(--text4)]">|</span>
                <span className="text-[11px] text-[var(--text3)]">Acme Corp &mdash; FP&amp;A Implementation</span>
              </div>
              <div className="ml-auto text-[10px] font-mono text-[var(--text4)]">
                Last generated 2h ago
              </div>
            </div>

            {/* Mock app tabs */}
            <div className="flex items-center gap-0 px-5 border-b border-[var(--border)] bg-[var(--surface)]">
              {["Proposal Studio", "Costing", "Differentiators", "Export"].map((tab, i) => (
                <div
                  key={tab}
                  className={`px-4 py-2.5 text-[11px] font-medium ${
                    i === 0
                      ? "text-[var(--accent)] border-b-2 border-[var(--accent)]"
                      : "text-[var(--text4)]"
                  }`}
                >
                  {tab}
                </div>
              ))}
            </div>

            {/* Mock three-panel content */}
            <div className="grid grid-cols-[200px_1fr_240px] h-[340px]">
              {/* Outline sidebar */}
              <div className="bg-[var(--navy)] p-4 space-y-1.5 overflow-hidden">
                <div className="text-[9px] font-mono text-white/30 uppercase tracking-wider mb-3">
                  Sections
                </div>
                {[
                  { cat: "Technical", color: "#7B6FAB", count: 4 },
                  { cat: "Functional", color: "#5D7FA3", count: 3 },
                  { cat: "Methodology", color: "#7A9461", count: 3 },
                  { cat: "Team", color: "#A68458", count: 2 },
                  { cat: "Pricing", color: "#B26B58", count: 2 },
                  { cat: "References", color: "#B09558", count: 2 },
                ].map((s) => (
                  <div key={s.cat} className="flex items-center gap-2 px-2.5 py-[7px] rounded-md bg-white/[0.04]">
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                    <span className="text-[10px] text-white/60 flex-1">{s.cat}</span>
                    <span className="text-[9px] font-mono text-white/25">{s.count}</span>
                  </div>
                ))}
                <div className="pt-3 mt-3 border-t border-white/[0.06]">
                  <div className="flex justify-between px-2.5">
                    <span className="text-[9px] text-white/25 font-mono">Total</span>
                    <span className="text-[11px] font-bold text-white/50">16</span>
                  </div>
                </div>
              </div>

              {/* Editor panel */}
              <div className="p-5 border-x border-[var(--border)] overflow-hidden">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-[#7B6FAB]" />
                  <span className="text-[9px] font-mono text-[var(--text4)] uppercase tracking-wider">Technical</span>
                </div>
                <div className="text-sm font-semibold text-[var(--text)] mb-3">
                  Q1. How does your platform handle data security?
                </div>
                <div className="space-y-2 text-[11px] leading-[1.7] text-[var(--text3)]">
                  <p>
                    Anaplan employs a multi-layered security architecture that meets enterprise
                    requirements across data protection, access control, and compliance certification...
                  </p>
                  <p>
                    The platform achieves SOC 2 Type II, ISO 27001, and GDPR compliance with
                    AES-256 encryption at rest and TLS 1.3 in transit...
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-[9px] font-mono text-[var(--text4)]">247 words</span>
                  <span className="text-[9px] text-[var(--text4)]">&middot;</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--pos-pale)] text-[9px] font-semibold text-[var(--pos)]">
                    92/100
                  </span>
                </div>
              </div>

              {/* Context panel */}
              <div className="p-4 bg-[var(--surface2)] overflow-hidden">
                <div className="text-[9px] font-mono text-[var(--text4)] uppercase tracking-wider mb-3">
                  KB Matches
                </div>
                {[
                  { title: "Security & Compliance", score: "0.94" },
                  { title: "Data Encryption", score: "0.87" },
                  { title: "Access Control", score: "0.82" },
                ].map((kb) => (
                  <div key={kb.title} className="mb-2 p-2.5 rounded-lg bg-white border border-[var(--border)]">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-medium text-[var(--text2)]">{kb.title}</span>
                      <span className="text-[9px] font-mono text-[var(--accent)]">{kb.score}</span>
                    </div>
                  </div>
                ))}
                <div className="mt-4 text-[9px] font-mono text-[var(--text4)] uppercase tracking-wider mb-2">
                  AI Analysis
                </div>
                <div className="p-2.5 rounded-lg bg-[var(--accent-pale)] border border-[var(--accent-bd)]">
                  <p className="text-[10px] text-[var(--accent)] leading-[1.5]">
                    Response covers all key security dimensions. Consider adding specific
                    EyeOn implementation guardrails...
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* FEATURES                                                  */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="px-8 pb-24">
        <div className="max-w-[820px] mx-auto">
          <div className="grid grid-cols-3 gap-12">
            {[
              {
                icon: MessageSquare,
                title: "Respond",
                desc: "Multi-agent AI generates unique, client-tailored responses per question with tone and length controls",
              },
              {
                icon: DollarSign,
                title: "Cost",
                desc: "Rate cards, effort matrices, Anaplan licensing, and margin analysis in a complete commercial model",
              },
              {
                icon: FileText,
                title: "Export",
                desc: "Download formatted DOCX proposals, XLSX pricing workbooks, and PDF reports ready to submit",
              },
            ].map((feat) => (
              <div key={feat.title}>
                <feat.icon size={20} className="text-[var(--accent)] mb-3" />
                <h3 className="text-sm font-bold text-[var(--text)] mb-2">
                  {feat.title}
                </h3>
                <p className="text-[13px] text-[var(--text3)] leading-[1.65]">
                  {feat.desc}
                </p>
              </div>
            ))}
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
