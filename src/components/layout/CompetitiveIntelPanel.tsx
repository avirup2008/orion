"use client";

import { useState, useMemo } from "react";
import {
  Shield,
  ChevronDown,
  ChevronRight,
  Swords,
  Target,
  AlertTriangle,
} from "lucide-react";
import { detectCompetitors } from "@/lib/competitive-intel";
import type { CompetitorMention } from "@/lib/competitive-intel";
import type { RfpQuestion } from "@/types";

interface CompetitiveIntelPanelProps {
  questions: RfpQuestion[];
}

/** Groups mentions by competitor name, merging question references. */
interface GroupedCompetitor {
  name: string;
  product: string;
  questionNumbers: number[];
  counterPoints: string[];
  talkingPoints: string[];
}

function groupMentions(mentions: CompetitorMention[], questions: RfpQuestion[]): GroupedCompetitor[] {
  const map = new Map<string, GroupedCompetitor>();

  for (const m of mentions) {
    const question = questions.find((q) => q.id === m.questionId);
    const qNum = question?.number ?? 0;

    const existing = map.get(m.competitor);
    if (existing) {
      if (!existing.questionNumbers.includes(qNum)) {
        existing.questionNumbers.push(qNum);
      }
    } else {
      map.set(m.competitor, {
        name: m.competitor,
        product: m.product,
        questionNumbers: [qNum],
        counterPoints: m.counterPoints,
        talkingPoints: m.talkingPoints,
      });
    }
  }

  return Array.from(map.values());
}

export default function CompetitiveIntelPanel({ questions }: CompetitiveIntelPanelProps) {
  const mentions = useMemo(() => detectCompetitors(questions), [questions]);
  const grouped = useMemo(() => groupMentions(mentions, questions), [mentions, questions]);

  const totalQuestions = useMemo(() => {
    const ids = new Set(mentions.map((m) => m.questionId));
    return ids.size;
  }, [mentions]);

  // Track which sections are expanded: key = "counter-{name}" or "talking-{name}"
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = (key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  // ── Empty state ──
  if (grouped.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="w-10 h-10 rounded-full bg-[var(--surface3)] flex items-center justify-center mb-3">
          <Shield size={18} className="text-[var(--text4)]" />
        </div>
        <div className="text-[11px] text-[var(--text4)] leading-relaxed max-w-[200px]">
          No competitor mentions detected in your RFP questions
        </div>
      </div>
    );
  }

  // ── Populated state ──
  return (
    <div>
      {/* Summary header */}
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle size={12} className="text-[var(--gold)] shrink-0" />
        <span className="text-[11px] text-[var(--text2)]">
          <span className="font-semibold">{grouped.length}</span>
          {" "}competitor{grouped.length !== 1 ? "s" : ""} detected across{" "}
          <span className="font-semibold">{totalQuestions}</span>
          {" "}question{totalQuestions !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Competitor cards */}
      <div className="space-y-2">
        {grouped.map((comp) => {
          const counterKey = `counter-${comp.name}`;
          const talkingKey = `talking-${comp.name}`;
          const counterOpen = expanded.has(counterKey);
          const talkingOpen = expanded.has(talkingKey);

          return (
            <div
              key={comp.name}
              className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-[14px] shadow-[var(--sh-sm)]"
            >
              {/* Competitor name + product */}
              <div className="flex items-center gap-2 mb-2">
                <Swords size={12} className="text-[var(--neg)] shrink-0" />
                <span className="text-sm font-semibold text-[var(--text)]">
                  {comp.name}
                </span>
              </div>
              <div className="font-mono text-[9px] text-[var(--text4)] mb-2">
                {comp.product}
              </div>

              {/* Question badges */}
              <div className="flex flex-wrap gap-1 mb-3">
                {comp.questionNumbers.map((num) => (
                  <span
                    key={num}
                    className="font-mono text-[9px] font-medium px-[6px] py-[2px] rounded bg-[var(--gold-pale)] text-[var(--gold)] border border-[var(--gold-pale)]"
                  >
                    Q{num}
                  </span>
                ))}
              </div>

              {/* Counter-Positioning (expandable) */}
              <button
                onClick={() => toggle(counterKey)}
                className="flex items-center gap-1.5 w-full text-left py-1.5 group"
              >
                {counterOpen ? (
                  <ChevronDown size={12} className="text-[var(--text4)] group-hover:text-[var(--text2)] transition-colors" />
                ) : (
                  <ChevronRight size={12} className="text-[var(--text4)] group-hover:text-[var(--text2)] transition-colors" />
                )}
                <Target size={10} className="text-[var(--accent)] shrink-0" />
                <span className="font-mono text-[9px] font-semibold uppercase tracking-[1px] text-[var(--text3)] group-hover:text-[var(--text2)] transition-colors">
                  Counter-Positioning
                </span>
              </button>
              {counterOpen && (
                <ul className="pl-5 mt-1 mb-2 space-y-1.5">
                  {comp.counterPoints.map((point, i) => (
                    <li
                      key={i}
                      className="text-[11px] text-[var(--text3)] leading-[1.5] relative before:content-[''] before:absolute before:left-[-10px] before:top-[7px] before:w-[3px] before:h-[3px] before:rounded-full before:bg-[var(--accent)]"
                    >
                      {point}
                    </li>
                  ))}
                </ul>
              )}

              {/* Talking Points (expandable) */}
              <button
                onClick={() => toggle(talkingKey)}
                className="flex items-center gap-1.5 w-full text-left py-1.5 group"
              >
                {talkingOpen ? (
                  <ChevronDown size={12} className="text-[var(--text4)] group-hover:text-[var(--text2)] transition-colors" />
                ) : (
                  <ChevronRight size={12} className="text-[var(--text4)] group-hover:text-[var(--text2)] transition-colors" />
                )}
                <Shield size={10} className="text-[var(--pos)] shrink-0" />
                <span className="font-mono text-[9px] font-semibold uppercase tracking-[1px] text-[var(--text3)] group-hover:text-[var(--text2)] transition-colors">
                  Talking Points
                </span>
              </button>
              {talkingOpen && (
                <ul className="pl-5 mt-1 space-y-1.5">
                  {comp.talkingPoints.map((point, i) => (
                    <li
                      key={i}
                      className="text-[11px] text-[var(--text3)] leading-[1.5] relative before:content-[''] before:absolute before:left-[-10px] before:top-[7px] before:w-[3px] before:h-[3px] before:rounded-full before:bg-[var(--pos)]"
                    >
                      {point}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
