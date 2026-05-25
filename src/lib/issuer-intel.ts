/**
 * Issuer Intelligence — data model, persistence, and prompt formatting.
 *
 * Stores per-client research produced by the /api/research route
 * and exposes a helper to inject that intelligence into system prompts
 * used by the response-generation pipeline.
 */

// ── Interfaces ──

export interface IssuerIntelligence {
  organizationProfile: string;
  likelyBudgetRange: string;
  decisionFactors: string[];
  competitorRisks: string[];
  winStrategy: string[];
  redFlags: string[];
  toneRecommendation: string;
  strengthsToEmphasize: string[];
}

export interface IssuerProfile {
  name: string;
  website: string;
  notes: string;
  industry: string;
  previousRfps: string;
}

// ── localStorage persistence ──

const STORAGE_PREFIX = "orion:issuer-intel:";

function storageKey(clientName: string): string {
  return `${STORAGE_PREFIX}${clientName.trim().toLowerCase()}`;
}

export function saveIssuerIntel(
  clientName: string,
  intel: IssuerIntelligence
): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(storageKey(clientName), JSON.stringify(intel));
  } catch {
    // Storage full or unavailable — silently degrade
  }
}

export function getIssuerIntel(
  clientName: string
): IssuerIntelligence | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(storageKey(clientName));
    if (!raw) return null;
    return JSON.parse(raw) as IssuerIntelligence;
  } catch {
    return null;
  }
}

// ── Prompt formatting ──

/**
 * Formats issuer intelligence into a block of text suitable for injection
 * into an AI system prompt so the response generator can tailor its output.
 */
export function buildIssuerPromptContext(intel: IssuerIntelligence): string {
  const sections: string[] = [];

  sections.push(`## Issuer Intelligence\n`);

  sections.push(`### Organization Profile\n${intel.organizationProfile}\n`);

  sections.push(`### Likely Budget Range\n${intel.likelyBudgetRange}\n`);

  if (intel.decisionFactors.length > 0) {
    sections.push(
      `### Key Decision Factors\n${intel.decisionFactors.map((f) => `- ${f}`).join("\n")}\n`
    );
  }

  if (intel.competitorRisks.length > 0) {
    sections.push(
      `### Competitor / Incumbent Risks\n${intel.competitorRisks.map((r) => `- ${r}`).join("\n")}\n`
    );
  }

  if (intel.winStrategy.length > 0) {
    sections.push(
      `### Recommended Win Strategy\n${intel.winStrategy.map((s) => `- ${s}`).join("\n")}\n`
    );
  }

  if (intel.redFlags.length > 0) {
    sections.push(
      `### Red Flags / Warnings\n${intel.redFlags.map((f) => `- ${f}`).join("\n")}\n`
    );
  }

  sections.push(`### Tone Recommendation\n${intel.toneRecommendation}\n`);

  if (intel.strengthsToEmphasize.length > 0) {
    sections.push(
      `### Strengths to Emphasize\n${intel.strengthsToEmphasize.map((s) => `- ${s}`).join("\n")}\n`
    );
  }

  return sections.join("\n");
}
