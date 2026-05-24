/**
 * Agent prompt builders for Claude API response generation.
 * Ported from artifact Section 3B with adaptations for Orion's
 * Next.js architecture and clarification flow data model.
 */

import { ANAPLAN_KB, EYEON_PROFILE } from "@/data/knowledge-base";
import type { QuestionCategory } from "@/types";

// ── Types ──

export interface GenerateRequest {
  questionId: string;
  questionText: string;
  category: QuestionCategory;
  priority: "high" | "medium" | "low";
  client: {
    companyName: string;
    industry: string;
    size: string;
    painPoints: string;
  };
  clarification: {
    detectedModules: string[];
    answers: Record<string, string>; // clarification question id -> answer
  };
}

// ── Module helpers ──

type AnaplanModuleKey = keyof typeof ANAPLAN_KB.platform.modules;

function getModuleData(key: string) {
  const k = key as AnaplanModuleKey;
  return ANAPLAN_KB.platform.modules[k] ?? ANAPLAN_KB.platform.modules.custom;
}

// ── System prompt builder ──

export function buildSystemPrompt(req: GenerateRequest): string {
  const modules = req.clarification.detectedModules.length > 0
    ? req.clarification.detectedModules
    : ["fpa"];

  // Module details
  const moduleDetails = modules.map((m) => {
    const mod = getModuleData(m);
    return `### ${mod.name} (${mod.shortName})
Capabilities:
${mod.capabilities.slice(0, 5).map((c: string) => `- ${c.split(",")[0]}`).join("\n")}
Typical duration: ${mod.typicalDuration.min}-${mod.typicalDuration.max} weeks
Key integrations: ${mod.commonIntegrations.join(", ")}`;
  }).join("\n\n");

  // Methodology
  const methodology = `## Anaplan Way Methodology
Phases: ${ANAPLAN_KB.methodology.anaplanWay.phases.map((p: { name: string; description: string }) => `${p.name} (${p.description.split(".")[0]})`).join(" -> ")}

## Four Cornerstones
${Object.entries(ANAPLAN_KB.methodology.fourCornerstones).map(([, v]) => `- **${(v as { name: string }).name}**: ${(v as { description: string }).description.split(".")[0]}`).join("\n")}

## PLANS Standard
${Object.entries(ANAPLAN_KB.methodology.plansStandard).slice(0, 4).map(([, v]) => `- **${(v as { name: string }).name}**: ${(v as { description: string }).description.split(".")[0]}`).join("\n")}`;

  // Competitive positioning
  const competitive = `## Competitive Differentiators (vs Big 4)
${ANAPLAN_KB.competitive.vsBig4.differentiators.slice(0, 4).map((d: { point: string; detail: string }) => `- **${d.point}**: ${d.detail.split(".")[0]}`).join("\n")}

## Proof Points
${(ANAPLAN_KB.competitive.vsOtherPartners.proofPoints as readonly string[]).slice(0, 4).join("\n")}`;

  // Client context
  const clientContext = req.client.companyName
    ? `## Client Context
- Company: ${req.client.companyName || "Not specified"}
- Industry: ${req.client.industry || "Not specified"}
- Size: ${req.client.size || "Not specified"}
- Pain Points: ${req.client.painPoints || "Not specified"}`
    : "";

  // Rate card from clarification answers
  const rateAnswers = Object.entries(req.clarification.answers)
    .filter(([k]) => k.startsWith("rate-"))
    .map(([k, v]) => {
      const role = k.replace("rate-", "").replace(/-/g, " ");
      return `- ${role}: EUR ${v}/day`;
    });
  const rateInfo = rateAnswers.length > 0
    ? `## Rate Card\n${rateAnswers.join("\n")}`
    : "";

  // Engagement assumptions from clarification
  const engagementAnswers = Object.entries(req.clarification.answers)
    .filter(([k]) => k.startsWith("eng-"))
    .map(([k, v]) => {
      const label = k.replace("eng-", "").replace(/-/g, " ");
      return `- ${label}: ${v}`;
    });
  const engagementInfo = engagementAnswers.length > 0
    ? `## Engagement Configuration\n${engagementAnswers.join("\n")}`
    : "";

  // EyeOn profile
  const eyeonContext = `## About EyeOn (the Responding Firm)
- Name: ${EYEON_PROFILE.fullName}
- Headquarters: ${EYEON_PROFILE.headquarters}
- Anaplan Partnership: ${EYEON_PROFILE.anaplanPartnerTier}
- Team Size: ${EYEON_PROFILE.teamSize}
- Key Clients: ${EYEON_PROFILE.keyClients.slice(0, 5).join(", ")}
- Specialization: ${EYEON_PROFILE.specialization}
- Differentiators: ${EYEON_PROFILE.differentiators.slice(0, 3).join("; ")}`;

  // Industry metrics
  const industryMetrics = Object.entries(ANAPLAN_KB.metrics.roi.byIndustry)
    .slice(0, 3)
    .map(([ind, metrics]) =>
      `### ${ind}\n${(metrics as readonly string[]).slice(0, 3).map((m: string) => `- ${m}`).join("\n")}`
    ).join("\n\n");

  return `You are an expert Anaplan implementation consultant at EyeOn writing RFP (Request for Proposal) responses. You write professional, unique, client-tailored proposal content that a consulting partner can submit directly.

## Core Rules
1. Every response must be UNIQUE to the client context — never use generic boilerplate
2. Reference the client's specific industry, pain points, and requirements throughout
3. Include concrete metrics, timelines, and deliverables wherever possible
4. Write in confident, professional proposal tone — first-person plural ("we", "our team")
5. Provide standard responses: 250-400 words. Balance detail with readability.
6. Use markdown formatting: **bold** for emphasis, bullet points for lists, headers for structure
7. Never fabricate specific dollar amounts or dates that aren't in the client context
8. Reference Anaplan-specific concepts naturally (PLANS standard, Anaplan Way, connected planning, driver-based models)
9. Position EyeOn's specific strengths (Platinum Partner, ETO App, deep European enterprise experience)

## Anaplan Platform Knowledge
${moduleDetails}

${methodology}

${competitive}

${eyeonContext}

${clientContext}

${engagementInfo}

${rateInfo}

## Industry Metrics (for reference)
${industryMetrics}`;
}

