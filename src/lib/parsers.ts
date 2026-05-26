/**
 * Question parsing and categorization utilities.
 * Ported from artifact/rfp-responder.tsx Section 3 (lines 552-703).
 */

import type { QuestionCategory, RfpQuestion } from "@/types";

// ── Category keyword map ──

const CATEGORY_KEYWORDS: Record<QuestionCategory, string[]> = {
  technical: [
    "integration", "api", "architecture", "scalability", "performance", "security",
    "data", "system", "platform", "infrastructure", "cloud", "database", "sso",
    "encryption", "uptime", "sla", "backup", "disaster recovery", "compliance",
    "gdpr", "soc", "audit", "authentication", "authorization", "hosting",
  ],
  functional: [
    "feature", "capability", "functionality", "module", "workflow", "report",
    "dashboard", "model", "forecast", "planning", "budget", "scenario",
    "analysis", "calculation", "formula", "driver", "kpi", "metric",
    "user interface", "usability", "customization", "configuration",
  ],
  methodology: [
    "approach", "methodology", "process", "phase", "implementation", "deploy",
    "timeline", "milestone", "agile", "sprint", "waterfall", "discovery",
    "design", "build", "test", "uat", "go-live", "hypercare", "change management",
    "risk", "mitigation", "governance", "project plan", "deliverable",
  ],
  team: [
    "team", "resource", "role", "experience", "qualification", "certification",
    "consultant", "architect", "developer", "manager", "analyst", "dedicated",
    "onshore", "offshore", "availability", "resume", "cv", "bio", "staff",
    "subcontract", "partner", "fte", "allocation",
  ],
  pricing: [
    "price", "pricing", "cost", "rate", "fee", "budget", "license", "subscription",
    "total cost", "payment", "invoice", "discount", "commercial", "proposal",
    "fixed price", "time and materials", "t&m", "estimate", "quote",
    "travel", "expense", "warranty", "maintenance",
  ],
  references: [
    "reference", "case study", "client", "similar project", "past performance",
    "testimonial", "proof", "example", "portfolio", "track record",
    "industry experience", "comparable", "success story", "outcome",
  ],
};

// ── Core functions ──

function generateQuestionId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
  }
}

export function categorizeQuestion(text: string): QuestionCategory {
  const lower = text.toLowerCase();
  const scores: Record<QuestionCategory, number> = {
    technical: 0, functional: 0, methodology: 0,
    team: 0, pricing: 0, references: 0,
  };

  for (const [section, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lower.includes(keyword)) {
        scores[section as QuestionCategory] += keyword.includes(" ") ? 2 : 1;
      }
    }
  }

  const maxScore = Math.max(...Object.values(scores));
  if (maxScore === 0) return "functional"; // default
  return Object.entries(scores).find(([, s]) => s === maxScore)![0] as QuestionCategory;
}

export function makeQuestion(text: string, number: number): RfpQuestion {
  return {
    id: generateQuestionId(),
    number,
    text: text.trim(),
    category: categorizeQuestion(text),
    status: "queued",
    priority: "medium",
  };
}

// ── Text parsing ──

export function parseTextToQuestions(text: string): RfpQuestion[] {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return [];

  const numberedPattern = /^\s*\d+[.)]\s*/;
  const bulletPattern = /^\s*[-*•]\s*/;

  const numberedCount = lines.filter((l) => numberedPattern.test(l)).length;
  const bulletCount = lines.filter((l) => bulletPattern.test(l)).length;

  let cleaned: string[];

  if (numberedCount > lines.length * 0.5) {
    cleaned = lines
      .filter((l) => numberedPattern.test(l))
      .map((l) => l.replace(numberedPattern, "").trim())
      .filter((l) => l.length > 0);
  } else if (bulletCount > lines.length * 0.5) {
    cleaned = lines
      .filter((l) => bulletPattern.test(l))
      .map((l) => l.replace(bulletPattern, "").trim())
      .filter((l) => l.length > 0);
  } else {
    cleaned = lines;
  }

  return cleaned.map((t, i) => makeQuestion(t, i + 1));
}

// ── Excel/CSV parsing ──

export function detectQuestionColumn(headers: string[]): string {
  const questionKeywords = ["question", "requirement", "ask", "query", "description", "item"];
  const lower = headers.map((h) => h.toLowerCase());
  for (const kw of questionKeywords) {
    const idx = lower.findIndex((h) => h.includes(kw));
    if (idx >= 0) return headers[idx];
  }
  return headers[0];
}

export function parseExcelToQuestions(
  data: Record<string, unknown>[],
  headers: string[]
): RfpQuestion[] {
  const questionCol = detectQuestionColumn(headers);
  return data
    .filter((row) => row[questionCol] && String(row[questionCol]).trim().length > 0)
    .map((row, i) => makeQuestion(String(row[questionCol]), i + 1));
}

// ── Deduplication ──

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

function similarity(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  return maxLen === 0 ? 1 : 1 - levenshtein(a.toLowerCase(), b.toLowerCase()) / maxLen;
}

export function deduplicateQuestions(
  existing: RfpQuestion[],
  incoming: RfpQuestion[],
  threshold = 0.85
): RfpQuestion[] {
  return incoming.filter(
    (inc) => !existing.some((ex) => similarity(ex.text, inc.text) > threshold)
  );
}

// ── PDF text extraction (server-side via API route) ──

export async function extractTextFromPdf(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/parse/pdf", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "PDF parsing failed" }));
    throw new Error(err.error || `PDF parsing failed (${res.status})`);
  }

  const { text } = await res.json();
  return text;
}

// ── Excel/CSV file reading ──

export async function readExcelFile(
  file: File
): Promise<{ data: Record<string, unknown>[]; headers: string[] }> {
  const XLSX = await import("xlsx");
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: "array" });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet);
  const headers = jsonData.length > 0 ? Object.keys(jsonData[0]) : [];
  return { data: jsonData, headers };
}
