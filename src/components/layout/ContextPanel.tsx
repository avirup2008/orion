"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { KbMatch, PastProposal, RfpQuestion } from "@/types";
import { useAppState } from "@/lib/store";
import type { ScoreResult } from "@/app/api/score/route";
import {
  Loader2,
  FileUp,
  FileText,
  Trash2,
  RefreshCcw,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";

interface ContextPanelProps {
  kbMatches: KbMatch[];
  pastProposals: PastProposal[];
}

type Tab = "kb" | "past" | "scoring" | "docs";

// ── RAG document store (in-memory for session) ──
interface UploadedDoc {
  id: string;
  name: string;
  content: string;
  wordCount: number;
  uploadedAt: string;
}

let uploadedDocs: UploadedDoc[] = [];

export function getUploadedDocs(): UploadedDoc[] {
  return uploadedDocs;
}

export default function ContextPanel({
  kbMatches,
  pastProposals,
}: ContextPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>("kb");
  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null);
  const [isScoring, setIsScoring] = useState(false);
  const [scoreError, setScoreError] = useState<string | null>(null);
  const [docs, setDocs] = useState<UploadedDoc[]>(uploadedDocs);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { questions, activeQuestionId, client } = useAppState();
  const activeQuestion = questions.find((q) => q.id === activeQuestionId) ?? null;

  // Reset score when question changes
  useEffect(() => {
    setScoreResult(null);
    setScoreError(null);
  }, [activeQuestionId]);

  const tabs: { id: Tab; label: string }[] = [
    { id: "kb", label: "KB Matches" },
    { id: "past", label: "Past Answers" },
    { id: "scoring", label: "Scoring" },
    { id: "docs", label: "RAG Docs" },
  ];

  // ── Score current response ──
  const handleScore = useCallback(async () => {
    if (!activeQuestion?.response) return;

    setIsScoring(true);
    setScoreError(null);

    try {
      const res = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionText: activeQuestion.text,
          responseContent: activeQuestion.response.content,
          category: activeQuestion.category,
          clientName: client.companyName || "",
          industry: client.industry || "",
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      const data: ScoreResult = await res.json();
      setScoreResult(data);
    } catch (err) {
      setScoreError(err instanceof Error ? err.message : "Scoring failed");
    } finally {
      setIsScoring(false);
    }
  }, [activeQuestion, client]);

  // ── Upload document for RAG ──
  const handleUploadDoc = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    for (const file of Array.from(files)) {
      try {
        let content = "";

        if (file.name.endsWith(".txt") || file.name.endsWith(".md")) {
          content = await file.text();
        } else if (file.name.endsWith(".docx")) {
          const mammoth = await import("mammoth");
          const arrayBuffer = await file.arrayBuffer();
          const result = await mammoth.extractRawText({ arrayBuffer });
          content = result.value;
        } else if (file.name.endsWith(".pdf")) {
          const pdfjsLib = await import("pdfjs-dist");
          pdfjsLib.GlobalWorkerOptions.workerSrc = "";
          const arrayBuffer = await file.arrayBuffer();
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          const pages: string[] = [];
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const tc = await page.getTextContent();
            pages.push(
              tc.items
                .map((item) => ("str" in item ? item.str : ""))
                .join(" ")
            );
          }
          content = pages.join("\n\n");
        } else {
          content = await file.text();
        }

        const doc: UploadedDoc = {
          id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          name: file.name,
          content,
          wordCount: content.split(/\s+/).filter(Boolean).length,
          uploadedAt: new Date().toISOString(),
        };

        uploadedDocs = [...uploadedDocs, doc];
        setDocs([...uploadedDocs]);
      } catch (err) {
        console.error(`Failed to parse ${file.name}:`, err);
      }
    }

    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const handleRemoveDoc = useCallback((id: string) => {
    uploadedDocs = uploadedDocs.filter((d) => d.id !== id);
    setDocs([...uploadedDocs]);
  }, []);

  // ── Score badge color ──
  function scoreColor(score: number): string {
    if (score >= 8) return "text-[var(--pos)]";
    if (score >= 6) return "text-[var(--gold)]";
    return "text-[var(--neg)]";
  }

  function scoreBg(score: number): string {
    if (score >= 8) return "bg-[var(--pos)]";
    if (score >= 6) return "bg-[var(--gold)]";
    return "bg-[var(--neg)]";
  }

  return (
    <aside className="w-[300px] min-w-[300px] bg-[var(--surface2)] border-l border-[var(--border)] overflow-hidden flex flex-col">
      {/* Tab header */}
      <div className="sticky top-0 z-[5] bg-[var(--surface2)]/95 backdrop-blur-[8px] border-b border-[var(--border)] px-[18px] py-3">
        <div className="flex gap-[2px] flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`font-mono text-[9px] font-medium uppercase tracking-[1px] px-3 py-[6px] rounded-md transition-all ${
                activeTab === tab.id
                  ? "bg-[var(--accent-pale)] text-[var(--accent)] font-semibold"
                  : "text-[var(--text4)] hover:bg-[var(--surface3)] hover:text-[var(--text2)]"
              }`}
            >
              {tab.label}
              {tab.id === "docs" && docs.length > 0 && (
                <span className="ml-1 text-[8px] bg-[var(--accent)] text-white rounded-full px-1.5 py-[1px]">
                  {docs.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-[18px] pt-4">
        {/* ── KB Matches Tab ── */}
        {activeTab === "kb" && (
          <>
            <div className="font-mono text-[9px] font-semibold uppercase tracking-[1.5px] text-[var(--text3)] mb-[10px]">
              Relevant Knowledge
            </div>
            {kbMatches.length === 0 ? (
              <div className="text-[11px] text-[var(--text4)] text-center py-6">
                Select a question to see matching knowledge
              </div>
            ) : (
              kbMatches.map((match) => (
                <div
                  key={match.id}
                  className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-[14px] mb-2 shadow-[var(--sh-sm)] cursor-pointer transition-all hover:shadow-[var(--sh)] hover:-translate-y-px"
                >
                  <div className="text-xs font-semibold text-[var(--text)] mb-1">
                    {match.title}
                  </div>
                  <div className="font-mono text-[9px] text-[var(--text4)]">
                    {match.source} &middot; {match.matchScore}% match
                  </div>
                  <div className="text-[11px] text-[var(--text3)] leading-[1.5] mt-[6px]">
                    {match.preview}
                  </div>
                  <div className="flex items-center gap-[6px] mt-[6px]">
                    <div className="flex-1 h-[3px] bg-[var(--surface3)] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${match.matchScore}%`,
                          background:
                            match.matchScore >= 90
                              ? "var(--pos)"
                              : match.matchScore >= 80
                              ? "var(--gold)"
                              : "var(--blue)",
                        }}
                      />
                    </div>
                    <span className="font-mono text-[9px] font-semibold text-[var(--text3)]">
                      {match.matchScore}%
                    </span>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {/* ── Past Answers Tab ── */}
        {activeTab === "past" && (
          <>
            <div className="font-mono text-[9px] font-semibold uppercase tracking-[1.5px] text-[var(--text3)] mb-[10px]">
              Past Proposals
            </div>
            {pastProposals.map((p) => (
              <div
                key={p.id}
                className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-[14px] mb-2 shadow-[var(--sh-sm)] cursor-pointer transition-all hover:shadow-[var(--sh)] hover:-translate-y-px"
              >
                <div className="text-xs font-semibold text-[var(--text)] mb-1">
                  {p.title}
                </div>
                <div className="font-mono text-[9px] text-[var(--text4)]">
                  {p.year} &middot;{" "}
                  <span
                    className={
                      p.outcome === "won"
                        ? "text-[var(--pos)]"
                        : p.outcome === "lost"
                        ? "text-[var(--neg)]"
                        : "text-[var(--gold)]"
                    }
                  >
                    {p.outcome === "won" ? "Won" : p.outcome === "lost" ? "Lost" : "Pending"}
                  </span>{" "}
                  &middot; {p.similarityScore}% similar
                </div>
                <div className="text-[11px] text-[var(--text3)] leading-[1.5] mt-[6px]">
                  {p.preview}
                </div>
              </div>
            ))}
          </>
        )}

        {/* ── Scoring Tab ── */}
        {activeTab === "scoring" && (
          <>
            <div className="font-mono text-[9px] font-semibold uppercase tracking-[1.5px] text-[var(--text3)] mb-[10px]">
              Response Quality
            </div>

            {!activeQuestion?.response ? (
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-[14px] shadow-[var(--sh-sm)]">
                <div className="text-[11px] text-[var(--text4)] text-center">
                  Generate a response first to score it
                </div>
              </div>
            ) : scoreResult ? (
              <>
                {/* Overall score */}
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4 shadow-[var(--sh-sm)] mb-3">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-[var(--text)]">Overall</span>
                    <span className={`text-2xl font-bold ${scoreColor(scoreResult.overall)}`}>
                      {scoreResult.overall.toFixed(1)}
                    </span>
                  </div>
                  <div className="h-[6px] bg-[var(--surface3)] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${scoreBg(scoreResult.overall)}`}
                      style={{ width: `${scoreResult.overall * 10}%` }}
                    />
                  </div>
                </div>

                {/* Dimension scores */}
                <div className="space-y-2 mb-3">
                  {Object.entries(scoreResult.dimensions).map(([dim, score]) => (
                    <div key={dim} className="bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2.5">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] text-[var(--text2)] capitalize">{dim}</span>
                        <span className={`font-mono text-[10px] font-bold ${scoreColor(score)}`}>{score}/10</span>
                      </div>
                      <div className="h-[3px] bg-[var(--surface3)] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${scoreBg(score)}`}
                          style={{ width: `${score * 10}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Strengths */}
                {scoreResult.strengths.length > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center gap-1 mb-2">
                      <CheckCircle2 size={10} className="text-[var(--pos)]" />
                      <span className="font-mono text-[8px] uppercase tracking-wider text-[var(--pos)] font-semibold">Strengths</span>
                    </div>
                    {scoreResult.strengths.map((s, i) => (
                      <div key={i} className="text-[10px] text-[var(--text3)] leading-[1.5] pl-3 mb-1">
                        {s}
                      </div>
                    ))}
                  </div>
                )}

                {/* Improvements */}
                {scoreResult.improvements.length > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center gap-1 mb-2">
                      <TrendingUp size={10} className="text-[var(--gold)]" />
                      <span className="font-mono text-[8px] uppercase tracking-wider text-[var(--gold)] font-semibold">Improvements</span>
                    </div>
                    {scoreResult.improvements.map((s, i) => (
                      <div key={i} className="text-[10px] text-[var(--text3)] leading-[1.5] pl-3 mb-1">
                        {s}
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={handleScore}
                  disabled={isScoring}
                  className="w-full text-center font-mono text-[9px] px-3 py-2 rounded-md border border-[var(--border)] text-[var(--text4)] hover:bg-[var(--surface3)] hover:text-[var(--text2)] transition-all"
                >
                  <RefreshCcw className="w-3 h-3 inline -mt-px mr-1" />
                  Re-score
                </button>
              </>
            ) : (
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4 shadow-[var(--sh-sm)] text-center">
                {scoreError ? (
                  <>
                    <AlertTriangle size={16} className="text-[var(--neg)] mx-auto mb-2" />
                    <div className="text-[11px] text-[var(--neg)] mb-3">{scoreError}</div>
                  </>
                ) : (
                  <div className="text-[11px] text-[var(--text4)] mb-3">
                    Score this response across 5 quality dimensions
                  </div>
                )}
                <button
                  onClick={handleScore}
                  disabled={isScoring}
                  className="text-xs font-semibold px-4 py-2 rounded-lg bg-[var(--accent)] text-white transition-all hover:bg-[var(--accent2)] disabled:opacity-50"
                >
                  {isScoring ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 inline -mt-px mr-1 animate-spin" />
                      Scoring...
                    </>
                  ) : (
                    "Score Response"
                  )}
                </button>
              </div>
            )}
          </>
        )}

        {/* ── RAG Docs Tab ── */}
        {activeTab === "docs" && (
          <>
            <div className="font-mono text-[9px] font-semibold uppercase tracking-[1.5px] text-[var(--text3)] mb-[10px]">
              Reference Documents
            </div>
            <div className="text-[10px] text-[var(--text4)] mb-3">
              Upload past proposals, SOWs, or case studies. Their content will be available as context for response generation.
            </div>

            {/* Upload area */}
            <label className="block mb-3 cursor-pointer">
              <div className="border-2 border-dashed border-[var(--border2)] rounded-lg p-4 text-center hover:border-[var(--accent)] hover:bg-[var(--accent-pale)]/50 transition-all">
                {isUploading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 size={14} className="animate-spin text-[var(--accent)]" />
                    <span className="text-[11px] text-[var(--accent)]">Processing...</span>
                  </div>
                ) : (
                  <>
                    <FileUp size={16} className="text-[var(--text4)] mx-auto mb-1" />
                    <div className="text-[11px] text-[var(--text3)]">
                      Drop or click to upload
                    </div>
                    <div className="text-[9px] text-[var(--text4)] mt-1">
                      .docx, .pdf, .txt, .md
                    </div>
                  </>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".docx,.pdf,.txt,.md"
                multiple
                onChange={handleUploadDoc}
                className="hidden"
              />
            </label>

            {/* Uploaded docs list */}
            {docs.length === 0 ? (
              <div className="text-[11px] text-[var(--text4)] text-center py-4">
                No documents uploaded yet
              </div>
            ) : (
              <div className="space-y-2">
                {docs.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-3 shadow-[var(--sh-sm)]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText size={12} className="text-[var(--accent)] shrink-0" />
                        <span className="text-xs font-medium text-[var(--text)] truncate">
                          {doc.name}
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveDoc(doc.id)}
                        className="text-[var(--text4)] hover:text-[var(--neg)] transition-colors shrink-0"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                    <div className="font-mono text-[9px] text-[var(--text4)] mt-1">
                      {doc.wordCount.toLocaleString()} words &middot;{" "}
                      {new Date(doc.uploadedAt).toLocaleDateString()}
                    </div>
                    <div className="text-[10px] text-[var(--text3)] mt-1 line-clamp-2">
                      {doc.content.slice(0, 150)}...
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  );
}
