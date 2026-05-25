/**
 * Human Task Assignment system for Orion RFP Responder.
 * Auto-detects tasks requiring human intervention from RFP questions
 * and generates an assignable task checklist with persistence and export.
 */

import type { RfpQuestion } from "@/types";

// ── Types ──

export type TaskPriority = "critical" | "high" | "medium" | "low";
export type TaskStatus = "pending" | "in-progress" | "done" | "blocked";

export interface HumanTask {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  assignee: string;
  dueDate: string;
  category:
    | "signature"
    | "reference"
    | "legal"
    | "site-visit"
    | "demo"
    | "pricing-approval"
    | "document"
    | "other";
  sourceQuestionId?: string;
  sourceQuestionText?: string;
  notes: string;
  createdAt: string;
  completedAt?: string;
}

export interface TaskBoard {
  tasks: HumanTask[];
  createdAt: string;
  updatedAt: string;
}

// ── Detection Rules ──

interface DetectionRule {
  category: HumanTask["category"];
  /** Regex patterns tested against the lowercased question text */
  patterns: RegExp[];
  title: string;
  description: string;
  priority: TaskPriority;
}

const DETECTION_RULES: DetectionRule[] = [
  {
    category: "signature",
    patterns: [
      /\bsignature\b/,
      /\bnotariz(?:e|ed|ation)\b/,
      /\b(?:must|need to|required to)\s+sign\b/,
      /\bsigned\s+(?:by|copy|letter|statement|document)\b/,
      /\battest(?:ation|ed)?\b/,
      /\bcertif(?:y|ied|ication)\b/,
      /\bexecut(?:e|ed)\s+(?:the\s+)?(?:agreement|contract|document)\b/,
    ],
    title: "Obtain required signature",
    description:
      "This question requires a physical or digital signature from an authorized representative. " +
      "AI cannot sign documents — a designated signer must review and execute the relevant paperwork.",
    priority: "critical",
  },
  {
    category: "reference",
    patterns: [
      /\breference(?:s)?\b(?!.*(?:architecture|model|document))/,
      /\breferral(?:s)?\b/,
      /\bpast\s+client(?:s)?\b/,
      /\bclient\s+contact(?:s)?\b/,
      /\breference\s+(?:letter|check|contact|list)\b/,
      /\bprovide\s+(?:a\s+)?(?:customer|client)\s+reference\b/,
    ],
    title: "Arrange client references",
    description:
      "This question asks for references from past clients or projects. " +
      "You need to contact previous clients, obtain their permission to be listed as references, " +
      "and confirm their availability for follow-up calls.",
    priority: "high",
  },
  {
    category: "legal",
    patterns: [
      /\blegal\s+(?:review|compliance|requirement|obligation|department)\b/,
      /\bcompliance\s+(?:with|requirement|certification|standard|audit)\b/,
      /\bliabilit(?:y|ies)\b/,
      /\binsurance\s+(?:certificate|coverage|policy|proof)\b/,
      /\b(?:performance|bid|surety)\s+bond\b/,
      /\bwarrant(?:y|ies)\b/,
      /\bindemnif(?:y|ication|ied)\b/,
      /\blimitation\s+of\s+liability\b/,
      /\bnon-?disclosure\b/,
      /\bterms\s+and\s+conditions\b/,
    ],
    title: "Coordinate legal review",
    description:
      "This question involves legal, compliance, or contractual matters that must be reviewed " +
      "by your legal team or counsel. AI cannot make legally binding commitments — " +
      "ensure appropriate review and approval before responding.",
    priority: "critical",
  },
  {
    category: "site-visit",
    patterns: [
      /\bsite\s+visit\b/,
      /\bon-?site\s+(?:assessment|visit|inspection|review|meeting|presence)\b/,
      /\bfacilit(?:y|ies)\s+(?:tour|visit|inspection|access)\b/,
      /\bphysical\s+(?:access|inspection|presence)\b/,
      /\bvisit\s+(?:our|the|client)\s+(?:office|site|location|premises)\b/,
    ],
    title: "Schedule site visit",
    description:
      "This question requires an in-person site visit or facility tour. " +
      "Coordinate logistics including travel, scheduling with the client, " +
      "and designating which team members will attend.",
    priority: "high",
  },
  {
    category: "demo",
    patterns: [
      /\bdemo(?:nstration)?\b/,
      /\bproof\s+of\s+concept\b/,
      /\b(?:POC)\b/,
      /\bpilot\s+(?:program|project|phase|implementation)\b/,
      /\blive\s+(?:demo|presentation|walkthrough)\b/,
      /\bsandbox\s+(?:environment|demo)\b/,
    ],
    title: "Prepare demonstration or POC",
    description:
      "This question requires a live demonstration, proof of concept, or pilot. " +
      "A team member needs to build or configure a demo environment, " +
      "prepare walkthrough materials, and schedule the presentation with the client.",
    priority: "high",
  },
  {
    category: "pricing-approval",
    patterns: [
      /\b(?:pricing|cost|budget|quote|fee)\s+(?:approval|sign-?off|authorization)\b/,
      /\bapprov(?:e|al|ed)\s+(?:the\s+)?(?:pricing|cost|budget|quote|fee)\b/,
      /\bsign-?off\s+(?:on\s+)?(?:pricing|cost|budget|quote|fee)\b/,
      /\bfinancial\s+approval\b/,
      /\brate\s+(?:card\s+)?approval\b/,
    ],
    title: "Obtain pricing approval",
    description:
      "This question involves pricing that requires management or finance approval. " +
      "Ensure the proposed rates, discounts, or total project cost are reviewed and " +
      "signed off by the appropriate authority before submission.",
    priority: "critical",
  },
  {
    category: "document",
    patterns: [
      /\bcertificate\s+of\s+(?:insurance|incorporation|compliance|good\s+standing)\b/,
      /\b(?:provide|attach|include|submit)\s+(?:a\s+)?(?:copy|proof)\s+of\b/,
      /\b(?:documentation|evidence|proof)\s+(?:of|that)\b/,
      /\bappendix\s+(?:required|attached|included|should\s+contain)\b/,
      /\bsupporting\s+document(?:s|ation)?\b/,
      /\battach(?:ed)?\s+(?:the\s+)?(?:required|relevant|supporting)\b/,
      /\b(?:W-?9|tax\s+ID|EIN|DUNS)\b/,
    ],
    title: "Gather required documentation",
    description:
      "This question requires specific documents, certificates, or supporting evidence " +
      "that must be sourced from your organization. Locate the relevant files, " +
      "verify they are current, and prepare them for inclusion in the proposal.",
    priority: "medium",
  },
];

