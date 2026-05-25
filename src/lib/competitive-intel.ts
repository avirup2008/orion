/**
 * Competitive Intelligence Detection for RFP responses.
 * Scans RFP questions for competitor mentions and provides
 * counter-positioning guidance for EyeOn/Anaplan responses.
 */

import type { RfpQuestion } from "@/types";

// ── Types ──

export interface CompetitorMention {
  competitor: string;
  product: string;
  foundIn: string;
  questionId: string;
  counterPoints: string[];
  talkingPoints: string[];
}

interface CompetitorEntry {
  /** Display name used in output */
  name: string;
  /** Specific product names associated with this competitor */
  products: string[];
  /** Case-insensitive aliases and abbreviations to detect */
  aliases: string[];
  /** Known strengths — what the competitor does well */
  strengths: string[];
  /** Known weaknesses — where the competitor falls short */
  weaknesses: string[];
  /** Counter-positioning: why EyeOn/Anaplan is the better choice */
  counterPoints: string[];
  /** Talking points: what to emphasize when this competitor appears */
  talkingPoints: string[];
}

// ── Competitor Database ──

export const COMPETITOR_DATABASE: CompetitorEntry[] = [
  {
    name: "SAP",
    products: ["SAP BPC", "SAP Analytics Cloud", "SAP SAC"],
    aliases: [
      "sap bpc",
      "sap analytics cloud",
      "sap sac",
      "sap bw",
      "business planning and consolidation",
      "sap epm",
    ],
    strengths: [
      "Deep integration with SAP ERP/S4HANA ecosystems",
      "Strong financial consolidation and statutory reporting",
      "Established brand recognition in large enterprise",
      "Embedded analytics within SAP transaction workflows",
    ],
    weaknesses: [
      "Rigid, IT-dependent model changes requiring ABAP or BW expertise",
      "Slow deployment cycles — 12-18 months typical for BPC implementations",
      "SAC planning module still maturing; lacks depth for complex FP&A",
      "High total cost of ownership with Basis/BW infrastructure",
    ],
    counterPoints: [
      "Anaplan models are business-user configurable — no ABAP developers or IT tickets needed for model changes, cutting change-request turnaround from weeks to hours",
      "Anaplan's HyperBlock engine delivers real-time calculation across billions of cells, whereas BPC relies on pre-aggregated cubes that limit ad-hoc analysis",
      "EyeOn delivers Anaplan implementations in 8-12 weeks vs. the 12-18 month timelines typical of SAP BPC, with immediate ROI through iterative go-lives",
      "Anaplan's Connected Planning links finance, supply chain, and workforce in a single platform — SAP requires separate modules (BPC, IBP, SuccessFactors) with complex integration",
    ],
    talkingPoints: [
      "Emphasize Anaplan's business-user empowerment and self-service model building — zero reliance on IT for day-to-day planning changes",
      "Highlight EyeOn's SAP migration methodology with proven data connectors that maintain SAP as the system of record while Anaplan becomes the planning layer",
      "Position speed-to-value: EyeOn's accelerators cut typical SAP-to-Anaplan migration from 6 months to 10-12 weeks",
    ],
  },
  {
    name: "Oracle",
    products: ["Oracle PBCS", "Oracle EPM Cloud", "Oracle Hyperion"],
    aliases: [
      "oracle pbcs",
      "oracle epm",
      "oracle epm cloud",
      "oracle hyperion",
      "hyperion planning",
      "hyperion financial management",
      "oracle essbase",
      "essbase",
    ],
    strengths: [
      "Mature financial consolidation (HFM/FCCS) trusted by Fortune 500",
      "Strong OLAP heritage with Essbase calculation engine",
      "Broad EPM suite covering close, consolidation, tax, and narrative reporting",
      "Deep Oracle ERP/Cloud integration for GL-level data flows",
    ],
    weaknesses: [
      "Legacy Hyperion architecture forces customers onto cloud migration with limited feature parity",
      "Steep learning curve — SmartView/Calc Manager UX is dated and developer-centric",
      "Multi-dimensional model changes require IT-managed metadata loads and rule rewrites",
      "Vendor lock-in with Oracle database requirements driving infrastructure costs",
    ],
    counterPoints: [
      "Anaplan was born in the cloud with a modern, browser-native UX — no SmartView plugins, no Java dependencies, no VPN-gated desktop tools",
      "Anaplan's in-memory HyperBlock engine eliminates the aggregation and pre-calculation constraints of Essbase cubes, enabling true real-time what-if scenarios",
      "EyeOn has migrated multiple Oracle EPM customers to Anaplan, delivering 40-60% reduction in planning cycle times through streamlined model architecture",
      "Anaplan's flat-list dimensionality and dynamic cell allocation outperform Essbase's fixed sparse/dense configurations for evolving business models",
    ],
    talkingPoints: [
      "Lead with Anaplan's modern UX and zero-install browser experience vs. Oracle's SmartView dependency",
      "Reference EyeOn's Oracle-to-Anaplan migration accelerator with pre-built data mappings for common Oracle GL structures",
      "Highlight that Anaplan's pricing is user-based and predictable — no hidden Oracle database or middleware licensing surprises",
    ],
  },
  {
    name: "OneStream",
    products: ["OneStream XF", "OneStream Software"],
    aliases: [
      "onestream",
      "onestream xf",
      "onestream software",
      "one stream",
    ],
    strengths: [
      "Unified platform for close, consolidation, planning, and reporting",
      "Strong financial consolidation with intercompany elimination engine",
      "XF MarketPlace offers downloadable pre-built solutions",
      "Good fit for complex statutory/regulatory consolidation requirements",
    ],
    weaknesses: [
      "Primarily finance-focused — weak in supply chain, workforce, and sales planning",
      "Extensibility through C# .NET business rules creates IT dependency",
      "Smaller partner ecosystem limits implementation options and talent pool",
      "Performance degrades on large operational planning models with high-concurrency users",
    ],
    counterPoints: [
      "Anaplan's Connected Planning spans finance, supply chain, sales, and workforce on a single platform — OneStream remains siloed in financial planning and consolidation",
      "Anaplan models are configured by business analysts using native formula language, not C# code — reducing IT bottlenecks and enabling faster iteration",
      "EyeOn leverages Anaplan's purpose-built planning engine that handles millions of concurrent calculations, whereas OneStream's architecture was designed for consolidation workloads and struggles with high-volume operational planning",
      "Anaplan's marketplace of pre-built apps and EyeOn's proprietary accelerators deliver faster time-to-value than OneStream's MarketPlace, which requires significant customization to fit real-world processes",
    ],
    talkingPoints: [
      "Position Anaplan as the enterprise-wide planning platform — finance, supply chain, and commercial planning connected in one model",
      "Stress EyeOn's cross-functional implementation expertise spanning FP&A, demand planning, and workforce planning — not just consolidation",
      "Highlight Anaplan's 2,000+ customer community and mature partner ecosystem vs. OneStream's narrower market presence",
    ],
  },
  {
    name: "Workday Adaptive Planning",
    products: ["Workday Adaptive Planning", "Adaptive Insights"],
    aliases: [
      "workday adaptive",
      "adaptive planning",
      "adaptive insights",
      "workday planning",
    ],
    strengths: [
      "Native integration with Workday HCM and Financials",
      "Intuitive spreadsheet-like interface lowers adoption barriers",
      "Strong in departmental budgeting and headcount planning",
      "Fast deployment for mid-market organizations",
    ],
    weaknesses: [
      "Model complexity ceiling — struggles with large, multi-dimensional operational models",
      "Limited supply chain and demand planning capabilities",
      "Calculation engine slows significantly beyond ~500K cells in a single sheet",
      "Deep customization requires OfficeConnect and workaround architectures",
    ],
    counterPoints: [
      "Anaplan's HyperBlock engine scales to billions of cells with sub-second calculation — Adaptive hits performance walls on enterprise-scale models that EyeOn's clients routinely build",
      "Anaplan supports true multi-dimensional modeling with unlimited hierarchy depth, while Adaptive's sheet-based architecture forces workarounds for complex organizational structures",
      "EyeOn builds connected models across finance, supply chain, and sales in Anaplan — Adaptive remains strongest only in departmental FP&A and HR planning",
      "Anaplan's open API ecosystem and EyeOn's integration accelerators connect to any ERP (SAP, Oracle, NetSuite, Workday) — Adaptive's deepest integrations are limited to the Workday ecosystem",
    ],
    talkingPoints: [
      "Acknowledge Adaptive's ease-of-use, then pivot to Anaplan's ability to start simple and scale to enterprise complexity without re-platforming",
      "Highlight EyeOn's implementation approach that delivers Anaplan's power with an intuitive UX through purpose-built dashboards and guided workflows",
      "Position Anaplan as the platform clients won't outgrow — EyeOn has rescued multiple Adaptive-to-Anaplan migrations when complexity outpaced the tool",
    ],
  },
  {
    name: "Board International",
    products: ["Board", "Board International"],
    aliases: [
      "board international",
      "board platform",
      "board software",
    ],
    strengths: [
      "Combined BI, planning, and predictive analytics in one toolkit",
      "Flexible drag-and-drop environment for building planning applications",
      "Embedded machine learning and simulation capabilities",
      "Strong presence in European mid-market",
    ],
    weaknesses: [
      "Limited brand recognition and analyst positioning outside Europe",
      "Smaller customer base means fewer industry-specific templates and references",
      "Hybrid on-prem/cloud architecture creates deployment complexity",
      "Planning-specific features less mature than dedicated EPM platforms",
    ],
    counterPoints: [
      "Anaplan is a Gartner Magic Quadrant Leader in Cloud Financial Planning, while Board sits in the Niche Players quadrant — analyst consensus recognizes Anaplan's enterprise maturity",
      "Anaplan's 2,000+ enterprise customers provide EyeOn with a deep reference library spanning every industry vertical, whereas Board's customer base is concentrated in European mid-market",
      "EyeOn leverages Anaplan's 100% cloud-native architecture for zero-infrastructure deployments, while Board's hybrid model introduces on-prem maintenance overhead",
      "Anaplan's dedicated planning engine and HyperBlock architecture outperform Board's general-purpose HBMP engine on complex, high-volume planning scenarios",
    ],
    talkingPoints: [
      "Lead with Anaplan's analyst recognition and enterprise customer base as proof of market-validated maturity",
      "Highlight EyeOn's global delivery capability and Anaplan's worldwide partner network vs. Board's regionally concentrated ecosystem",
      "Emphasize Anaplan's proven scalability with named enterprise references in the prospect's specific industry",
    ],
  },
  {
    name: "Pigment",
    products: ["Pigment"],
    aliases: [
      "pigment",
      "pigment app",
      "pigment planning",
    ],
    strengths: [
      "Modern, visually appealing UI with strong collaboration features",
      "Fast initial setup for standard FP&A use cases",
      "Built-in scenario comparison and versioning workflows",
      "Growing quickly among tech-sector mid-market companies",
    ],
    weaknesses: [
      "Early-stage platform — limited track record with complex enterprise deployments",
      "Narrow functional scope focused on FP&A; minimal supply chain or operational planning",
      "Small partner ecosystem means limited implementation support and talent availability",
      "Enterprise governance, audit trails, and role-based security still maturing",
    ],
    counterPoints: [
      "Anaplan has 10+ years of enterprise hardening with SOC 2 Type II, ISO 27001, and FedRAMP authorization — Pigment is an emerging player without the same depth of security certifications and enterprise governance",
      "EyeOn's Anaplan practice has delivered 200+ implementations across complex supply chain, workforce, and financial planning — Pigment's reference base is concentrated in straightforward FP&A scenarios",
      "Anaplan's calculation engine is proven at enterprise scale with customers modeling billions of data cells; Pigment's architecture is unproven at that scale with no public enterprise-scale benchmarks",
      "Anaplan's mature marketplace, 150+ pre-built connectors, and EyeOn's accelerators deliver proven time-to-value — Pigment requires custom integration development for most enterprise data sources",
    ],
    talkingPoints: [
      "Acknowledge Pigment's fresh UI, then pivot to the total cost of risk — enterprise RFPs require proven platforms with audit histories, not promising startups",
      "Emphasize EyeOn's ability to deliver modern, visually rich Anaplan dashboards (UX comparable to Pigment) while backed by enterprise-grade infrastructure",
      "Highlight the depth of Anaplan's partner ecosystem — EyeOn plus dozens of global SIs — vs. Pigment's limited implementation support",
    ],
  },
  {
    name: "Planful",
    products: ["Planful", "Host Analytics"],
    aliases: [
      "planful",
      "host analytics",
      "planful platform",
    ],
    strengths: [
      "Purpose-built for FP&A with strong financial close management",
      "Good structured planning workflows for budgeting and forecasting",
      "Pre-built financial reporting templates reduce setup time",
      "Competitive pricing for mid-market organizations",
    ],
    weaknesses: [
      "Model flexibility constrained by rigid, template-driven architecture",
      "Weak operational planning (supply chain, sales) outside core FP&A",
      "Performance limitations on large-scale, multi-entity consolidation",
      "Limited extensibility — custom calculations require vendor support",
    ],
    counterPoints: [
      "Anaplan's flexible, formula-driven modeling allows EyeOn to build any planning logic without template constraints — Planful's rigid structure breaks down when business requirements deviate from pre-built patterns",
      "EyeOn delivers connected planning across finance, supply chain, and commercial teams in Anaplan — Planful's scope stops at FP&A, forcing organizations to maintain parallel tools for operational planning",
      "Anaplan's HyperBlock engine handles multi-entity consolidation at scale with real-time intercompany eliminations, while Planful's consolidation engine struggles with complex multi-currency, multi-GAAP scenarios",
      "Anaplan's open API and EyeOn's pre-built integrations connect to any source system, while Planful's integration layer requires significant custom development outside its pre-built ERP connectors",
    ],
    talkingPoints: [
      "Position Anaplan as the platform that grows with the organization — EyeOn starts with FP&A and expands into supply chain and workforce planning without re-platforming",
      "Highlight EyeOn's model design approach that delivers Planful-level structured workflows within Anaplan's flexible architecture — best of both worlds",
      "Reference EyeOn's Planful-to-Anaplan migration experience with specific examples of unlocked planning capabilities post-migration",
    ],
  },
  {
    name: "Vena Solutions",
    products: ["Vena Solutions", "Vena"],
    aliases: [
      "vena solutions",
      "vena",
      "vena platform",
    ],
    strengths: [
      "Excel-native interface minimizes user adoption friction",
      "Strong workflow and process automation for budgeting cycles",
      "Pre-built templates aligned to common FP&A processes",
      "Competitive pricing with rapid deployment for Excel-heavy teams",
    ],
    weaknesses: [
      "Excel dependency creates version control, scalability, and governance risks",
      "Limited multi-dimensional modeling — inherits Excel's row/column constraints",
      "Weak beyond core FP&A; no supply chain, demand, or workforce planning depth",
      "Calculation performance limited by underlying Excel engine on large data sets",
    ],
    counterPoints: [
      "Anaplan replaces spreadsheet sprawl with a governed, in-memory planning platform — Vena perpetuates Excel dependency, which is often the very problem organizations seek to solve in an RFP",
      "EyeOn designs Anaplan solutions with familiar, intuitive interfaces that ease the Excel-to-Anaplan transition while delivering multi-dimensional modeling, audit trails, and real-time collaboration that Vena's Excel overlay cannot match",
      "Anaplan's HyperBlock engine calculates across millions of cells in seconds — Vena inherits Excel's calculation bottlenecks, forcing workarounds like splitting models across multiple workbooks",
      "EyeOn's Anaplan implementations include version control, granular access controls, and full audit history out of the box — capabilities that require extensive workarounds in Vena's Excel-based architecture",
    ],
    talkingPoints: [
      "Acknowledge Excel comfort, then position Anaplan as the next evolution — EyeOn helps organizations graduate from spreadsheets without losing the flexibility finance teams love",
      "Highlight governance and compliance: Anaplan's native audit trails, role-based security, and SOC 2 compliance vs. Vena's Excel-inherited control gaps",
      "Emphasize that EyeOn's Anaplan implementations frequently outperform Vena on total cost when factoring in risk reduction, eliminated manual reconciliation, and cross-functional planning enablement",
    ],
  },
  {
    name: "IBM Planning Analytics",
    products: ["IBM Planning Analytics", "Cognos TM1", "IBM PA"],
    aliases: [
      "ibm planning analytics",
      "cognos tm1",
      "tm1",
      "ibm pa",
      "planning analytics",
      "ibm cognos",
    ],
    strengths: [
      "Powerful TM1 OLAP engine for complex financial modeling",
      "Strong in-memory calculation performance on structured cubes",
      "Mature platform with decades of enterprise deployment history",
      "Flexible TurboIntegrator (TI) processes for data integration",
    ],
    weaknesses: [
      "TM1 expertise is scarce and expensive — shrinking talent pool as IBM under-invests",
      "Dated UX with PAX/PAW interfaces that lag modern cloud planning tools",
      "Cloud migration path (Planning Analytics as a Service) lacks feature parity with on-prem",
      "Rule-writing in TM1 requires specialized developers, not business analysts",
    ],
    counterPoints: [
      "Anaplan's formula language is designed for business analysts — EyeOn trains end users to modify models independently, while TM1 rules require scarce, specialized developers commanding premium rates",
      "Anaplan's cloud-native architecture delivers automatic upgrades, elastic scaling, and zero infrastructure management — IBM PA customers face painful cloud migration decisions with incomplete SaaS parity",
      "EyeOn has successfully migrated complex TM1 models to Anaplan, typically reducing total cost of ownership by 30-40% through eliminated infrastructure, reduced specialist headcount, and faster planning cycles",
      "Anaplan's modern UX, mobile access, and real-time collaboration replace TM1's aging PAX/PAW interfaces — finance teams report 50%+ improvement in user adoption post-migration",
    ],
    talkingPoints: [
      "Lead with the talent scarcity angle — TM1 developers are retiring and not being replaced, creating operational risk that Anaplan's business-user model eliminates",
      "Highlight EyeOn's TM1-to-Anaplan migration methodology with cube-to-module mapping, TI-to-integration conversion, and parallel-run validation",
      "Position the migration as risk reduction: moving from aging, under-invested IBM platform to Anaplan's actively developed, well-funded cloud platform",
    ],
  },
  {
    name: "Jedox",
    products: ["Jedox"],
    aliases: [
      "jedox",
      "jedox cloud",
      "jedox planning",
    ],
    strengths: [
      "Excel-integrated interface with familiar spreadsheet paradigm",
      "Good self-service model building for technically proficient users",
      "Competitive pricing for European mid-market",
      "Flexible OLAP engine with GPU-accelerated calculations",
    ],
    weaknesses: [
      "Limited market presence in North America — small partner ecosystem outside DACH region",
      "Complexity of OLAP administration requires technical database skills",
      "Fewer pre-built industry solutions and connectors than major EPM platforms",
      "Scalability unproven at large enterprise with 1,000+ concurrent users",
    ],
    counterPoints: [
      "Anaplan's global footprint and EyeOn's worldwide delivery capability provide enterprise-grade support coverage — Jedox's partner network is concentrated in the DACH region with limited presence elsewhere",
      "Anaplan's in-memory HyperBlock architecture scales to thousands of concurrent users without performance degradation, while Jedox's OLAP engine requires careful cube tuning for large deployments",
      "EyeOn delivers Anaplan implementations backed by 150+ pre-built connectors and a mature integration framework — Jedox requires custom ETL development for most enterprise data source connections",
      "Anaplan's Connected Planning vision and roadmap — validated by Gartner, Forrester, and 2,000+ customers — provides long-term platform confidence that Jedox's niche positioning cannot match",
    ],
    talkingPoints: [
      "Emphasize Anaplan's analyst recognition and market leadership as de-risking factors for the buying committee",
      "Highlight EyeOn's implementation scale and reference customers in the prospect's industry — depth of proof points that Jedox cannot replicate",
      "Position Anaplan's partner ecosystem breadth — if the prospect ever needs to change implementation partners, Anaplan's market has dozens of qualified alternatives",
    ],
  },
];

