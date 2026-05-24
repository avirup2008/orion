"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useAppState, useAppDispatch, getCompletionPercent } from "@/lib/store";
import {
  listProposals,
  saveProposal,
  deleteProposal,
  createProposalId,
  listTemplates,
  saveTemplate,
  deleteTemplate,
  type SavedProposal,
  type EngagementTemplate,
} from "@/lib/proposals";
import {
  ArrowLeft,
  Plus,
  FileText,
  Trash2,
  FolderOpen,
  Save,
  Bookmark,
  Clock,
  CheckCircle2,
  Copy,
} from "lucide-react";

interface ProposalDashboardProps {
  onBack: () => void;
}

export default function ProposalDashboard({ onBack }: ProposalDashboardProps) {
  const state = useAppState();
  const dispatch = useAppDispatch();

  const [proposals, setProposals] = useState<SavedProposal[]>([]);
  const [templates, setTemplates] = useState<EngagementTemplate[]>([]);
  const [activeTab, setActiveTab] = useState<"proposals" | "templates">("proposals");
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateDesc, setTemplateDesc] = useState("");

  // Load data on mount
  useEffect(() => {
    setProposals(listProposals());
    setTemplates(listTemplates());
  }, []);

  // ── Save current proposal ──
  const handleSaveProposal = useCallback(() => {
    const proposal: SavedProposal = {
      id: (state as unknown as { proposalId?: string }).proposalId || createProposalId(),
      name: state.client.companyName
        ? `${state.client.companyName} — ${state.client.industry || "Proposal"}`
        : "Untitled Proposal",
      client: state.client,
      questions: state.questions,
      clarification: state.clarification,
      referenceDocNames: state.referenceDocNames,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completionPercent: getCompletionPercent(state.questions),
    };
    saveProposal(proposal);
    setProposals(listProposals());
  }, [state]);

  // ── Load proposal ──
  const handleLoadProposal = useCallback(
    (proposal: SavedProposal) => {
      dispatch({ type: "SET_CLIENT", client: proposal.client });
      dispatch({ type: "CLEAR_QUESTIONS" });
      dispatch({ type: "ADD_QUESTIONS", questions: proposal.questions });
      if (proposal.clarification.isComplete) {
        dispatch({ type: "COMPLETE_CLARIFICATION" });
      }
      for (const [k, v] of Object.entries(proposal.clarification.answers)) {
        dispatch({ type: "SET_CLARIFICATION_ANSWER", questionId: k, answer: v });
      }
      if (proposal.clarification.detectedModules.length > 0) {
        dispatch({ type: "SET_DETECTED_MODULES", modules: proposal.clarification.detectedModules });
      }
      dispatch({ type: "SET_VIEW", view: "studio" });
      if (proposal.questions.length > 0) {
        dispatch({ type: "SET_ACTIVE_QUESTION", id: proposal.questions[0].id });
      }
    },
    [dispatch]
  );

  // ── Delete proposal ──
  const handleDeleteProposal = useCallback((id: string) => {
    deleteProposal(id);
    setProposals(listProposals());
  }, []);

  // ── Apply template ──
  const handleApplyTemplate = useCallback(
    (template: EngagementTemplate) => {
      if (template.client.size) {
        dispatch({ type: "SET_CLIENT", client: template.client });
      }
      for (const [k, v] of Object.entries(template.clarificationAnswers)) {
        dispatch({ type: "SET_CLARIFICATION_ANSWER", questionId: k, answer: v });
      }
      if (template.detectedModules.length > 0) {
        dispatch({ type: "SET_DETECTED_MODULES", modules: template.detectedModules });
      }
      dispatch({ type: "COMPLETE_CLARIFICATION" });
      dispatch({ type: "SET_VIEW", view: "intake" });
    },
    [dispatch]
  );

  // ── Save as template ──
  const handleSaveTemplate = useCallback(() => {
    if (!templateName.trim()) return;
    const template: EngagementTemplate = {
      id: `tpl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: templateName.trim(),
      description: templateDesc.trim() || "Custom engagement template",
      client: state.client,
      clarificationAnswers: state.clarification.answers,
      detectedModules: state.clarification.detectedModules,
      createdAt: new Date().toISOString(),
    };
    saveTemplate(template);
    setTemplates(listTemplates());
    setShowSaveTemplate(false);
    setTemplateName("");
    setTemplateDesc("");
  }, [templateName, templateDesc, state.client, state.clarification]);

  // ── Delete template ──
  const handleDeleteTemplate = useCallback((id: string) => {
    deleteTemplate(id);
    setTemplates(listTemplates());
  }, []);

  const currentProposalName = state.client.companyName
    ? `${state.client.companyName} — ${state.client.industry || "Proposal"}`
    : "Current Proposal";

  return (
    <div className="h-full overflow-y-auto bg-[var(--bg)]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[var(--bg)]/95 backdrop-blur-[12px] border-b border-[var(--border)] px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="text-xs font-medium px-3 py-[7px] rounded-lg border border-[var(--border2)] bg-[var(--surface)] text-[var(--text2)] transition-all hover:border-[var(--text4)]"
          >
            <ArrowLeft className="w-3.5 h-3.5 inline -mt-px mr-1" />
            Back
          </button>
          <div>
            <h1 className="text-lg font-bold text-[var(--text)]">
              Proposals & Templates
            </h1>
            <p className="text-[11px] text-[var(--text4)]">
              Manage saved proposals and engagement presets
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSaveProposal}
            className="text-xs font-semibold px-4 py-[7px] rounded-lg bg-[var(--accent)] text-white transition-all hover:bg-[var(--accent2)]"
          >
            <Save className="w-3.5 h-3.5 inline -mt-px mr-1" />
            Save Current
          </button>
          <button
            onClick={() => setShowSaveTemplate(true)}
            className="text-xs font-medium px-4 py-[7px] rounded-lg border border-[var(--border2)] bg-[var(--surface)] text-[var(--text2)] transition-all hover:border-[var(--text4)]"
          >
            <Bookmark className="w-3.5 h-3.5 inline -mt-px mr-1" />
            Save as Template
          </button>
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("proposals")}
            className={`text-xs font-semibold px-4 py-2 rounded-lg transition-all ${
              activeTab === "proposals"
                ? "bg-[var(--accent)] text-white"
                : "bg-[var(--surface)] text-[var(--text3)] border border-[var(--border)] hover:bg-[var(--surface2)]"
            }`}
          >
            <FileText className="w-3.5 h-3.5 inline -mt-px mr-1" />
            Saved Proposals ({proposals.length})
          </button>
          <button
            onClick={() => setActiveTab("templates")}
            className={`text-xs font-semibold px-4 py-2 rounded-lg transition-all ${
              activeTab === "templates"
                ? "bg-[var(--accent)] text-white"
                : "bg-[var(--surface)] text-[var(--text3)] border border-[var(--border)] hover:bg-[var(--surface2)]"
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 inline -mt-px mr-1" />
            Templates ({templates.length})
          </button>
        </div>

        {/* Save Template Modal */}
        {showSaveTemplate && (
          <div className="bg-[var(--surface)] border border-[var(--accent-bd)] rounded-[var(--r-lg)] p-6 shadow-[var(--sh)] mb-6">
            <h3 className="text-sm font-semibold text-[var(--text)] mb-4">
              Save Current Config as Template
            </h3>
            <div className="space-y-3">
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Template name (e.g., FP&A — Enterprise)"
                className="w-full text-xs px-4 py-[7px] rounded-lg border border-[var(--border2)] bg-[var(--bg)] text-[var(--text)] outline-none focus:border-[var(--accent)]"
                autoFocus
              />
              <input
                type="text"
                value={templateDesc}
                onChange={(e) => setTemplateDesc(e.target.value)}
                placeholder="Description (optional)"
                className="w-full text-xs px-4 py-[7px] rounded-lg border border-[var(--border2)] bg-[var(--bg)] text-[var(--text)] outline-none focus:border-[var(--accent)]"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveTemplate}
                  disabled={!templateName.trim()}
                  className="text-xs font-semibold px-4 py-[7px] rounded-lg bg-[var(--accent)] text-white transition-all hover:bg-[var(--accent2)] disabled:opacity-40"
                >
                  Save Template
                </button>
                <button
                  onClick={() => setShowSaveTemplate(false)}
                  className="text-xs font-medium px-4 py-[7px] rounded-lg border border-[var(--border2)] bg-[var(--surface)] text-[var(--text3)] transition-all hover:border-[var(--text4)]"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Proposals List ── */}
        {activeTab === "proposals" && (
          <div className="space-y-3">
            {/* Current (unsaved) */}
            <div className="bg-[var(--surface)] border-2 border-[var(--accent-bd)] rounded-[var(--r-lg)] p-5 shadow-[var(--sh-sm)]">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[8px] uppercase tracking-wider px-2 py-[2px] rounded-full bg-[var(--accent)]/10 text-[var(--accent)] font-semibold">
                      Current
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-[var(--text)]">
                    {currentProposalName}
                  </h3>
                  <p className="text-[11px] text-[var(--text4)] mt-1">
                    {state.questions.length} questions &middot;{" "}
                    {getCompletionPercent(state.questions)}% complete
                  </p>
                </div>
                <button
                  onClick={() => dispatch({ type: "SET_VIEW", view: "studio" })}
                  className="text-xs font-medium px-3 py-[6px] rounded-lg bg-[var(--accent)] text-white transition-all hover:bg-[var(--accent2)]"
                >
                  <FolderOpen className="w-3.5 h-3.5 inline -mt-px mr-1" />
                  Open
                </button>
              </div>
            </div>

            {proposals.length === 0 ? (
              <div className="text-center py-8 text-[var(--text4)] text-sm">
                No saved proposals yet. Click &ldquo;Save Current&rdquo; to save your work.
              </div>
            ) : (
              proposals.map((p) => (
                <div
                  key={p.id}
                  className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--r-lg)] p-5 shadow-[var(--sh-sm)] hover:shadow-[var(--sh)] transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-[var(--text)]">
                        {p.name}
                      </h3>
                      <p className="text-[11px] text-[var(--text4)] mt-1">
                        {p.questions.length} questions &middot;{" "}
                        {p.completionPercent}% complete
                      </p>
                      <div className="flex items-center gap-3 mt-2 font-mono text-[9px] text-[var(--text4)]">
                        <span>
                          <Clock className="w-3 h-3 inline -mt-px mr-0.5" />
                          {new Date(p.updatedAt).toLocaleDateString()}
                        </span>
                        {p.completionPercent === 100 && (
                          <span className="text-[var(--pos)]">
                            <CheckCircle2 className="w-3 h-3 inline -mt-px mr-0.5" />
                            Complete
                          </span>
                        )}
                      </div>
                      {/* Progress bar */}
                      <div className="mt-2 h-1 w-40 bg-[var(--surface3)] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[var(--accent)] rounded-full transition-all"
                          style={{ width: `${p.completionPercent}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleLoadProposal(p)}
                        className="text-xs font-medium px-3 py-[6px] rounded-lg border border-[var(--border2)] bg-[var(--surface)] text-[var(--text2)] transition-all hover:border-[var(--accent)] hover:text-[var(--accent)]"
                      >
                        <FolderOpen className="w-3.5 h-3.5 inline -mt-px mr-1" />
                        Load
                      </button>
                      <button
                        onClick={() => handleDeleteProposal(p.id)}
                        className="text-xs font-medium px-3 py-[6px] rounded-lg border border-[var(--border2)] bg-[var(--surface)] text-[var(--text4)] transition-all hover:border-[var(--neg)] hover:text-[var(--neg)]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── Templates List ── */}
        {activeTab === "templates" && (
          <div className="grid grid-cols-2 gap-4">
            {templates.map((t) => (
              <div
                key={t.id}
                className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--r-lg)] p-5 shadow-[var(--sh-sm)] hover:shadow-[var(--sh)] transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-sm font-semibold text-[var(--text)]">
                    {t.name}
                  </h3>
                  {!t.id.startsWith("tpl-") || t.id.includes("-") ? (
                    <button
                      onClick={() => handleDeleteTemplate(t.id)}
                      className="text-[var(--text4)] hover:text-[var(--neg)] transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  ) : null}
                </div>
                <p className="text-[11px] text-[var(--text3)] leading-[1.5] mb-3">
                  {t.description}
                </p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {t.detectedModules.map((m) => (
                    <span
                      key={m}
                      className="font-mono text-[8px] px-2 py-[2px] rounded-full bg-[var(--accent-pale)] text-[var(--accent)] font-semibold uppercase"
                    >
                      {m}
                    </span>
                  ))}
                  {t.clarificationAnswers["eng-duration"] && (
                    <span className="font-mono text-[8px] px-2 py-[2px] rounded-full bg-[var(--surface2)] text-[var(--text3)]">
                      {t.clarificationAnswers["eng-duration"]}w
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleApplyTemplate(t)}
                  className="w-full text-xs font-semibold px-4 py-[7px] rounded-lg bg-[var(--accent)] text-white transition-all hover:bg-[var(--accent2)]"
                >
                  <Copy className="w-3.5 h-3.5 inline -mt-px mr-1" />
                  Apply Template
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
