"use client";

import { useCallback, useState } from "react";
import { CATEGORY_CONFIG } from "@/types";
import type { ProposalProject, RfpQuestion } from "@/types";
import { useAppDispatch, useAppState } from "@/lib/store";
import {
  Settings2,
  Calculator,
  Swords,
  FolderOpen,
  FileDown,
  FileText,
  Presentation,
  Loader2,
} from "lucide-react";
import { exportProposalPdf } from "@/lib/export/generate-pdf";
import { getUploadedDocs } from "./ContextPanel";

interface OutlinePanelProps {
  project: ProposalProject;
  activeQuestionId: string | null;
  onSelectQuestion: (id: string) => void;
}

function statusLabel(q: RfpQuestion) {
  switch (q.status) {
    case "final":
      return <span className="ml-auto font-mono text-[9px] text-[var(--pos)]">&#10003;</span>;
    case "review":
      return <span className="ml-auto font-mono text-[9px] text-[var(--gold)]">review</span>;
    case "draft":
      return <span className="ml-auto font-mono text-[9px] text-[var(--gold)]">draft</span>;
    case "generating":
      return <span className="ml-auto font-mono text-[9px] text-[var(--accent2)]">editing</span>;
    case "queued":
      return <span className="ml-auto font-mono text-[9px] text-white/20">&mdash;</span>;
  }
}

