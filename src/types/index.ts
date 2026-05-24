// ── RFP Question Categories ──
export type QuestionCategory =
  | "technical"
  | "functional"
  | "methodology"
  | "team"
  | "pricing"
  | "references";

// ── Question Status ──
export type QuestionStatus =
  | "queued"
  | "generating"
  | "draft"
  | "review"
  | "final";

// ── Parsed RFP Question ──
export interface RfpQuestion {
  id: string;
  number: number;
  text: string;
  category: QuestionCategory;
  status: QuestionStatus;
  priority: "high" | "medium" | "low";
  weight?: number;
  maxWords?: number;
  response?: GeneratedResponse;
}

// ── Generated Response ──
export interface GeneratedResponse {
  content: string;
  wordCount: number;
  qualityScore?: number;
  generatedAt: string;
  kbSourcesUsed: string[];
}

// ── Section Summary ──
export interface SectionSummary {
  category: QuestionCategory;
  total: number;
  completed: number;
  color: string;
}

// ── Knowledge Base Match ──
export interface KbMatch {
  id: string;
  title: string;
  source: string;
  matchScore: number;
  preview: string;
}

// ── Past Proposal Reference ──
export interface PastProposal {
  id: string;
  title: string;
  year: number;
  outcome: "won" | "lost" | "pending";
  similarityScore: number;
  preview: string;
}

// ── Project Context ──
export interface ProposalProject {
  clientName: string;
  rfpTitle: string;
  sections: SectionSummary[];
  questions: RfpQuestion[];
  completionPercent: number;
}

// ── Costing Types ──
export type CostingMode = "blended" | "by-role";

export interface BlendedCost {
  mode: "blended";
  dailyRate: number;
  totalDays: number;
  licensing: number;
  travelExpenses: number;
  total: number;
}

export interface RoleCost {
  role: string;
  dailyRate: number;
  days: number;
  total: number;
}

export interface ByRoleCost {
  mode: "by-role";
  roles: RoleCost[];
  licensing: number;
  travelExpenses: number;
  total: number;
}

export type ProjectCost = BlendedCost | ByRoleCost;

// ── Category display helpers ──
export const CATEGORY_CONFIG: Record<
  QuestionCategory,
  { label: string; color: string; bgClass: string; borderClass: string }
> = {
  technical: {
    label: "Technical",
    color: "#7B6FAB",
    bgClass: "cat-tech",
    borderClass: "bl-tech",
  },
  functional: {
    label: "Functional",
    color: "#5D7FA3",
    bgClass: "cat-func",
    borderClass: "bl-func",
  },
  methodology: {
    label: "Methodology",
    color: "#7A9461",
    bgClass: "cat-method",
    borderClass: "bl-method",
  },
  team: {
    label: "Team",
    color: "#A68458",
    bgClass: "cat-team",
    borderClass: "bl-team",
  },
  pricing: {
    label: "Pricing",
    color: "#B26B58",
    bgClass: "cat-price",
    borderClass: "bl-price",
  },
  references: {
    label: "References",
    color: "#B09558",
    bgClass: "cat-ref",
    borderClass: "bl-ref",
  },
};
