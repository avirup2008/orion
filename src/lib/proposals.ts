/**
 * Multi-proposal management & templates via localStorage.
 * Handles saving/loading full proposal state and engagement templates.
 */

import type { RfpQuestion } from "@/types";
import type { ClientContext, ClarificationState } from "@/lib/store";

// ── Saved Proposal ──

export interface SavedProposal {
  id: string;
  name: string;
  client: ClientContext;
  questions: RfpQuestion[];
  clarification: ClarificationState;
  referenceDocNames: string[];
  createdAt: string;
  updatedAt: string;
  completionPercent: number;
}

// ── Engagement Template ──

export interface EngagementTemplate {
  id: string;
  name: string;
  description: string;
  client: Partial<ClientContext>;
  clarificationAnswers: Record<string, string>;
  detectedModules: string[];
  createdAt: string;
}

const PROPOSALS_KEY = "orion_proposals";
const TEMPLATES_KEY = "orion_templates";

// ── Proposals CRUD ──

export function listProposals(): SavedProposal[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(PROPOSALS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getProposal(id: string): SavedProposal | null {
  return listProposals().find((p) => p.id === id) ?? null;
}

export function saveProposal(proposal: SavedProposal): void {
  const proposals = listProposals();
  const idx = proposals.findIndex((p) => p.id === proposal.id);
  if (idx >= 0) {
    proposals[idx] = { ...proposal, updatedAt: new Date().toISOString() };
  } else {
    proposals.unshift(proposal);
  }
  localStorage.setItem(PROPOSALS_KEY, JSON.stringify(proposals));
}

export function deleteProposal(id: string): void {
  const proposals = listProposals().filter((p) => p.id !== id);
  localStorage.setItem(PROPOSALS_KEY, JSON.stringify(proposals));
}

export function createProposalId(): string {
  return `prop-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// ── Templates CRUD ──

export function listTemplates(): EngagementTemplate[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(TEMPLATES_KEY);
    return raw ? JSON.parse(raw) : getDefaultTemplates();
  } catch {
    return getDefaultTemplates();
  }
}

export function saveTemplate(template: EngagementTemplate): void {
  const templates = listTemplates();
  const idx = templates.findIndex((t) => t.id === template.id);
  if (idx >= 0) {
    templates[idx] = template;
  } else {
    templates.unshift(template);
  }
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
}

export function deleteTemplate(id: string): void {
  const templates = listTemplates().filter((t) => t.id !== id);
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
}

// ── Default Templates ──

function getDefaultTemplates(): EngagementTemplate[] {
  return [
    {
      id: "tpl-fpa-enterprise",
      name: "FP&A — Enterprise",
      description: "Standard FP&A implementation for large enterprise. 16-week engagement, full team.",
      client: { size: "Enterprise" },
      clarificationAnswers: {
        "rate-architect": "2200",
        "rate-model-builder": "1500",
        "rate-pm": "1800",
        "rate-analyst": "1200",
        "rate-change-manager": "1400",
        "eng-duration": "16",
        "eng-travel": "Monthly",
        "eng-margin": "25",
      },
      detectedModules: ["fpa"],
      createdAt: new Date().toISOString(),
    },
    {
      id: "tpl-scp-midmarket",
      name: "Supply Chain — Mid-Market",
      description: "Supply chain planning for mid-market company. 12-week engagement, lean team.",
      client: { size: "Mid-Market" },
      clarificationAnswers: {
        "rate-architect": "2000",
        "rate-model-builder": "1400",
        "rate-pm": "1600",
        "rate-analyst": "1100",
        "eng-duration": "12",
        "eng-travel": "Bi-weekly",
        "eng-margin": "20",
      },
      detectedModules: ["scp"],
      createdAt: new Date().toISOString(),
    },
    {
      id: "tpl-spm-enterprise",
      name: "Sales Performance — Enterprise",
      description: "SPM/ICM deployment for enterprise. 20-week engagement, extended team.",
      client: { size: "Enterprise" },
      clarificationAnswers: {
        "rate-architect": "2400",
        "rate-model-builder": "1600",
        "rate-pm": "1900",
        "rate-analyst": "1300",
        "rate-change-manager": "1500",
        "eng-duration": "20",
        "eng-travel": "Monthly",
        "eng-margin": "30",
      },
      detectedModules: ["spm"],
      createdAt: new Date().toISOString(),
    },
    {
      id: "tpl-multi-module",
      name: "Multi-Module Connected Planning",
      description: "FP&A + SCP connected planning. 24-week engagement, full extended team.",
      client: { size: "Enterprise" },
      clarificationAnswers: {
        "rate-architect": "2500",
        "rate-model-builder": "1600",
        "rate-pm": "2000",
        "rate-analyst": "1300",
        "rate-change-manager": "1500",
        "eng-duration": "24",
        "eng-travel": "Monthly",
        "eng-margin": "25",
      },
      detectedModules: ["fpa", "scp"],
      createdAt: new Date().toISOString(),
    },
  ];
}