// ── Per-question prompt builder ──

const SECTION_GUIDANCE: Record<QuestionCategory, string> = {
  technical: "Focus on architecture, integrations, security, scalability, and technical capabilities of Anaplan. Reference specific APIs, data connectors, and infrastructure details. Mention SOC 2, GDPR, AES-256 encryption where relevant.",
  functional: "Focus on business capabilities, features, workflows, and how Anaplan solves specific functional requirements. Reference module-specific features, driver-based planning, and connected planning benefits.",
  methodology: "Focus on implementation approach, project phases, governance, risk management, and delivery methodology. Reference Anaplan Way phases and deliverables. Describe sprint cadence, governance structures, and knowledge transfer.",
  team: "Focus on team composition, certifications, experience, and why EyeOn is uniquely qualified. Reference specific roles (Solution Architect, Model Builder, PM, Change Manager) and their contributions. Highlight Platinum Partner status.",
  pricing: "Focus on value proposition, cost optimization approach, investment protection, and commercial model advantages. Do NOT include specific dollar amounts unless provided in context. Emphasize ROI and total cost of ownership.",
  references: "Focus on past success stories, proof points, measurable outcomes, and industry-specific track record. Reference concrete metrics from similar deployments. Highlight EyeOn's key client base.",
};

export function buildQuestionPrompt(req: GenerateRequest): string {
  const guidance = SECTION_GUIDANCE[req.category] || SECTION_GUIDANCE.functional;

  const moduleContext = req.clarification.detectedModules.length > 0
    ? `\nRelevant Anaplan modules: ${req.clarification.detectedModules.map((m) => getModuleData(m).shortName).join(", ")}`
    : "";

  // Gather module-specific clarification answers
  const moduleAnswers = Object.entries(req.clarification.answers)
    .filter(([k]) => k.startsWith("mod-"))
    .map(([k, v]) => `${k.replace("mod-", "").replace(/-/g, " ")}: ${v}`)
    .join("; ");

  return `## RFP Question
Section: ${req.category.toUpperCase()}
Priority: ${req.priority}
Question: "${req.questionText}"

## Writing Guidance
${guidance}
${moduleContext}
${moduleAnswers ? `\n## Additional Context from Client Clarification\n${moduleAnswers}` : ""}

Write a professional RFP response to this question. Tailor it specifically to ${req.client.companyName || "the client"}${req.client.industry ? ` in the ${req.client.industry} industry` : ""}. Make it unique and substantive — this must read like it was written specifically for this client, not pulled from a template library.`;
}
