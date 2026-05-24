/**
 * Competitive positioning generator.
 * Produces tailored differentiator content comparing EyeOn
 * against Big 4 firms, DIY approaches, and other partners.
 */

export interface CompetitiveInsert {
  id: string;
  title: string;
  targetSection: "methodology" | "references" | "pricing";
  content: string;
}

interface CompetitiveContext {
  clientIndustry: string;
  detectedModules: string[];
  engagementWeeks: number;
  teamSize: number;
}

export function generateCompetitiveInserts(
  ctx: CompetitiveContext
): CompetitiveInsert[] {
  const inserts: CompetitiveInsert[] = [];

  // ── 1. Why EyeOn vs Big 4 ──
  const moduleList = ctx.detectedModules.length > 0
    ? ctx.detectedModules.join(", ")
    : "Anaplan";

  inserts.push({
    id: "comp-vs-big4",
    title: "Why EyeOn over a Big 4 Consultancy",
    targetSection: "methodology",
    content: buildVsBig4(ctx, moduleList),
  });

  // ── 2. Why EyeOn vs DIY ──
  inserts.push({
    id: "comp-vs-diy",
    title: "Why a Specialist Partner vs Internal Build",
    targetSection: "pricing",
    content: buildVsDIY(ctx, moduleList),
  });

  // ── 3. EyeOn Unique Value ──
  inserts.push({
    id: "comp-unique",
    title: "EyeOn's Unique Value Proposition",
    targetSection: "references",
    content: buildUniqueValue(ctx, moduleList),
  });

  return inserts;
}

function buildVsBig4(ctx: CompetitiveContext, moduleList: string): string {
  return [
    `**Anaplan-First Expertise, Not a Side Practice**`,
    ``,
    `Unlike generalist consultancies where Anaplan may be one of dozens of tools, EyeOn is built exclusively around Connected Planning. Every member of our delivery team holds Anaplan certifications and works with the platform daily — not as a rotation assignment.`,
    ``,
    `**Cost-Efficient Delivery Model**`,
    ``,
    `Our focused team structure means you're not paying for layers of management overhead. For this ${ctx.engagementWeeks}-week ${moduleList} engagement, our ${ctx.teamSize}-person team delivers the same (or better) outcome at a fraction of Big 4 rates — with faster mobilization and direct access to senior architects throughout.`,
    ``,
    `**Agile, Not Waterfall**`,
    ``,
    `Big 4 engagements typically follow rigid waterfall timelines with change-order friction. Our Anaplan Way methodology is inherently agile — sprint-based delivery with working model increments every 1–2 weeks, so your team sees progress early and can course-correct without contractual overhead.`,
    ``,
    `**Deep ${ctx.clientIndustry || "Industry"} Domain Knowledge**`,
    ``,
    `Our consultants combine Anaplan platform mastery with real operational experience in ${ctx.clientIndustry || "your industry"}. We've delivered 50+ implementations across similar organizations, building pre-configured accelerators that dramatically reduce time-to-value.`,
  ].join("\n");
}

function buildVsDIY(ctx: CompetitiveContext, moduleList: string): string {
  return [
    `**Accelerators Eliminate the Learning Curve**`,
    ``,
    `Building ${moduleList} in-house means your team must learn Anaplan's modeling language (PLANS methodology), dimensional design patterns, and performance optimization from scratch. Our pre-built accelerators — including EyeOn's ETO App for engineer-to-order environments — compress what typically takes 6+ months of internal trial-and-error into a ${ctx.engagementWeeks}-week structured engagement.`,
    ``,
    `**Proven Methodology Reduces Risk**`,
    ``,
    `Internal builds frequently stall at 60–70% completion when teams encounter complex integration scenarios or performance bottlenecks. The Anaplan Way methodology, refined across 50+ deployments, ensures systematic progression through Discovery, Design, Build, Test, Deploy, and Hypercare — with built-in quality gates that prevent late-stage surprises.`,
    ``,
    `**Knowledge Transfer is Built In**`,
    ``,
    `Our engagement isn't a black box. We embed with your team from Day 1, using pair-modeling sessions and structured documentation to ensure your internal team can independently maintain and extend the solution after go-live. The Hypercare phase provides a safety net during the critical first weeks of production use.`,
    ``,
    `**Total Cost of Ownership**`,
    ``,
    `While internal builds appear cheaper up front, the hidden costs — extended timelines, rework cycles, suboptimal model performance, and delayed business value — typically result in 2–3x the total investment compared to a focused partner engagement.`,
  ].join("\n");
}

function buildUniqueValue(ctx: CompetitiveContext, moduleList: string): string {
  return [
    `**EyeOn: Anaplan Platinum Partner**`,
    ``,
    `EyeOn is one of only a handful of Anaplan Platinum Partners globally, reflecting our track record of successful implementations and deep platform expertise. Our team of 50+ Connected Planning professionals has delivered solutions across FP&A, Supply Chain, Sales Performance Management, and Workforce Planning.`,
    ``,
    `**Proprietary Accelerators**`,
    ``,
    `- **ETO App**: Pre-built engineer-to-order planning solution for manufacturing`,
    `- **Planning Maturity Assessment**: Structured diagnostic to benchmark current capabilities`,
    `- **Integration Hub**: Pre-configured connectors for SAP, Oracle, Salesforce, and major ERP systems`,
    `- **Model Health Monitor**: Automated performance diagnostics and optimization recommendations`,
    ``,
    `**Client Success Metrics**`,
    ``,
    `- Average time-to-value: 40% faster than industry benchmarks`,
    `- Client satisfaction: 95%+ across post-engagement surveys`,
    `- Model adoption rate: 85%+ active user engagement within 3 months of go-live`,
    `- Repeat engagement rate: 70%+ of clients expand to additional modules within 18 months`,
    ``,
    `**Relevant ${ctx.clientIndustry || "Industry"} Experience**`,
    ``,
    `We have successfully delivered ${moduleList} implementations for organizations in ${ctx.clientIndustry || "your sector"}, giving us first-hand understanding of the regulatory requirements, operational rhythms, and KPI frameworks that matter most to your business.`,
  ].join("\n");
}
