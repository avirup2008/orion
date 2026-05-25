"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  ClipboardList,
  UserPlus,
  Download,
  RefreshCw,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
} from "lucide-react";
import type { RfpQuestion } from "@/types";
import {
  detectHumanTasks,
  saveTaskBoard,
  loadTaskBoard,
  getTaskStats,
  exportTasksMarkdown,
} from "@/lib/human-tasks";
import type { HumanTask, TaskBoard, TaskStatus, TaskPriority } from "@/lib/human-tasks";

// ── Props ──

interface HumanTasksPanelProps {
  questions: RfpQuestion[];
  clientName: string;
}

// ── Priority color mapping ──

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  critical: "var(--neg)",
  high: "var(--warn)",
  medium: "#5D7FA3",
  low: "var(--text4)",
};

// ── Category pill styling ──

const CATEGORY_STYLES: Record<
  HumanTask["category"],
  { bg: string; text: string; label: string }
> = {
  signature: { bg: "rgba(178,107,88,0.12)", text: "#B26B58", label: "Signature" },
  reference: { bg: "rgba(176,149,88,0.12)", text: "#B09558", label: "Reference" },
  legal: { bg: "rgba(178,107,88,0.12)", text: "#B26B58", label: "Legal" },
  "site-visit": { bg: "rgba(122,148,97,0.12)", text: "#7A9461", label: "Site Visit" },
  demo: { bg: "rgba(123,111,171,0.12)", text: "#7B6FAB", label: "Demo" },
  "pricing-approval": { bg: "rgba(166,132,88,0.12)", text: "#A68458", label: "Pricing" },
  document: { bg: "rgba(93,127,163,0.12)", text: "#5D7FA3", label: "Document" },
  other: { bg: "rgba(128,128,128,0.10)", text: "var(--text3)", label: "Other" },
};

// ── Status config ──

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "in-progress", label: "In Progress" },
  { value: "done", label: "Done" },
  { value: "blocked", label: "Blocked" },
];

// ── Helpers ──

function extractQuestionNumber(task: HumanTask, questions: RfpQuestion[]): number | null {
  if (!task.sourceQuestionId) return null;
  const q = questions.find((q) => q.id === task.sourceQuestionId);
  return q?.number ?? null;
}

// ── Component ──