// ── Utility ──

export function createTaskId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `task-${timestamp}-${random}`;
}

// ── Core Detection ──

export function detectHumanTasks(
  questions: RfpQuestion[],
  clientName: string,
): HumanTask[] {
  const now = new Date().toISOString();
  const tasks: HumanTask[] = [];
  // Track which categories have already been generated per question
  // to avoid duplicate tasks from the same question matching multiple
  // patterns within a single category.

  for (const question of questions) {
    const text = question.text.toLowerCase();
    const matchedCategories = new Set<HumanTask["category"]>();

    for (const rule of DETECTION_RULES) {
      // Skip if this question already generated a task for this category
      if (matchedCategories.has(rule.category)) continue;

      const matched = rule.patterns.some((pattern) => pattern.test(text));
      if (!matched) continue;

      matchedCategories.add(rule.category);

      const truncatedQuestion =
        question.text.length > 120
          ? question.text.substring(0, 117) + "..."
          : question.text;

      tasks.push({
        id: createTaskId(),
        title: `${rule.title} — Q${question.number}`,
        description:
          `${rule.description}\n\n` +
          `Triggered by: "${truncatedQuestion}"\n` +
          `Client: ${clientName}`,
        priority: rule.priority,
        status: "pending",
        assignee: "",
        dueDate: "",
        category: rule.category,
        sourceQuestionId: question.id,
        sourceQuestionText: question.text,
        notes: "",
        createdAt: now,
      });
    }
  }

  // Sort: critical first, then high, medium, low
  const priorityOrder: Record<TaskPriority, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
  };

  tasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return tasks;
}

// ── Persistence ──

function storageKey(clientName: string): string {
  const sanitized = clientName.toLowerCase().replace(/[^a-z0-9]+/g, "_");
  return `orion_tasks_${sanitized}`;
}

export function saveTaskBoard(clientName: string, board: TaskBoard): void {
  if (typeof window === "undefined") return;
  try {
    const key = storageKey(clientName);
    localStorage.setItem(key, JSON.stringify(board));
  } catch {
    console.error("[human-tasks] Failed to save task board to localStorage");
  }
}

export function loadTaskBoard(clientName: string): TaskBoard | null {
  if (typeof window === "undefined") return null;
  try {
    const key = storageKey(clientName);
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as TaskBoard;
  } catch {
    console.error("[human-tasks] Failed to load task board from localStorage");
    return null;
  }
}