// ── Detection Logic ──

/**
 * Scans all RFP question texts for competitor mentions.
 * Returns an array of CompetitorMention objects with counter-positioning
 * guidance for each detected competitor.
 */
export function detectCompetitors(
  questions: RfpQuestion[],
): CompetitorMention[] {
  const mentions: CompetitorMention[] = [];

  for (const question of questions) {
    const textLower = question.text.toLowerCase();

    for (const competitor of COMPETITOR_DATABASE) {
      const matchedAlias = competitor.aliases.find((alias) =>
        textLower.includes(alias),
      );

      if (!matchedAlias) continue;

      // Determine which product was referenced (best match)
      const matchedProduct =
        competitor.products.find((p) =>
          textLower.includes(p.toLowerCase()),
        ) ?? competitor.products[0];

      mentions.push({
        competitor: competitor.name,
        product: matchedProduct,
        foundIn: question.text,
        questionId: question.id,
        counterPoints: competitor.counterPoints,
        talkingPoints: competitor.talkingPoints,
      });
    }
  }

  return mentions;
}

// ── Prompt Injection Helper ──

/**
 * Builds a competitive context string for injection into the AI system
 * prompt when generating RFP responses. Summarizes detected competitors
 * and provides positioning guidance.
 */
export function getCompetitiveContext(
  mentions: CompetitorMention[],
): string {
  if (mentions.length === 0) return "";

  // Deduplicate by competitor name
  const uniqueCompetitors = new Map<string, CompetitorMention>();
  for (const mention of mentions) {
    if (!uniqueCompetitors.has(mention.competitor)) {
      uniqueCompetitors.set(mention.competitor, mention);
    }
  }

  const lines: string[] = [
    "## Competitive Intelligence — Detected Competitors",
    "",
    `The RFP references ${uniqueCompetitors.size} competitor(s). Position EyeOn/Anaplan against each as follows:`,
    "",
  ];

  for (const [name, mention] of uniqueCompetitors) {
    lines.push(`### ${name} (${mention.product})`);
    lines.push("");
    lines.push("**Counter-positioning — why Anaplan/EyeOn wins:**");
    for (const point of mention.counterPoints) {
      lines.push(`- ${point}`);
    }
    lines.push("");
    lines.push("**Talking points — emphasize in the response:**");
    for (const point of mention.talkingPoints) {
      lines.push(`- ${point}`);
    }
    lines.push("");
  }

  lines.push(
    "IMPORTANT: Do not disparage competitors by name. Instead, position Anaplan's strengths and EyeOn's delivery expertise as the affirmative reason to choose this solution. Use phrases like \"unlike legacy planning tools\" or \"compared to traditional EPM platforms\" rather than naming competitors directly.",
  );

  return lines.join("\n");
}