export default function OutlinePanel({
  project,
  activeQuestionId,
  onSelectQuestion,
}: OutlinePanelProps) {
  const dispatch = useAppDispatch();
  const { clarification, client, questions } = useAppState();

  const [deckStatus, setDeckStatus] = useState<
    "idle" | "generating" | "error"
  >("idle");
  const [deckError, setDeckError] = useState("");
  const [deckProgress, setDeckProgress] = useState(0);
  const [deckStage, setDeckStage] = useState("");

  const handleExportPdf = useCallback(async () => {
    const clientName = client.companyName || "Client";
    const rfpTitle = client.industry
      ? `${clientName} — ${client.industry} RFP`
      : `${clientName} Proposal`;

    let costSummary;
    try {
      const { generateCostSummary } = await import("@/lib/costing");
      costSummary = generateCostSummary(
        clarification.answers,
        clarification.detectedModules
      );
    } catch {
      /* optional */
    }

    await exportProposalPdf(questions, clientName, rfpTitle, costSummary);
  }, [client, questions, clarification]);

  const handleExportDeck = useCallback(async () => {
    setDeckStatus("generating");
    setDeckError("");
    setDeckProgress(0);
    setDeckStage("Preparing...");

    try {
      // Build the request payload — supports questions, documents, or both
      const questionsWithResponses = questions.filter((q) => q.response?.content);
      const uploadedDocs = getUploadedDocs();

      const payload: Record<string, unknown> = {
        client: {
          companyName: client.companyName || "Client",
          industry: client.industry || "Technology",
          size: client.size,
          painPoints: client.painPoints
            ? client.painPoints.split(",").map((s: string) => s.trim())
            : undefined,
        },
        engagementName: client.industry
          ? `${client.companyName} — ${client.industry}`
          : undefined,
      };

      // Include questions if available
      if (questionsWithResponses.length > 0) {
        payload.questions = questionsWithResponses.map((q) => ({
          id: q.id,
          text: q.text,
          category: q.category,
          response: q.response!.content,
          wordCount: q.response!.wordCount || q.response!.content.split(/\s+/).length,
          score: q.response!.qualityScore,
        }));
      }

      // Include uploaded documents if available
      if (uploadedDocs.length > 0) {
        payload.documents = uploadedDocs.map((d) => ({
          name: d.name,
          content: d.content,
          wordCount: d.wordCount,
        }));
      }

      const res = await fetch("/api/export/deck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok || !res.body) {
        const text = await res.text();
        let msg = `HTTP ${res.status}`;
        try { msg = JSON.parse(text).error || msg; } catch { /* ok */ }
        throw new Error(msg);
      }

      // Read SSE stream
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let completed = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // keep incomplete line

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6).trim();
          if (!raw) continue;

          try {
            const evt = JSON.parse(raw);

            if (evt.type === "progress") {
              setDeckProgress(evt.percent || 0);
              setDeckStage(evt.message || evt.stage || "");
            } else if (evt.type === "complete") {
              completed = true;
              setDeckProgress(100);
              setDeckStage(`Done — ${evt.slideCount} slides`);

              // Decode base64 and trigger download
              const byteChars = atob(evt.data);
              const byteArray = new Uint8Array(byteChars.length);
              for (let i = 0; i < byteChars.length; i++) {
                byteArray[i] = byteChars.charCodeAt(i);
              }
              const blob = new Blob([byteArray], {
                type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
              });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = evt.filename || "proposal.pptx";
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);

              setTimeout(() => {
                setDeckStatus("idle");
                setDeckProgress(0);
                setDeckStage("");
              }, 2000);
            } else if (evt.type === "error") {
              throw new Error(evt.message || "Generation failed");
            }
          } catch (parseErr) {
            // If it's a re-thrown error from "error" event, propagate it
            if (parseErr instanceof Error && parseErr.message !== "Unexpected end of JSON input") {
              throw parseErr;
            }
          }
        }
      }

      // Stream ended without a "complete" event — likely a serverless timeout
      if (!completed) {
        throw new Error("Connection lost — server may have timed out. Try again.");
      }
    } catch (err) {
      console.error("Deck export error:", err);
      setDeckError(err instanceof Error ? err.message : "Unknown error");
      setDeckStatus("error");
      setDeckProgress(0);
      setTimeout(() => {
        setDeckStatus("idle");
        setDeckStage("");
      }, 5000);
    }
  }, [questions, client]);

  return (
    <aside className="w-[260px] min-w-[260px] bg-[var(--navy)] text-white/70 flex flex-col overflow-hidden">
      {/* Brand header */}
      <div className="px-5 pt-[18px] pb-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-[10px] mb-[14px]">
          <div className="w-7 h-7 rounded-[7px] bg-[var(--accent)] flex items-center justify-center font-bold text-xs text-white">
            O
          </div>
          <div>
            <div className="text-[15px] font-bold text-white tracking-[0.5px]">
              Orion<span className="text-[var(--accent2)]">.</span>
            </div>
            <div className="font-mono text-[8px] text-white/30 uppercase tracking-[1.5px] mt-[1px]">
              by EyeOn
            </div>
          </div>
        </div>
        <div className="text-xs text-white/45">
          {project.clientName} &mdash; {project.rfpTitle}
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-5 py-4 border-b border-white/[0.06]">
        <div className="font-mono text-[9px] text-white/30 uppercase tracking-[1.5px] mb-2 flex justify-between">
          <span>Proposal Progress</span>
          <span className="text-white/50 font-semibold">
            {project.completionPercent}%
          </span>
        </div>
        <div className="h-1 bg-white/[0.08] rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--accent2)] rounded-full transition-all duration-500"
            style={{ width: `${project.completionPercent}%` }}
          />
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="px-5 py-3 border-b border-white/[0.06] space-y-2">
        <button
          onClick={() => dispatch({ type: "SHOW_CLARIFICATION", show: true })}
          className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-medium transition-all ${
            clarification.isComplete
              ? "bg-white/[0.04] text-white/40 hover:bg-white/[0.08] hover:text-white/60"
              : "bg-[var(--accent)]/20 text-[var(--accent2)] hover:bg-[var(--accent)]/30"
          }`}
        >
          <Settings2 size={13} />
          {clarification.isComplete ? "Edit Engagement Settings" : "Configure Engagement"}
          {!clarification.isComplete && (
            <span className="ml-auto w-2 h-2 rounded-full bg-[var(--accent2)] animate-pulse" />
          )}
        </button>
        <button
          onClick={() => dispatch({ type: "SET_VIEW", view: "costing" })}
          className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-medium transition-all bg-white/[0.04] text-white/40 hover:bg-white/[0.08] hover:text-white/60"
        >
          <Calculator size={13} />
          Cost Dashboard
        </button>
        <button
          onClick={() => dispatch({ type: "SET_VIEW", view: "differentiators" })}
          className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-medium transition-all bg-white/[0.04] text-white/40 hover:bg-white/[0.08] hover:text-white/60"
        >
          <Swords size={13} />
          Differentiators
        </button>
        <button
          onClick={() => dispatch({ type: "SET_VIEW", view: "proposals" })}
          className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-medium transition-all bg-white/[0.04] text-white/40 hover:bg-white/[0.08] hover:text-white/60"
        >
          <FolderOpen size={13} />
          Proposals & Templates
        </button>

        {/* Export buttons — show when we have responses OR uploaded docs */}
        {(questions.some((q) => q.response) || getUploadedDocs().length > 0) && (
          <div className="pt-2 border-t border-white/[0.06]">
            <div className="font-mono text-[8px] text-white/20 uppercase tracking-[2px] mb-2">
              Export
            </div>
            <button
              onClick={handleExportPdf}
              className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-medium transition-all bg-white/[0.04] text-white/40 hover:bg-white/[0.08] hover:text-white/60"
            >
              <FileDown size={13} />
              Export PDF
            </button>
            <button
              onClick={handleExportDeck}
              disabled={deckStatus === "generating"}
              className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-medium transition-all ${
                deckStatus === "generating"
                  ? "bg-[var(--accent)]/20 text-[var(--accent2)] cursor-wait"
                  : deckStatus === "error"
                  ? "bg-red-500/10 text-red-400"
                  : "bg-white/[0.04] text-white/40 hover:bg-white/[0.08] hover:text-white/60"
              }`}
            >
              {deckStatus === "generating" ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Presentation size={13} />
              )}
              {deckStatus === "generating"
                ? "Generating Deck..."
                : deckStatus === "error"
                ? "Deck Error"
                : "Export Deck"}
            </button>
            {/* Deck generation progress bar */}
            {deckStatus === "generating" && (
              <div className="mt-2 px-1">
                <div className="h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--accent2)] rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${deckProgress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-[9px] text-white/40 truncate max-w-[180px]">
                    {deckStage}
                  </span>
                  <span className="text-[9px] font-mono text-white/30 ml-1 shrink-0">
                    {deckProgress}%
                  </span>
                </div>
                {/* Stage dots */}
                <div className="flex items-center gap-1.5 mt-2">
                  {[
                    { label: "Prep", threshold: 5 },
                    { label: "Outline", threshold: 15 },
                    { label: "Content", threshold: 45 },
                    { label: "Render", threshold: 75 },
                    { label: "Done", threshold: 100 },
                  ].map((step) => (
                    <div key={step.label} className="flex items-center gap-1">
                      <div
                        className={`w-[5px] h-[5px] rounded-full transition-colors duration-300 ${
                          deckProgress >= step.threshold
                            ? "bg-[var(--accent2)]"
                            : "bg-white/[0.12]"
                        }`}
                      />
                      <span
                        className={`text-[7px] font-mono uppercase tracking-wider transition-colors duration-300 ${
                          deckProgress >= step.threshold
                            ? "text-white/50"
                            : "text-white/15"
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {deckStatus === "error" && deckError && (
              <div className="px-3 text-[9px] text-red-400/70 mt-1">
                {deckError}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sections + questions */}
      <div className="flex-1 overflow-y-auto py-2 dark-scroll">
        {/* Sections overview */}
        <div className="font-mono text-[8px] text-white/20 uppercase tracking-[2px] px-5 pt-3 pb-1">
          Sections
        </div>
        {project.sections.map((s) => {
          const cfg = CATEGORY_CONFIG[s.category];
          const isDone = s.completed === s.total;
          const hasDrafts = s.completed > 0 && !isDone;
          return (
            <div
              key={s.category}
              className="flex items-center gap-[10px] px-5 py-2 text-xs cursor-pointer transition-colors hover:bg-white/[0.04]"
            >
              <div
                className="w-[6px] h-[6px] rounded-full shrink-0"
                style={{ background: s.color }}
              />
              <span>
                {cfg.label} ({s.total})
              </span>
              <span
                className={`ml-auto font-mono text-[9px] ${
                  isDone
                    ? "text-[var(--pos)]"
                    : hasDrafts
                    ? "text-[var(--gold)]"
                    : "text-white/20"
                }`}
              >
                {s.completed}/{s.total}
              </span>
            </div>
          );
        })}

        {/* Questions list */}
        <div className="font-mono text-[8px] text-white/20 uppercase tracking-[2px] px-5 pt-4 pb-1">
          Questions
        </div>
        {project.questions.map((q) => {
          const isActive = q.id === activeQuestionId;
          const isDone = q.status === "final";
          return (
            <div
              key={q.id}
              onClick={() => onSelectQuestion(q.id)}
              className={`flex items-center gap-[10px] px-5 py-2 cursor-pointer transition-colors text-[11px] ${
                isActive
                  ? "bg-white/[0.08] text-white"
                  : isDone
                  ? "text-white/30 hover:bg-white/[0.04]"
                  : q.status === "queued"
                  ? "text-white/45 hover:bg-white/[0.04]"
                  : "text-white/60 hover:bg-white/[0.04]"
              }`}
            >
              <span className="truncate flex-1">
                Q{q.number}. {q.text}
              </span>
              {statusLabel(q)}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
