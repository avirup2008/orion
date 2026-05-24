"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { CATEGORY_CONFIG } from "@/types";
import type { RfpQuestion } from "@/types";
import { useAppState, useAppDispatch } from "@/lib/store";
import type { GenerateRequest } from "@/lib/agents";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  SlidersHorizontal,
  ArrowUpDown,
  BookOpen,
  Paperclip,
  Loader2,
  CheckCircle2,
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
  const state = useAppState();
  const dispatch = useAppDispatch();
  const [streamingText, setStreamingText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const streamEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll during streaming
  useEffect(() => {
    if (isGenerating && streamEndRef.current) {
      streamEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [streamingText, isGenerating]);

  // Reset streaming state when question changes
  useEffect(() => {
    setStreamingText("");
    setError(null);
    // Abort any in-flight generation
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
      setIsGenerating(false);
    }
  }, [question?.id]);

  const handleGenerate = useCallback(async () => {
    if (!question || isGenerating) return;

    setIsGenerating(true);
    setStreamingText("");
    setError(null);

    // Update question status to generating
    dispatch({
      type: "UPDATE_QUESTION",
      id: question.id,
      updates: { status: "generating", response: undefined },
    });

    const controller = new AbortController();
    abortRef.current = controller;

    const reqBody: GenerateRequest = {
      questionId: question.id,
      questionText: question.text,
      category: question.category,
      priority: question.priority,
      client: {
        companyName: state.client.companyName,
        industry: state.client.industry,
        size: state.client.size,
        painPoints: state.client.painPoints,
      },
      clarification: {
        detectedModules: state.clarification.detectedModules,
        answers: state.clarification.answers,
      },
    };

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reqBody),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let accumulated = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === "delta" && data.text) {
                accumulated += data.text;
                setStreamingText(accumulated);
              } else if (data.type === "error") {
                throw new Error(data.error);
              }
            } catch (e) {
              if (e instanceof Error && e.message !== "Unexpected end of JSON input") {
                // Only throw real errors, not JSON parse issues from partial data
                if (e.message !== line.slice(6)) throw e;
              }
            }
          }
        }
      }

      // Save final response to state
      const wordCount = accumulated.split(/\s+/).filter(Boolean).length;
      dispatch({
        type: "UPDATE_QUESTION",
        id: question.id,
        updates: {
          status: "draft",
          response: {
            content: accumulated,
            wordCount,
            generatedAt: new Date().toISOString(),
            kbSourcesUsed: ["claude-ai"],
          },
        },
      });

      setStreamingText("");
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        // User cancelled — reset to queued
        dispatch({
          type: "UPDATE_QUESTION",
          id: question.id,
          updates: { status: "queued" },
        });
      } else {
        const message = err instanceof Error ? err.message : "Generation failed";
        setError(message);
        dispatch({
          type: "UPDATE_QUESTION",
          id: question.id,
          updates: { status: "queued" },
        });
      }
    } finally {
      setIsGenerating(false);
      abortRef.current = null;
    }
  }, [question, isGenerating, state.client, state.clarification, dispatch]);

  const handleCancel = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
  }, []);

  const handleMarkFinal = useCallback(() => {
    if (!question) return;
    dispatch({
      type: "UPDATE_QUESTION",
      id: question.id,
      updates: { status: question.status === "final" ? "draft" : "final" },
    });
  }, [question, dispatch]);

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
  const displayText = isGenerating ? streamingText : response?.content || "";

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
          {isGenerating ? (
            <button
              onClick={handleCancel}
              className="text-xs font-semibold px-4 py-[7px] rounded-lg bg-[var(--neg)] text-white border border-[var(--neg)] transition-all hover:brightness-110"
            >
              Cancel
            </button>
          ) : (
            <button
              onClick={handleGenerate}
              className="text-xs font-semibold px-4 py-[7px] rounded-lg bg-[var(--accent)] text-white border border-[var(--accent)] transition-all hover:bg-[var(--accent2)]"
            >
              <Sparkles className="w-3.5 h-3.5 inline -mt-px mr-1" />
              {response ? "Regenerate" : "Generate"}
            </button>
          )}
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

        {/* Error display */}
        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-[var(--neg)]/10 border border-[var(--neg)]/20 text-sm text-[var(--neg)]">
            <strong>Generation failed:</strong> {error}
          </div>
        )}

        {/* Streaming / Response display */}
        {(displayText || isGenerating) ? (
          <div className="mb-7">
            <div className="flex justify-between items-center mb-3">
              <span className="font-mono text-[9px] font-semibold uppercase tracking-[1.5px] text-[var(--text3)]">
                {isGenerating ? "Generating Response" : "Generated Response"}
              </span>
              {isGenerating ? (
                <span className="font-mono text-[9px] px-[10px] py-[3px] rounded-full bg-[var(--accent)]/10 text-[var(--accent)] font-semibold flex items-center gap-1.5">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Writing...
                </span>
              ) : response ? (
                <span className="font-mono text-[9px] px-[10px] py-[3px] rounded-full bg-[var(--pos-pale)] text-[var(--pos)] font-semibold">
                  {question.status === "final" ? "Final" : "Draft"} &mdash;{" "}
                  {response.wordCount} words
                </span>
              ) : null}
            </div>
            <div className="bg-[var(--surface)] border border-[var(--border2)] rounded-[var(--r-lg)] px-7 py-6 shadow-[var(--sh-sm)] text-sm leading-[1.8] text-[var(--text2)] min-h-[200px]">
              {displayText.split("\n\n").map((para, i) => (
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
              {isGenerating && (
                <span className="inline-block w-[2px] h-[14px] bg-[var(--accent)] animate-pulse ml-0.5 align-middle" />
              )}
              <div ref={streamEndRef} />
            </div>

            {/* Toolbar — only show when not generating */}
            {!isGenerating && response && (
              <div className="flex gap-2 mt-3 pt-[10px] border-t border-[var(--border)] flex-wrap">
                <button
                  onClick={handleMarkFinal}
                  className={`font-mono text-[10px] px-3 py-[5px] rounded-md border transition-all ${
                    question.status === "final"
                      ? "bg-[var(--pos)]/10 text-[var(--pos)] border-[var(--pos)]/20 hover:bg-[var(--pos)]/20"
                      : "text-[var(--text4)] border-transparent hover:bg-[var(--accent-pale)] hover:text-[var(--accent)] hover:border-[var(--accent-bd)]"
                  }`}
                >
                  <CheckCircle2 className="w-3 h-3 inline -mt-px mr-1" />
                  {question.status === "final" ? "Marked Final" : "Mark Final"}
                </button>
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
            )}
          </div>
        ) : (
          <div className="bg-[var(--surface)] border border-[var(--border2)] border-dashed rounded-[var(--r-lg)] px-7 py-16 text-center">
            <div className="text-[var(--text4)] text-sm mb-3">
              No response generated yet
            </div>
            <button
              onClick={handleGenerate}
              className="text-xs font-semibold px-5 py-2 rounded-lg bg-[var(--accent)] text-white transition-all hover:bg-[var(--accent2)]"
            >
              <Sparkles className="w-3.5 h-3.5 inline -mt-px mr-1" />
              Generate Response
            </button>
          </div>
        )}

        {/* Quality score (if available) */}
        {response?.qualityScore && !isGenerating && (
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
