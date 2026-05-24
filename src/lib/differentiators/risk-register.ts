/**
 * Risk & assumptions register generator.
 * Produces a structured risk register based on engagement parameters,
 * scope complexity, and costing decisions.
 */

import type { CostSummary } from "@/lib/costing";

export type Likelihood = "High" | "Medium" | "Low";
export type Impact = "High" | "Medium" | "Low";

export interface Risk {
  id: string;
  category: "Scope" | "Timeline" | "Commercial" | "Data" | "Change Management" | "Technical";
  description: string;
  likelihood: Likelihood;
  impact: Impact;
  mitigation: string;
}

export interface Assumption {
  id: string;
  category: string;
  statement: string;
}

export interface RiskRegister {
  risks: Risk[];
  assumptions: Assumption[];
}

interface RiskContext {
  detectedModules: string[];
  engagementWeeks: number;
  totalDays: number;
  marginPercent: number;
  discountPercent: number;
  teamSize: number;
  clientIndustry: string;
}

export function generateRiskRegister(
  costSummary: CostSummary,
  detectedModules: string[],
  clientIndustry: string
): RiskRegister {
  const ctx: RiskContext = {
    detectedModules,
    engagementWeeks: costSummary.totalWeeks,
    totalDays: costSummary.totalDays,
    marginPercent: costSummary.breakdown.marginPercent,
    discountPercent: costSummary.breakdown.discountPercent,
    teamSize: costSummary.rateCards.length,
    clientIndustry,
  };

  const risks: Risk[] = [];
  let riskId = 1;

  // ── Scope Risks ──
  if (detectedModules.length > 2) {
    risks.push({
      id: `R${riskId++}`,
      category: "Scope",
      description: `Multi-module implementation (${detectedModules.join(", ")}) increases integration complexity and cross-functional dependency management.`,
      likelihood: "Medium",
      impact: "High",
      mitigation: "Phased delivery approach with clear module boundaries. Each module goes through independent UAT before integration testing begins.",
    });
  }

  risks.push({
    id: `R${riskId++}`,
    category: "Scope",
    description: "Scope creep from evolving business requirements during the build phase may extend timeline and effort.",
    likelihood: "Medium",
    impact: "Medium",
    mitigation: "Formal change request process with impact assessment. Sprint-based delivery provides natural checkpoints for scope review. Design sign-off gate before build begins.",
  });

  // ── Timeline Risks ──
  const daysPerWeek = ctx.totalDays / Math.max(ctx.engagementWeeks, 1);
  if (daysPerWeek > 8) {
    risks.push({
      id: `R${riskId++}`,
      category: "Timeline",
      description: `High resource density (${daysPerWeek.toFixed(1)} person-days/week) creates scheduling pressure and reduces buffer for issue resolution.`,
      likelihood: "Medium",
      impact: "High",
      mitigation: "Staggered team ramp-up with overlapping phase transitions. Built-in buffer weeks at key milestones. Early identification of critical path activities.",
    });
  }

  if (ctx.engagementWeeks <= 8) {
    risks.push({
      id: `R${riskId++}`,
      category: "Timeline",
      description: "Compressed timeline leaves limited buffer for unexpected technical challenges or client availability constraints.",
      likelihood: "Medium",
      impact: "Medium",
      mitigation: "Pre-engagement data readiness assessment. Accelerator-based delivery to reduce build time. Dedicated client resources confirmed before kickoff.",
    });
  }

  risks.push({
    id: `R${riskId++}`,
    category: "Timeline",
    description: "Client stakeholder availability for workshops, reviews, and sign-offs may cause delays if not pre-committed.",
    likelihood: "Medium",
    impact: "Medium",
    mitigation: "Workshop calendar published at kickoff with 2-week advance scheduling. Escalation path for delayed sign-offs. Asynchronous review option for lower-priority items.",
  });

  // ── Commercial Risks ──
  if (ctx.discountPercent > 10) {
    risks.push({
      id: `R${riskId++}`,
      category: "Commercial",
      description: `Significant discount (${ctx.discountPercent}%) reduces delivery flexibility and limits ability to absorb scope changes without commercial impact.`,
      likelihood: "Low",
      impact: "High",
      mitigation: "Strict scope management with formal change request process. Any additional scope addressed via separate work orders at standard rates.",
    });
  }

  if (ctx.marginPercent < 20) {
    risks.push({
      id: `R${riskId++}`,
      category: "Commercial",
      description: `Below-target margin (${ctx.marginPercent}%) limits contingency budget for extended support or additional resources.`,
      likelihood: "Low",
      impact: "Medium",
      mitigation: "Proactive risk management to prevent overruns. Weekly effort tracking against estimates. Early warning system for budget variance > 10%.",
    });
  }

  // ── Data & Integration Risks ──
  risks.push({
    id: `R${riskId++}`,
    category: "Data",
    description: "Source data quality issues (missing fields, inconsistent formats, stale hierarchies) may require unplanned cleansing effort before model loading.",
    likelihood: "High",
    impact: "Medium",
    mitigation: "Data readiness assessment during Discovery phase. Data quality checklist provided to client 2 weeks before Build. Automated validation rules in Anaplan import actions.",
  });

  if (detectedModules.some((m) => m.includes("Supply Chain") || m.includes("SCP"))) {
    risks.push({
      id: `R${riskId++}`,
      category: "Data",
      description: "Supply chain data integration requires real-time or near-real-time feeds from ERP/WMS systems, adding integration complexity.",
      likelihood: "Medium",
      impact: "High",
      mitigation: "Integration architecture review in Discovery. API-first approach with Anaplan Integration API. Staged integration: batch first, then real-time optimization.",
    });
  }

  risks.push({
    id: `R${riskId++}`,
    category: "Technical",
    description: "Model performance degradation with large data volumes may require architectural refactoring if dimensional design is not optimized early.",
    likelihood: "Low",
    impact: "High",
    mitigation: "Performance benchmarking during Design phase. PLANS methodology ensures efficient dimensional structure. Load testing with production-scale data before UAT.",
  });

  // ── Change Management Risks ──
  risks.push({
    id: `R${riskId++}`,
    category: "Change Management",
    description: "End-user resistance to new planning processes and tool adoption may limit the realized business value of the implementation.",
    likelihood: "Medium",
    impact: "High",
    mitigation: "Structured change management program embedded in project plan. Early user involvement in design workshops. Champion network identification. Role-based training with hands-on exercises.",
  });

  risks.push({
    id: `R${riskId++}`,
    category: "Change Management",
    description: "Loss of key project sponsor or business owner during the engagement could deprioritize the initiative.",
    likelihood: "Low",
    impact: "High",
    mitigation: "Dual sponsorship model encouraged. Regular steering committee updates maintain organizational visibility. All key decisions documented to survive personnel changes.",
  });

  // ── Standard Assumptions ──
  const assumptions: Assumption[] = [
    {
      id: "A1",
      category: "Resources",
      statement: "Client will assign a dedicated project lead available for minimum 50% of their time throughout the engagement.",
    },
    {
      id: "A2",
      category: "Resources",
      statement: "Subject matter experts (SMEs) for each functional area will be available for workshops and validation within 48 hours of request.",
    },
    {
      id: "A3",
      category: "Data",
      statement: "Client will provide source data extracts in agreed formats within 5 business days of request. Data quality issues are the client's responsibility to resolve.",
    },
    {
      id: "A4",
      category: "Infrastructure",
      statement: "Anaplan workspace and required license tiers will be provisioned before the Build phase begins.",
    },
    {
      id: "A5",
      category: "Infrastructure",
      statement: "Client will provide VPN/network access for EyeOn team members to connect to relevant source systems and testing environments.",
    },
    {
      id: "A6",
      category: "Scope",
      statement: `Implementation scope is limited to the modules defined in this proposal (${detectedModules.join(", ") || "as specified"}). Additional modules or significant scope changes will be managed through the formal change request process.`,
    },
    {
      id: "A7",
      category: "Timeline",
      statement: "Project timeline assumes no extended holiday periods or organizational freeze windows during the engagement.",
    },
    {
      id: "A8",
      category: "Governance",
      statement: "Design approval sign-off will be provided within 5 business days of design document delivery. Delayed approvals will shift downstream milestones accordingly.",
    },
  ];

  return { risks, assumptions };
}

/**
 * Render risk register as formatted text for proposal documents.
 */
export function renderRiskRegisterText(register: RiskRegister): string {
  const lines: string[] = [];

  lines.push("**Risk Register**");
  lines.push("");

  for (const risk of register.risks) {
    lines.push(
      `**${risk.id}: ${risk.category}** — Likelihood: ${risk.likelihood} | Impact: ${risk.impact}`
    );
    lines.push(risk.description);
    lines.push(`*Mitigation:* ${risk.mitigation}`);
    lines.push("");
  }

  lines.push("---");
  lines.push("");
  lines.push("**Key Assumptions**");
  lines.push("");

  for (const assumption of register.assumptions) {
    lines.push(`- **${assumption.id} (${assumption.category})**: ${assumption.statement}`);
  }

  return lines.join("\n");
}
