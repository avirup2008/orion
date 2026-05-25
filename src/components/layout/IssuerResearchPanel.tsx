"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Sparkles,
  Building2,
  DollarSign,
  Target,
  AlertTriangle,
  Shield,
  TrendingUp,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Loader2,
} from "lucide-react";
import type { IssuerIntelligence } from "@/lib/issuer-intel";
import { saveIssuerIntel, getIssuerIntel } from "@/lib/issuer-intel";
import type { RfpQuestion } from "@/types";

interface IssuerResearchPanelProps {
  clientName: string;
  industry: string;
  questions: RfpQuestion[];
}

export default function IssuerResearchPanel({
  clientName,
  industry,
  questions,
}: IssuerResearchPanelProps) {
  const [intel, setIntel] = useState<IssuerIntelligence | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [issuerWebsite, setIssuerWebsite] = useState("");
  const [issuerNotes, setIssuerNotes] = useState("");
  const [previousRfps, setPreviousRfps] = useState("");

  // Collapsible section state
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["profile"]));

  // ── Load cached intel on mount / clientName change ──
  useEffect(() => {
    const cached = getIssuerIntel(clientName);
    if (cached) setIntel(cached);
  }, [clientName]);

  const toggle = useCallback((key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  // ── Run research ──
  const handleResearch = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          issuerName: clientName,
          issuerWebsite,
          issuerNotes,
          rfpQuestions: questions.map((q) => q.text),
          industry,
        }),
      });

      if (!res.ok) {
        const err = await res
          .json()
          .catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      const data: IssuerIntelligence = await res.json();
      saveIssuerIntel(clientName, data);
      setIntel(data);
      setExpanded(new Set(["profile"]));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Research failed");
    } finally {
      setIsLoading(false);
    }
  }, [clientName, issuerWebsite, issuerNotes, questions, industry]);

  // ── Section helper ──
  function Section({
    id,
    icon,
    label,
    borderColor,
    children,
  }: {
    id: string;
    icon: React.ReactNode;
    label: string;
    borderColor: string;
    children: React.ReactNode;
  }) {
    const isOpen = expanded.has(id);
    return (
      <div
        className="bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-[var(--sh-sm)] overflow-hidden"
        style={{ borderLeftWidth: 3, borderLeftColor: borderColor }}
      >
        <button
          onClick={() => toggle(id)}
          className="flex items-center gap-2 w-full text-left px-3 py-2.5 group"
        >
          {isOpen ? (
            <ChevronDown
              size={12}
              className="text-[var(--text4)] group-hover:text-[var(--text2)] transition-colors shrink-0"
            />
          ) : (
            <ChevronRight
              size={12}
              className="text-[var(--text4)] group-hover:text-[var(--text2)] transition-colors shrink-0"
            />
          )}
          {icon}
          <span className="font-mono text-[9px] font-semibold uppercase tracking-[1px] text-[var(--text3)] group-hover:text-[var(--text2)] transition-colors">
            {label}
          </span>
        </button>
        {isOpen && <div className="px-3 pb-3">{children}</div>}
      </div>
    );
  }

  // ══════════════════════════════════════════════════
  // State 2: Intelligence display
  // ══════════════════════════════════════════════════
  if (intel) {
    return (
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <Building2 size={13} className="text-[var(--accent)] shrink-0" />
            <span className="text-xs font-semibold text-[var(--text)] truncate">
              Intelligence: {clientName}
            </span>
          </div>
          <button
            onClick={handleResearch}
            disabled={isLoading}
            className="flex items-center gap-1 font-mono text-[9px] px-2 py-1 rounded-md border border-[var(--border)] text-[var(--text4)] hover:bg-[var(--surface3)] hover:text-[var(--text2)] transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 size={10} className="animate-spin" />
            ) : (
              <RefreshCw size={10} />
            )}
            Re-run
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-[11px] text-[var(--neg)] mb-3">
            <AlertTriangle size={12} />
            {error}
          </div>
        )}

        {/* Intel sections */}
        <div className="space-y-2">
          {/* Profile */}
          <Section
            id="profile"
            icon={
              <Building2
                size={10}
                className="text-[var(--accent)] shrink-0"
              />
            }
            label="Profile"
            borderColor="var(--accent)"
          >
            <p className="text-[11px] text-[var(--text3)] leading-[1.6]">
              {intel.organizationProfile}
            </p>
          </Section>

          {/* Budget Range */}
          <Section
            id="budget"
            icon={
              <DollarSign
                size={10}
                className="text-[var(--pos)] shrink-0"
              />
            }
            label="Budget Range"
            borderColor="var(--pos)"
          >
            <div className="bg-[var(--accent-pale)] border border-[var(--accent-bd)] rounded-md px-3 py-2">
              <span className="text-xs font-semibold text-[var(--accent)]">
                {intel.likelyBudgetRange}
              </span>
            </div>
          </Section>

          {/* Decision Factors */}
          {intel.decisionFactors.length > 0 && (
            <Section
              id="decisions"
              icon={
                <Target
                  size={10}
                  className="text-[var(--accent)] shrink-0"
                />
              }
              label="Decision Factors"
              borderColor="var(--accent)"
            >
              <ul className="space-y-1.5">
                {intel.decisionFactors.map((factor, i) => (
                  <li
                    key={i}
                    className="text-[11px] text-[var(--text3)] leading-[1.5] pl-3 relative before:content-[''] before:absolute before:left-0 before:top-[7px] before:w-[4px] before:h-[4px] before:rounded-full before:bg-[var(--accent)]"
                  >
                    {factor}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* Competitor Risks */}
          {intel.competitorRisks.length > 0 && (
            <Section
              id="competitors"
              icon={
                <AlertTriangle
                  size={10}
                  className="text-[var(--warn)] shrink-0"
                />
              }
              label="Competitor Risks"
              borderColor="var(--warn)"
            >
              <ul className="space-y-1.5">
                {intel.competitorRisks.map((risk, i) => (
                  <li
                    key={i}
                    className="text-[11px] text-[var(--text3)] leading-[1.5] bg-[color-mix(in_srgb,var(--warn)_8%,transparent)] border border-[color-mix(in_srgb,var(--warn)_20%,transparent)] rounded-md px-2.5 py-1.5"
                  >
                    {risk}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* Win Strategy */}
          {intel.winStrategy.length > 0 && (
            <Section
              id="strategy"
              icon={
                <Shield
                  size={10}
                  className="text-[var(--pos)] shrink-0"
                />
              }
              label="Win Strategy"
              borderColor="var(--pos)"
            >
              <ul className="space-y-1.5">
                {intel.winStrategy.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-[11px] text-[var(--text3)] leading-[1.5]"
                  >
                    <span className="mt-[3px] w-[14px] h-[14px] rounded border border-[var(--pos)] bg-[color-mix(in_srgb,var(--pos)_10%,transparent)] flex items-center justify-center shrink-0">
                      <span className="text-[8px] text-[var(--pos)]">
                        &#10003;
                      </span>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* Red Flags */}
          {intel.redFlags.length > 0 && (
            <Section
              id="redflags"
              icon={
                <AlertTriangle
                  size={10}
                  className="text-[var(--neg)] shrink-0"
                />
              }
              label="Red Flags"
              borderColor="var(--neg)"
            >
              <ul className="space-y-1.5">
                {intel.redFlags.map((flag, i) => (
                  <li
                    key={i}
                    className="text-[11px] text-[var(--text3)] leading-[1.5] bg-[color-mix(in_srgb,var(--neg)_8%,transparent)] border border-[color-mix(in_srgb,var(--neg)_20%,transparent)] rounded-md px-2.5 py-1.5"
                  >
                    {flag}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* Tone */}
          <Section
            id="tone"
            icon={
              <Search
                size={10}
                className="text-[var(--text3)] shrink-0"
              />
            }
            label="Tone"
            borderColor="var(--border)"
          >
            <div className="text-[11px] text-[var(--text3)] leading-[1.6] bg-[var(--surface2)] rounded-md px-3 py-2 italic">
              {intel.toneRecommendation}
            </div>
          </Section>

          {/* Strengths to Emphasize */}
          {intel.strengthsToEmphasize.length > 0 && (
            <Section
              id="strengths"
              icon={
                <TrendingUp
                  size={10}
                  className="text-[var(--pos)] shrink-0"
                />
              }
              label="Strengths to Emphasize"
              borderColor="var(--pos)"
            >
              <ul className="space-y-1.5">
                {intel.strengthsToEmphasize.map((strength, i) => (
                  <li
                    key={i}
                    className="text-[11px] text-[var(--text3)] leading-[1.5] pl-3 relative before:content-[''] before:absolute before:left-0 before:top-[7px] before:w-[4px] before:h-[4px] before:rounded-full before:bg-[var(--pos)]"
                  >
                    {strength}
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════
  // State 1: Input form
  // ══════════════════════════════════════════════════
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Search size={13} className="text-[var(--accent)] shrink-0" />
        <span className="text-xs font-semibold text-[var(--text)]">
          Issuer Research
        </span>
      </div>

      <div className="space-y-3">
        {/* Issuer Website */}
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-wider text-[var(--text4)] mb-1">
            Issuer Website
          </label>
          <input
            type="text"
            value={issuerWebsite}
            onChange={(e) => setIssuerWebsite(e.target.value)}
            placeholder="e.g. acme-corp.com"
            className="bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs w-full text-[var(--text)] placeholder:text-[var(--text4)] focus:outline-none focus:border-[var(--accent-bd)] transition-colors"
          />
        </div>

        {/* Additional Notes */}
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-wider text-[var(--text4)] mb-1">
            Additional Notes
          </label>
          <textarea
            value={issuerNotes}
            onChange={(e) => setIssuerNotes(e.target.value)}
            placeholder="Any intel about this organization..."
            rows={3}
            className="bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs w-full text-[var(--text)] placeholder:text-[var(--text4)] focus:outline-none focus:border-[var(--accent-bd)] transition-colors resize-none"
          />
        </div>

        {/* Previous RFP History */}
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-wider text-[var(--text4)] mb-1">
            Previous RFP History
          </label>
          <textarea
            value={previousRfps}
            onChange={(e) => setPreviousRfps(e.target.value)}
            placeholder="Known past RFPs from this issuer..."
            rows={3}
            className="bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs w-full text-[var(--text)] placeholder:text-[var(--text4)] focus:outline-none focus:border-[var(--accent-bd)] transition-colors resize-none"
          />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-[11px] text-[var(--neg)] mt-3">
          <AlertTriangle size={12} />
          {error}
        </div>
      )}

      {/* Run Research button */}
      <button
        onClick={handleResearch}
        disabled={isLoading}
        className="mt-4 w-full flex items-center justify-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-lg bg-[var(--accent)] text-white transition-all hover:bg-[var(--accent2)] disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <Sparkles size={14} />
            Run Research
          </>
        )}
      </button>
    </div>
  );
}
