"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { CATEGORY_CONFIG } from "@/types";
import type { RfpQuestion } from "@/types";
import { useAppState, useAppDispatch } from "@/lib/store";
import type { GenerateRequest } from "@/lib/agents";
import type { RefineRequest } from "@/app/api/refine/route";
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
  FileDown,
  Pencil,
  X,
  MessageSquare,
  Send,
} from "lucide-react";
import { exportProposalDocx } from "@/lib/export/generate-docx";
import { detectCompetitors, getCompetitiveContext } from "@/lib/competitive-intel";
import { getIssuerIntel, buildIssuerPromptContext } from "@/lib/issuer-intel";
import { saveSnippet, createSnippetId } from "@/lib/response-library";

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
  const [isRefining, setIsRefining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState("");
  const [showCustomPrompt, setShowCustomPrompt] = useState(false);
  const [customInstruction, setCustomInstruction] = useState("");
  const [savedToLibrary, setSavedToLibrary] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const streamEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll during streaming
  useEffect(() => {
    if ((isGenerating || isRefining) && streamEndRef.current) {
      streamEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [streamingText, isGenerating, isRefining]);

  // Reset state when question changes
  useEffect(() => {
    setStreamingText("");
    setError(null);
    setIsEditing(false);
    setEditText("");
    setShowCustomPrompt(false);
    setCustomInstruction("");
    setSavedToLibrary(false);
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
      setIsGenerating(false);
      setIsRefining(false);
    }
  }, [question?.id]);

  // Focus textarea when editing starts
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(
        textareaRef.current.value.length,
        textareaRef.current.value.length
      );
    }
  }, [isEditing]);

  // ── SSE stream reader (shared by generate & refine) ──
  const readStream = useCallback(
    async (
      res: Response,
      questionId: string,
      onComplete?: (text: string) => void
    ) => {
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
              if (
                e instanceof Error &&
                e.message !== "Unexpected end of JSON input" &&
                e.message !== line.slice(6)
              ) {
                throw e;
              }
            }
          }
        }
      }

      // Save final response
      const wordCount = accumulated.split(/\s+/).filter(Boolean).length;
      dispatch({
        type: "UPDATE_QUESTION",
        id: questionId,
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
      onComplete?.(accumulated);
    },
    [dispatch]
  );

  // ── Generate ──
  const handleGenerate = useCallback(async () => {
    if (!question || isGenerating || isRefining) return;

    setIsGenerating(true);
    setStreamingText("");
    setError(null);
    setIsEditing(false);

    dispatch({
      type: "UPDATE_QUESTION",
      id: question.id,
      updates: { status: "generating", response: undefined },
    });

    const controller = new AbortController();
    abortRef.current = controller;

    // Build competitive intel context
    const mentions = detectCompetitors(state.questions);
    const competitiveContext = mentions.length > 0 ? getCompetitiveContext(mentions) : undefined;

    // Build issuer research context
    let issuerContext: string | undefined;
    if (state.client.companyName) {
      const intel = getIssuerIntel(state.client.companyName);
      if (intel) issuerContext = buildIssuerPromptContext(intel);
    }

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
      competitiveContext,
      issuerContext,
    };

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reqBody),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errData = await res
          .json()
          .catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }

      await readStream(res, question.id);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        dispatch({
          type: "UPDATE_QUESTION",
          id: question.id,
          updates: { status: "queued" },
        });
      } else {
        const message =
          err instanceof Error ? err.message : "Generation failed";
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
  }, [question, isGenerating, isRefining, state.client, state.clarification, dispatch, readStream]);

  // ── Refine (tone, expand, condense, add-kb, custom) ──
  const handleRefine = useCallback(
    async (action: RefineRequest["action"], kbSnippet?: string) => {
      if (!question || !question.response || isGenerating || isRefining)
        return;

      if (action === "custom" && !customInstruction.trim()) {
        setShowCustomPrompt(true);
        return;
      }

      setIsRefining(true);
      setStreamingText("");
      setError(null);
      setIsEditing(false);

      dispatch({
        type: "UPDATE_QUESTION",
        id: question.id,
        updates: { status: "generating" },
      });

      const controller = new AbortController();
      abortRef.current = controller;

      const reqBody: RefineRequest = {
        action,
        currentResponse: question.response.content,
        questionText: question.text,
        category: question.category,
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
        ...(action === "custom" && { customInstruction }),
        ...(action === "add-kb" && { kbSnippet }),
      };

      try {
        const res = await fetch("/api/refine", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(reqBody),
          signal: controller.signal,
        });

        if (!res.ok) {
          const errData = await res
            .json()
            .catch(() => ({ error: `HTTP ${res.status}` }));
          throw new Error(errData.error || `HTTP ${res.status}`);
        }

        await readStream(res, question.id);
        setShowCustomPrompt(false);
        setCustomInstruction("");
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          dispatch({
            type: "UPDATE_QUESTION",
            id: question.id,
            updates: { status: "draft" },
          });
        } else {
          const message =
            err instanceof Error ? err.message : "Refinement failed";
          setError(message);
          dispatch({
            type: "UPDATE_QUESTION",
            id: question.id,
            updates: { status: "draft" },
          });
        }
      } finally {
        setIsRefining(false);
        abortRef.current = null;
      }
    },
    [question, isGenerating, isRefining, customInstruction, state.client, state.clarification, dispatch, readStream]
  );

  const handleCancel = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
  }, []);

  const handleMarkFinal = useCallback(() => {
    if (!question) return;
    dispatch({
      type: "UPDATE_QUESTION",
      id: question.id,
      updates: { status: question.status === "final" ? "draft" : "final" },
    });
  }, [question, dispatch]);

  // ── Inline editing ──
  const handleStartEdit = useCallback(() => {
    if (!question?.response) return;
    setEditText(question.response.content);
    setIsEditing(true);
  }, [question]);

  const handleSaveEdit = useCallback(() => {
    if (!question) return;
    const wordCount = editText.split(/\s+/).filter(Boolean).length;
    dispatch({
      type: "UPDATE_QUESTION",
      id: question.id,
      updates: {
        status: "draft",
        response: {
          content: editText,
          wordCount,
          generatedAt: new Date().toISOString(),
          kbSourcesUsed: question.response?.kbSourcesUsed || ["manual-edit"],
        },
      },
    });
    setIsEditing(false);
  }, [question, editText, dispatch]);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    setEditText("");
  }, []);

  const handleSaveToLibrary = useCallback(() => {
    if (!question?.response) return;
    const wordCount = question.response.content.split(/\s+/).filter(Boolean).length;
    saveSnippet({
      id: createSnippetId(),
      title: question.text.slice(0, 80),
      content: question.response.content,
      category: question.category,
      tags: [question.category, state.client.industry].filter(Boolean),
      sourceQuestion: question.text,
      sourceClient: state.client.companyName || "",
      wordCount,
      qualityScore: question.response.qualityScore,
      createdAt: new Date().toISOString(),
      usedCount: 0,
    });
    setSavedToLibrary(true);
    setTimeout(() => setSavedToLibrary(false), 2000);
  }, [question, state.client]);

  // ── Export DOCX ──
  const handleExportDocx = useCallback(async () => {
    const clientName = state.client.companyName || "Client";
    const rfpTitle = state.client.industry
      ? `${clientName} — ${state.client.industry} RFP`
      : `${clientName} Proposal`;

    let costSummary;
    try {
      const { generateCostSummary } = await import("@/lib/costing");
      costSummary = generateCostSummary(
        state.clarification.answers,
        state.clarification.detectedModules
      );
    } catch {
      /* optional */
    }

    await exportProposalDocx(
      state.questions,
      clientName,
      rfpTitle,
      costSummary
    );
  }, [state.client, state.questions, state.clarification]);

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
  const displayText =
    isGenerating || isRefining ? streamingText : response?.content || "";
  const isBusy = isGenerating || isRefining;

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
          {isBusy ? (
            <button
              onClick={handleCancel}
              className="text-xs font-semibold px-4 py-[7px] rounded-lg bg-[var(--neg)] text-white border border-[var(--neg)] transition-all hover:brightness-110"
            >
              Cancel
            </button>
          ) : (
            <>
              <button
                onClick={handleGenerate}
                className="text-xs font-semibold px-4 py-[7px] rounded-lg bg-[var(--accent)] text-white border border-[var(--accent)] transition-all hover:bg-[var(--accent2)]"
              >
                <Sparkles className="w-3.5 h-3.5 inline -mt-px mr-1" />
                {response ? "Regenerate" : "Generate"}
              </button>
              {state.questions.some((q) => q.response) && (
                <button
                  onClick={handleExportDocx}
                  className="text-xs font-medium px-4 py-[7px] rounded-lg border border-[var(--border2)] bg-[var(--surface)] text-[var(--text2)] transition-all hover:border-[var(--text4)] hover:-translate-y-px hover:shadow-[var(--sh-sm)]"
                >
                  <FileDown className="w-3.5 h-3.5 inline -mt-px mr-1" />
                  Export DOCX
                </button>
              )}
            </>
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
            <span>
              Priority:{" "}
              {question.priority === "high"
                ? "High"
                : question.priority === "medium"
                ? "Medium"
                : "Low"}
            </span>
            {question.weight && <span>Weight: {question.weight}%</span>}
            {question.maxWords && <span>Max words: {question.maxWords}</span>}
          </div>
        </div>

        {/* Error display */}
        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-[var(--neg)]/10 border border-[var(--neg)]/20 text-sm text-[var(--neg)]">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Streaming / Response / Edit display */}
        {displayText || isBusy || isEditing ? (
          <div className="mb-7">
            <div className="flex justify-between items-center mb-3">
              <span className="font-mono text-[9px] font-semibold uppercase tracking-[1.5px] text-[var(--text3)]">
                {isBusy
                  ? isRefining
                    ? "Refining Response"
                    : "Generating Response"
                  : isEditing
                  ? "Editing Response"
                  : "Generated Response"}
              </span>
              {isBusy ? (
                <span className="font-mono text-[9px] px-[10px] py-[3px] rounded-full bg-[var(--accent)]/10 text-[var(--accent)] font-semibold flex items-center gap-1.5">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  {isRefining ? "Refining..." : "Writing..."}
                </span>
              ) : response ? (
                <span className="font-mono text-[9px] px-[10px] py-[3px] rounded-full bg-[var(--pos-pale)] text-[var(--pos)] font-semibold">
                  {question.status === "final" ? "Final" : "Draft"} &mdash;{" "}
                  {response.wordCount} words
                </span>
              ) : null}
            </div>

            {isEditing ? (
              /* ── Inline editor ── */
              <div>
                <textarea
                  ref={textareaRef}
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full bg-[var(--surface)] border border-[var(--accent-bd)] rounded-[var(--r-lg)] px-7 py-6 shadow-[var(--sh-sm)] text-sm leading-[1.8] text-[var(--text2)] min-h-[300px] resize-y outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/20 font-[inherit]"
                  placeholder="Edit your response..."
                />
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleSaveEdit}
                    className="text-xs font-semibold px-4 py-[7px] rounded-lg bg-[var(--accent)] text-white transition-all hover:bg-[var(--accent2)]"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 inline -mt-px mr-1" />
                    Save Changes
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="text-xs font-medium px-4 py-[7px] rounded-lg border border-[var(--border2)] bg-[var(--surface)] text-[var(--text2)] transition-all hover:border-[var(--text4)]"
                  >
                    <X className="w-3.5 h-3.5 inline -mt-px mr-1" />
                    Cancel
                  </button>
                  <span className="ml-auto font-mono text-[10px] text-[var(--text4)] self-center">
                    {editText.split(/\s+/).filter(Boolean).length} words
                  </span>
                </div>
              </div>
            ) : (
              /* ── Response display ── */
              <div className="bg-[var(--surface)] border border-[var(--border2)] rounded-[var(--r-lg)] px-7 py-6 shadow-[var(--sh-sm)] text-sm leading-[1.8] text-[var(--text2)] min-h-[200px]">
                {displayText.split("\n\n").map((para, i) => (
                  <p key={i} className="mb-[14px] last:mb-0">
                    {para.split(/(\*\*[^*]+\*\*)/).map((part, j) => {
                      if (part.startsWith("**") && part.endsWith("**")) {
                        return (
                          <strong
                            key={j}
                            className="text-[var(--text)] font-semibold"
                          >
                            {part.slice(2, -2)}
                          </strong>
                        );
                      }
                      return part;
                    })}
                  </p>
                ))}
                {isBusy && (
                  <span className="inline-block w-[2px] h-[14px] bg-[var(--accent)] animate-pulse ml-0.5 align-middle" />
                )}
                <div ref={streamEndRef} />
              </div>
            )}

            {/* ── Custom instruction input ── */}
            {showCustomPrompt && !isBusy && (
              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={customInstruction}
                  onChange={(e) => setCustomInstruction(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && customInstruction.trim()) {
                      handleRefine("custom");
                    }
                    if (e.key === "Escape") {
                      setShowCustomPrompt(false);
                      setCustomInstruction("");
                    }
                  }}
                  placeholder="e.g., Make more technical, Add ROI metrics, Focus on security..."
                  className="flex-1 text-xs px-4 py-[7px] rounded-lg border border-[var(--border2)] bg-[var(--surface)] text-[var(--text)] outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/20 placeholder:text-[var(--text4)]"
                  autoFocus
                />
                <button
                  onClick={() => handleRefine("custom")}
                  disabled={!customInstruction.trim()}
                  className="text-xs font-semibold px-4 py-[7px] rounded-lg bg-[var(--accent)] text-white transition-all hover:bg-[var(--accent2)] disabled:opacity-40"
                >
                  <Send className="w-3.5 h-3.5 inline -mt-px mr-1" />
                  Refine
                </button>
                <button
                  onClick={() => {
                    setShowCustomPrompt(false);
                    setCustomInstruction("");
                  }}
                  className="text-xs font-medium px-3 py-[7px] rounded-lg border border-[var(--border2)] bg-[var(--surface)] text-[var(--text4)] transition-all hover:border-[var(--text4)]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* ── Toolbar ── */}
            {!isBusy && !isEditing && response && (
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
                <button
                  onClick={handleStartEdit}
                  className="font-mono text-[10px] text-[var(--text4)] px-3 py-[5px] rounded-md border border-transparent transition-all hover:bg-[var(--accent-pale)] hover:text-[var(--accent)] hover:border-[var(--accent-bd)]"
                >
                  <Pencil className="w-3 h-3 inline -mt-px mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => handleRefine("refine-tone")}
                  className="font-mono text-[10px] text-[var(--text4)] px-3 py-[5px] rounded-md border border-transparent transition-all hover:bg-[var(--accent-pale)] hover:text-[var(--accent)] hover:border-[var(--accent-bd)]"
                >
                  <SlidersHorizontal className="w-3 h-3 inline -mt-px mr-1" />
                  Refine tone
                </button>
                <button
                  onClick={() => handleRefine("expand")}
                  className="font-mono text-[10px] text-[var(--text4)] px-3 py-[5px] rounded-md border border-transparent transition-all hover:bg-[var(--accent-pale)] hover:text-[var(--accent)] hover:border-[var(--accent-bd)]"
                >
                  <ArrowUpDown className="w-3 h-3 inline -mt-px mr-1" />
                  Expand
                </button>
                <button
                  onClick={() => handleRefine("condense")}
                  className="font-mono text-[10px] text-[var(--text4)] px-3 py-[5px] rounded-md border border-transparent transition-all hover:bg-[var(--accent-pale)] hover:text-[var(--accent)] hover:border-[var(--accent-bd)]"
                >
                  <ArrowUpDown className="w-3 h-3 inline -mt-px mr-1" />
                  Condense
                </button>
                <button
                  onClick={() => handleRefine("add-kb")}
                  className="font-mono text-[10px] text-[var(--text4)] px-3 py-[5px] rounded-md border border-transparent transition-all hover:bg-[var(--accent-pale)] hover:text-[var(--accent)] hover:border-[var(--accent-bd)]"
                >
                  <BookOpen className="w-3 h-3 inline -mt-px mr-1" />
                  Add from KB
                </button>
                <button
                  onClick={() => setShowCustomPrompt(true)}
                  className="font-mono text-[10px] text-[var(--text4)] px-3 py-[5px] rounded-md border border-transparent transition-all hover:bg-[var(--accent-pale)] hover:text-[var(--accent)] hover:border-[var(--accent-bd)]"
                >
                  <MessageSquare className="w-3 h-3 inline -mt-px mr-1" />
                  Custom rewrite
                </button>
                <button
                  onClick={handleSaveToLibrary}
                  className={`font-mono text-[10px] px-3 py-[5px] rounded-md border transition-all ml-auto ${
                    savedToLibrary
                      ? "bg-[var(--pos-pale)] text-[var(--pos)] border-[var(--pos-bd)]"
                      : "text-[var(--text4)] border-transparent hover:bg-[var(--accent-pale)] hover:text-[var(--accent)] hover:border-[var(--accent-bd)]"
                  }`}
                >
                  {savedToLibrary ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 inline -mt-px mr-1" />
                      Saved!
                    </>
                  ) : (
                    <>
                      <Paperclip className="w-3 h-3 inline -mt-px mr-1" />
                      Save to Library
                    </>
                  )}
                </button>
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
        {response?.qualityScore && !isBusy && !isEditing && (
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