export default function HumanTasksPanel({ questions, clientName }: HumanTasksPanelProps) {
  const [tasks, setTasks] = useState<HumanTask[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [copiedToast, setCopiedToast] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const initializedRef = useRef(false);

  // ── Persist helper ──
  const persistTasks = useCallback(
    (updatedTasks: HumanTask[]) => {
      const board: TaskBoard = {
        tasks: updatedTasks,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      saveTaskBoard(clientName, board);
    },
    [clientName],
  );

  // ── Initialize on mount ──
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const existing = loadTaskBoard(clientName);
    if (existing && existing.tasks.length > 0) {
      setTasks(existing.tasks);
    } else if (questions.length > 0) {
      const detected = detectHumanTasks(questions, clientName);
      setTasks(detected);
      if (detected.length > 0) {
        const board: TaskBoard = {
          tasks: detected,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        saveTaskBoard(clientName, board);
      }
    }
  }, [questions, clientName]);

  // ── Re-detect (merge) ──
  const handleDetect = useCallback(() => {
    setIsDetecting(true);
    const freshTasks = detectHumanTasks(questions, clientName);

    setTasks((prev) => {
      // Build a set of existing task keys (sourceQuestionId + category) for dedup
      const existingKeys = new Set(
        prev.map((t) => `${t.sourceQuestionId ?? ""}::${t.category}`),
      );

      const newTasks = freshTasks.filter(
        (t) => !existingKeys.has(`${t.sourceQuestionId ?? ""}::${t.category}`),
      );

      const merged = [...prev, ...newTasks];
      persistTasks(merged);
      return merged;
    });

    setTimeout(() => setIsDetecting(false), 300);
  }, [questions, clientName, persistTasks]);

  // ── Update task status ──
  const handleStatusChange = useCallback(
    (taskId: string, newStatus: TaskStatus) => {
      setTasks((prev) => {
        const updated = prev.map((t) => {
          if (t.id !== taskId) return t;
          return {
            ...t,
            status: newStatus,
            completedAt: newStatus === "done" ? new Date().toISOString() : undefined,
          };
        });
        persistTasks(updated);
        return updated;
      });
    },
    [persistTasks],
  );

  // ── Update assignee ──
  const handleAssigneeChange = useCallback(
    (taskId: string, assignee: string) => {
      setTasks((prev) => {
        const updated = prev.map((t) =>
          t.id === taskId ? { ...t, assignee } : t,
        );
        persistTasks(updated);
        return updated;
      });
    },
    [persistTasks],
  );

  // ── Toggle description expand ──
  const toggleExpand = useCallback((taskId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  }, []);

  // ── Export markdown to clipboard ──
  const handleExport = useCallback(async () => {
    const md = exportTasksMarkdown(tasks, clientName);
    try {
      await navigator.clipboard.writeText(md);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2000);
    } catch {
      // Fallback: create temp textarea
      const el = document.createElement("textarea");
      el.value = md;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2000);
    }
  }, [tasks, clientName]);

  // ── Stats ──
  const stats = getTaskStats(tasks);

  // ── Render ──
  return (
    <div>
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ClipboardList size={13} className="text-[var(--accent)] shrink-0" />
          <span className="font-mono text-[9px] font-semibold uppercase tracking-[1.5px] text-[var(--text3)]">
            Human Tasks
          </span>
          {tasks.length > 0 && (
            <span className="text-[8px] font-mono font-semibold bg-[var(--accent)] text-white rounded-full px-1.5 py-[1px]">
              {tasks.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleExport}
            disabled={tasks.length === 0}
            className="relative font-mono text-[9px] px-2 py-1 rounded-md text-[var(--text4)] hover:bg-[var(--surface3)] hover:text-[var(--text2)] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            title="Copy tasks as markdown"
          >
            <Download size={11} className="inline -mt-px" />
            {copiedToast && (
              <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[8px] font-medium text-[var(--pos)] whitespace-nowrap bg-[var(--surface)] border border-[var(--border)] rounded px-1.5 py-0.5 shadow-[var(--sh-sm)]">
                Copied!
              </span>
            )}
          </button>
          <button
            onClick={handleDetect}
            disabled={isDetecting || questions.length === 0}
            className="font-mono text-[9px] px-2 py-1 rounded-md text-[var(--text4)] hover:bg-[var(--surface3)] hover:text-[var(--text2)] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            title="Re-detect tasks"
          >
            <RefreshCw
              size={11}
              className={`inline -mt-px ${isDetecting ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* ── Stats bar ── */}
      {tasks.length > 0 && (
        <div className="flex items-center gap-3 mb-3 px-1">
          <div className="flex items-center gap-1">
            <span
              className="w-[5px] h-[5px] rounded-full"
              style={{ background: "var(--warn)" }}
            />
            <span className="font-mono text-[9px] text-[var(--text4)]">
              {stats.pending}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span
              className="w-[5px] h-[5px] rounded-full"
              style={{ background: "var(--accent)" }}
            />
            <span className="font-mono text-[9px] text-[var(--text4)]">
              {stats.inProgress}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span
              className="w-[5px] h-[5px] rounded-full"
              style={{ background: "var(--pos)" }}
            />
            <span className="font-mono text-[9px] text-[var(--text4)]">
              {stats.done}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span
              className="w-[5px] h-[5px] rounded-full"
              style={{ background: "var(--neg)" }}
            />
            <span className="font-mono text-[9px] text-[var(--text4)]">
              {stats.blocked}
            </span>
          </div>
        </div>
      )}

      {/* ── Empty state ── */}
      {tasks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <div className="w-10 h-10 rounded-full bg-[var(--surface3)] flex items-center justify-center mb-3">
            <ClipboardList size={18} className="text-[var(--text4)]" />
          </div>
          <div className="text-[11px] text-[var(--text4)] leading-relaxed max-w-[220px]">
            No manual tasks detected. Your RFP questions don&apos;t appear to require signatures, references, demos, or other human-only actions.
          </div>
        </div>
      )}

      {/* ── Task list ── */}
      {tasks.length > 0 && (
        <div className="space-y-2">
          {tasks.map((task) => {
            const qNum = extractQuestionNumber(task, questions);
            const isExpanded = expandedIds.has(task.id);
            const catStyle = CATEGORY_STYLES[task.category];
            const priorityColor = PRIORITY_COLORS[task.priority];

            return (
              <div
                key={task.id}
                className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-3 mb-0 shadow-[var(--sh-sm)] flex gap-0 overflow-hidden relative"
              >
                {/* Priority color bar */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-lg"
                  style={{ background: priorityColor }}
                />

                {/* Task content */}
                <div className="pl-2 flex-1 min-w-0">
                  {/* Top row: status + title */}
                  <div className="flex items-start gap-2 mb-1.5">
                    <select
                      value={task.status}
                      onChange={(e) =>
                        handleStatusChange(task.id, e.target.value as TaskStatus)
                      }
                      className="shrink-0 text-[10px] font-mono bg-transparent border-none outline-none cursor-pointer text-[var(--text3)] py-0 -ml-0.5"
                      style={{ WebkitAppearance: "none", MozAppearance: "none", appearance: "none", paddingRight: "2px" }}
                      title="Change status"
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {statusIcon(opt.value)} {opt.label}
                        </option>
                      ))}
                    </select>
                    <StatusIndicator status={task.status} />
                  </div>

                  {/* Title */}
                  <div className="text-xs font-semibold text-[var(--text)] leading-tight mb-1">
                    {task.title}
                  </div>

                  {/* Category pill + question ref */}
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span
                      className="text-[9px] font-medium rounded-full px-2 py-[1px]"
                      style={{
                        background: catStyle.bg,
                        color: catStyle.text,
                      }}
                    >
                      {catStyle.label}
                    </span>
                    {qNum !== null && (
                      <span className="font-mono text-[9px] text-[var(--text4)]">
                        Q{qNum}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <div
                    onClick={() => toggleExpand(task.id)}
                    className={`text-[11px] text-[var(--text3)] leading-[1.5] cursor-pointer ${
                      isExpanded ? "" : "line-clamp-2"
                    }`}
                  >
                    {task.description}
                  </div>

                  {/* Assignee */}
                  <div className="flex items-center gap-1 mt-2">
                    <UserPlus size={10} className="text-[var(--text4)] shrink-0" />
                    <input
                      type="text"
                      value={task.assignee}
                      onChange={(e) => handleAssigneeChange(task.id, e.target.value)}
                      placeholder="Assign to..."
                      className="text-xs bg-transparent border-none outline-none text-[var(--text2)] placeholder:text-[var(--text4)] w-full focus:border-b focus:border-[var(--accent-bd)] transition-all py-0"
                      style={{ borderBottom: "1px solid transparent" }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderBottomColor = "var(--accent-bd)";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderBottomColor = "transparent";
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Status icon sub-component ──

function StatusIndicator({ status }: { status: TaskStatus }) {
  switch (status) {
    case "pending":
      return <Clock size={11} className="text-[var(--warn)] shrink-0" />;
    case "in-progress":
      return <AlertCircle size={11} className="text-[var(--accent)] shrink-0" />;
    case "done":
      return <CheckCircle2 size={11} className="text-[var(--pos)] shrink-0" />;
    case "blocked":
      return <XCircle size={11} className="text-[var(--neg)] shrink-0" />;
  }
}

// ── Status text for select options ──

function statusIcon(status: TaskStatus): string {
  switch (status) {
    case "pending":
      return "○"; // circle
    case "in-progress":
      return "◔"; // half circle
    case "done":
      return "●"; // filled circle
    case "blocked":
      return "✕"; // x
  }
}
