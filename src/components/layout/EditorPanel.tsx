"use client";

import { CATEGORY_CONFIG } from "@/types";
import type { RfpQuestion } from "@/types";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  SlidersHorizontal,
  ArrowUpDown,
  BookOpen,
  Paperclip,
} from "lucide-react";

interface EditorPanelProps {
  question: RfpQuestion | null;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}

export default function EditorPanel({
  question,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}: EditorPanelProps) {
  if (!question) {
    return (
      <main className="flex-1 flex items-center justify-center bg-[var(--bg)]">
        <div className="text-center">
          <div className="text-[var(--text4)] text-sm">
            Select a question from the outline to begin editing
          </div>
        </div>
      </main>
    );
  }

  const cat = CATEGORY_CONFIG[question.category];
  const response = question.response;

  return (
    <main className="flex-1 overflow-y-auto bg-[var(--bg)] flex flex-col">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-[var(--bg)]/95 backdrop-blur-[12px] border-b border-[var(--border)] px-9 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2 text-xs text-[var(--text3)]">
          <span>{cat.label}</span>
          <span className="text-[var(--text4)]">&rsaquo;</span>
          <span className="text-[var(--text)] font-semibold">
            Q{question.number}. {question.text.slice(0, 40)}
            {question.text.length > 40 ? "..." : ""}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onPrev}
            disabled={!hasPrev}
            className="text-xs font-medium px-4 py-[7px] rounded-lg border border-[var(--border2)] bg-[var(--surface)] text-[var(--text2)] transition-all hover:border-[var(--text4)] hover:-translate-y-px hover:shadow-[var(--sh-sm)] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            <ChevronLeft className="w-3.5 h-3.5 inline -mt-px" /> Prev
          </button>
          <button
            onClick={onNext}
            disabled={!hasNext}
            className="text-xs font-medium px-4 py-[7px] rounded-lg border border-[var(--border2)] bg-[var(--surface)] text-[var(--text2)] transition-all hover:border-[var(--text4)] hover:-translate-y-px hover:shadow-[var(--sh-sm)] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            Next <ChevronRight className="w-3.5 h-3.5 inline -mt-px" />
          </button>
          <button className="text-xs font-semibold px-4 py-[7px] rounded-lg bg-[var(--accent)] text-white border border-[var(--accent)] transition-all hover:bg-[var(--accent2)]">
            <Sparkles className="w-3.5 h-3.5 inline -mt-px mr-1" />
            Regenerate
          </button>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 px-9 py-9 max-w-[780px] mx-auto w-full">
        {/* Question box */}
        <div
          className="bg-[var(--surface)] border border-[var(--border2)] rounded-[var(--r)] p-5 pl-6 mb-7 shadow-[var(--sh-sm)]"
          style={{ borderLeftWidth: 4, borderLeftColor: cat.color }}
        >
          <div className="font-mono text-[9px] font-semibold uppercase tracking-[1.5px] text-[var(--text3)] mb-2 flex items-center gap-2">
            RFP Question
            <span
              className={`px-2 py-[2px] rounded-full text-[9px] ${cat.bgClass}`}
            >
              {cat.label}
            </span>
          </div>
          <div className="text-[15px] text-[var(--text)] leading-relaxed font-medium">
            {question.text}
          </div>
          <div className="flex gap-4 mt-3 font-mono text-[10px] text-[var(--text4)]">
            <span>Priority: {question.priority === "high" ? "High" : question.priority === "medium" ? "Medium" : "Low"}</span>
            {question.weight && <span>Weight: {question.weight}%</span>}
            {question.maxWords && <span>Max words: {question.maxWords}</span>}
          </div>
        </div>

        {/* Response */}
        {response ? (
          <div className="mb-7">
            <div className="flex justify-between items-center mb-3">
              <span className="font-mono text-[9px] font-semibold uppercase tracking-[1.5px] text-[var(--text3)]">
                Generated Response
              </span>
              <span className="font-mono text-[9px] px-[10px] py-[3px] rounded-full bg-[var(--pos-pale)] text-[var(--pos)] font-semibold">
                {question.status === "final" ? "✓ Final" : question.status === "review" ? "○ In Review" : "✓ AI Generated"} &mdash;{" "}
                {response.wordCount} words
              </span>
            </div>
            <div className="bg-[var(--surface)] border border-[var(--border2)] rounded-[var(--r-lg)] px-7 py-6 shadow-[var(--sh-sm)] text-sm leading-[1.8] text-[var(--text2)] min-h-[200px]">
              {response.content.split("\n\n").map((para, i) => (
                <p key={i} className="mb-[14px] last:mb-0">
                  {para.split(/(\*\*[^*]+\*\*)/).map((part, j) => {
                    if (part.startsWith("**") && part.endsWith("**")) {
                      return (
                        <strong key={j} className="text-[var(--text)] font-semibold">
                          {part.slice(2, -2)}
                        </strong>
                      );
                    }
                    return part;
                  })}
                </p>
              ))}
            </div>

            {/* Toolbar */}
            <div className="flex gap-2 mt-3 pt-[10px] border-t border-[var(--border)]">
              {[
                { icon: SlidersHorizontal, label: "Refine tone" },
                { icon: ArrowUpDown, label: "Expand" },
                { icon: ArrowUpDown, label: "Condense" },
                { icon: BookOpen, label: "Add from KB" },
                { icon: Paperclip, label: "Add reference" },
              ].map((tool) => (
                <button
                  key={tool.label}
                  className="font-mono text-[10px] text-[var(--text4)] px-3 py-[5px] rounded-md border border-transparent transition-all hover:bg-[var(--accent-pale)] hover:text-[var(--accent)] hover:border-[var(--accent-bd)]"
                >
                  <tool.icon className="w-3 h-3 inline -mt-px mr-1" />
                  {tool.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-[var(--surface)] border border-[var(--border2)] border-dashed rounded-[var(--r-lg)] px-7 py-16 text-center">
            <div className="text-[var(--text4)] text-sm mb-3">
              No response generated yet
            </div>
            <button className="text-xs font-semibold px-5 py-2 rounded-lg bg-[var(--accent)] text-white transition-all hover:bg-[var(--accent2)]">
              <Sparkles className="w-3.5 h-3.5 inline -mt-px mr-1" />
              Generate Response
            </button>
          </div>
        )}

        {/* Quality score (if available) */}
        {response?.qualityScore && (
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--r)] p-4 mt-4">
            <div className="font-mono text-[9px] font-semibold uppercase tracking-[1.5px] text-[var(--text3)] mb-2">
              Quality Score
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`text-2xl font-bold ${
                  response.qualityScore >= 8
                    ? "text-[var(--pos)]"
                    : response.qualityScore >= 6
                    ? "text-[var(--gold)]"
                    : "text-[var(--neg)]"
                }`}
              >
                {response.qualityScore.toFixed(1)}
              </span>
              <div className="flex-1 h-[6px] bg-[var(--surface3)] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${response.qualityScore * 10}%`,
                    background:
                      response.qualityScore >= 8
                        ? "var(--pos)"
                        : response.qualityScore >= 6
                        ? "var(--gold)"
                        : "var(--neg)",
                  }}
                />
              </div>
              <span className="font-mono text-[10px] text-[var(--text4)]">
                / 10
              </span>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
