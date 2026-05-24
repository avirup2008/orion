"use client";

import { useState, useMemo } from "react";
import { useAppState, useAppDispatch } from "@/lib/store";
import {
  getClarificationSections,
  detectModulesFromQuestions,
  type ClarificationSection,
} from "@/data/clarification-questions";

export default function ClarificationPanel() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);

  // Detect relevant modules from questions
  const detectedModules = useMemo(
    () =>
      state.clarification.detectedModules.length > 0
        ? state.clarification.detectedModules
        : detectModulesFromQuestions(state.questions),
    [state.clarification.detectedModules, state.questions]
  );

  // Get all clarification sections
  const sections = useMemo(
    () => getClarificationSections(detectedModules),
    [detectedModules]
  );

  const activeSection = sections[activeSectionIndex];

  // Calculate progress
  const totalQuestions = sections.reduce(
    (sum, s) => sum + s.questions.length,
    0
  );
  const answeredQuestions = sections.reduce(
    (sum, s) =>
      sum +
      s.questions.filter((q) => state.clarification.answers[q.id]?.trim())
        .length,
    0
  );
  const progress = totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;

  const sectionProgress = (section: ClarificationSection) => {
    const answered = section.questions.filter(
      (q) => state.clarification.answers[q.id]?.trim()
    ).length;
    return { answered, total: section.questions.length };
  };

  const handleAnswer = (questionId: string, answer: string) => {
    dispatch({ type: "SET_CLARIFICATION_ANSWER", questionId, answer });
  };

  const handleComplete = () => {
    dispatch({ type: "SET_DETECTED_MODULES", modules: detectedModules });
    dispatch({ type: "COMPLETE_CLARIFICATION" });
  };

  const handleSkip = () => {
    dispatch({ type: "COMPLETE_CLARIFICATION" });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-2xl w-[860px] max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-8 py-5 border-b border-[var(--border)] bg-[var(--navy)]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Engagement Clarification
              </h2>
              <p className="text-sm text-white/60 mt-0.5">
                Help us tailor the proposal — answer what you can, skip what you
                don&apos;t know
              </p>
            </div>
            <button
              onClick={handleSkip}
              className="text-white/50 hover:text-white/80 text-sm font-medium transition-colors"
            >
              Skip for now →
            </button>
          </div>
          {/* Progress bar */}
          <div className="mt-3 flex items-center gap-3">
            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--accent)] rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs font-mono text-white/50">
              {answeredQuestions}/{totalQuestions}
            </span>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Section sidebar */}
          <div className="w-[200px] min-w-[200px] bg-[var(--surface2)] border-r border-[var(--border)] overflow-y-auto py-2">
            {sections.map((section, idx) => {
              const prog = sectionProgress(section);
              const isActive = idx === activeSectionIndex;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSectionIndex(idx)}
                  className={`w-full text-left px-4 py-3 transition-all ${
                    isActive
                      ? "bg-[var(--accent-pale)] border-l-2 border-[var(--accent)]"
                      : "hover:bg-[var(--surface3)] border-l-2 border-transparent"
                  }`}
                >
                  <div
                    className={`text-xs font-semibold ${
                      isActive ? "text-[var(--accent)]" : "text-[var(--text)]"
                    }`}
                  >
                    {section.title}
                  </div>
                  <div className="text-[10px] text-[var(--text4)] mt-0.5">
                    {prog.answered}/{prog.total} answered
                  </div>
                </button>
              );
            })}
          </div>

          {/* Questions panel */}
          <div className="flex-1 overflow-y-auto px-8 py-6">
            {activeSection && (
              <>
                <div className="mb-5">
                  <h3 className="text-sm font-semibold text-[var(--text)]">
                    {activeSection.title}
                  </h3>
                  <p className="text-xs text-[var(--text3)] mt-1">
                    {activeSection.description}
                  </p>
                </div>

                <div className="space-y-5">
                  {activeSection.questions.map((q) => (
                    <div key={q.id}>
                      <label className="block text-xs font-medium text-[var(--text)] mb-1.5">
                        {q.question}
                      </label>
                      {q.helpText && (
                        <div className="text-[10px] text-[var(--text4)] mb-1.5">
                          {q.helpText}
                        </div>
                      )}
                      {q.type === "select" && q.options ? (
                        <select
                          value={state.clarification.answers[q.id] || ""}
                          onChange={(e) => handleAnswer(q.id, e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 focus:border-[var(--accent)]"
                        >
                          <option value="">Select...</option>
                          {q.options.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : q.type === "number" ? (
                        <input
                          type="number"
                          value={state.clarification.answers[q.id] || ""}
                          onChange={(e) => handleAnswer(q.id, e.target.value)}
                          placeholder={q.placeholder}
                          className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--text4)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 focus:border-[var(--accent)]"
                        />
                      ) : (
                        <input
                          type="text"
                          value={state.clarification.answers[q.id] || ""}
                          onChange={(e) => handleAnswer(q.id, e.target.value)}
                          placeholder={q.placeholder}
                          className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--text4)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 focus:border-[var(--accent)]"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-[var(--border)] bg-[var(--surface2)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            {detectedModules.length > 0 && (
              <div className="text-[10px] text-[var(--text4)] font-mono">
                Detected modules:{" "}
                {detectedModules
                  .map((m) => {
                    const names: Record<string, string> = {
                      fpa: "FP&A",
                      supplyChain: "Supply Chain",
                      salesPerformance: "Sales Performance",
                      workforce: "Workforce",
                      territoryQuota: "Territory & Quota",
                      custom: "Custom",
                    };
                    return names[m] || m;
                  })
                  .join(", ")}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            {activeSectionIndex < sections.length - 1 ? (
              <button
                onClick={() => setActiveSectionIndex(activeSectionIndex + 1)}
                className="px-5 py-2 text-sm font-medium text-white bg-[var(--accent)] rounded-lg hover:bg-[var(--accent-dark)] transition-colors"
              >
                Next Section →
              </button>
            ) : (
              <button
                onClick={handleComplete}
                className="px-5 py-2 text-sm font-medium text-white bg-[var(--accent)] rounded-lg hover:bg-[var(--accent-dark)] transition-colors"
              >
                ✓ Done — Generate Proposals
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