// ── Statistics ──

export function getTaskStats(tasks: HumanTask[]): {
  total: number;
  pending: number;
  inProgress: number;
  done: number;
  blocked: number;
  byCategory: Record<string, number>;
} {
  const stats = {
    total: tasks.length,
    pending: 0,
    inProgress: 0,
    done: 0,
    blocked: 0,
    byCategory: {} as Record<string, number>,
  };

  for (const task of tasks) {
    switch (task.status) {
      case "pending":
        stats.pending++;
        break;
      case "in-progress":
        stats.inProgress++;
        break;
      case "done":
        stats.done++;
        break;
      case "blocked":
        stats.blocked++;
        break;
    }

    stats.byCategory[task.category] =
      (stats.byCategory[task.category] ?? 0) + 1;
  }

  return stats;
}

// ── Markdown Export ──

const PRIORITY_EMOJI: Record<TaskPriority, string> = {
  critical: "!!!",
  high: "!!",
  medium: "!",
  low: "-",
};

const STATUS_MARK: Record<TaskStatus, string> = {
  pending: "[ ]",
  "in-progress": "[-]",
  done: "[x]",
  blocked: "[!]",
};

function padRight(str: string, len: number): string {
  return str.length >= len ? str.substring(0, len) : str + " ".repeat(len - str.length);
}

export function exportTasksMarkdown(
  tasks: HumanTask[],
  clientName: string,
): string {
  const now = new Date().toISOString().split("T")[0];
  const lines: string[] = [];

  lines.push(`# Human Task Checklist — ${clientName}`);
  lines.push(`Generated: ${now}`);
  lines.push("");

  // Summary
  const stats = getTaskStats(tasks);
  lines.push(`## Summary`);
  lines.push(
    `Total: ${stats.total} | Pending: ${stats.pending} | In-Progress: ${stats.inProgress} | Done: ${stats.done} | Blocked: ${stats.blocked}`,
  );
  lines.push("");

  if (tasks.length === 0) {
    lines.push("No human tasks detected.");
    return lines.join("\n");
  }

  // Table header
  lines.push(
    `| Status | Priority | Title | Assignee | Due Date | Category | Notes |`,
  );
  lines.push(
    `|--------|----------|-------|----------|----------|----------|-------|`,
  );

  for (const task of tasks) {
    const status = STATUS_MARK[task.status];
    const priority = padRight(task.priority, 8);
    const title =
      task.title.length > 50
        ? task.title.substring(0, 47) + "..."
        : task.title;
    const assignee = task.assignee || "_unassigned_";
    const dueDate = task.dueDate || "_TBD_";
    const category = task.category;
    const notes =
      task.notes.length > 40
        ? task.notes.substring(0, 37) + "..."
        : task.notes || "-";

    lines.push(
      `| ${status} | ${priority} | ${title} | ${assignee} | ${dueDate} | ${category} | ${notes} |`,
    );
  }

  lines.push("");

  // Detailed breakdown by category
  const categories = [...new Set(tasks.map((t) => t.category))];

  lines.push("## Task Details");
  lines.push("");

  for (const cat of categories) {
    const catTasks = tasks.filter((t) => t.category === cat);
    lines.push(`### ${formatCategoryLabel(cat)} (${catTasks.length})`);
    lines.push("");

    for (const task of catTasks) {
      lines.push(
        `- ${STATUS_MARK[task.status]} **${task.title}** [${task.priority}]`,
      );
      lines.push(`  - Assignee: ${task.assignee || "_unassigned_"}`);
      lines.push(`  - Due: ${task.dueDate || "_TBD_"}`);
      if (task.sourceQuestionText) {
        const preview =
          task.sourceQuestionText.length > 100
            ? task.sourceQuestionText.substring(0, 97) + "..."
            : task.sourceQuestionText;
        lines.push(`  - Source question: "${preview}"`);
      }
      if (task.notes) {
        lines.push(`  - Notes: ${task.notes}`);
      }
      lines.push("");
    }
  }

  return lines.join("\n");
}

// ── Helpers ──

function formatCategoryLabel(
  category: HumanTask["category"],
): string {
  const labels: Record<HumanTask["category"], string> = {
    signature: "Signatures & Attestations",
    reference: "Client References",
    legal: "Legal & Compliance",
    "site-visit": "Site Visits",
    demo: "Demos & POCs",
    "pricing-approval": "Pricing Approvals",
    document: "Supporting Documents",
    other: "Other Tasks",
  };
  return labels[category];
}
