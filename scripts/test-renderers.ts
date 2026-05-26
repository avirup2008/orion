/**
 * Integration test: Generate a multi-slide deck using production renderers
 * to verify all visual upgrades are working.
 *
 * Run: npx tsx scripts/test-renderers.ts
 * Output: scripts/output/test-all-patterns.pptx
 */

import PptxGenJS from "pptxgenjs";
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { getBrandConfig, SLIDE } from "../src/lib/export/deck/assets";
import { addChrome, addGoverningThought, addInsightBar, addFullChrome } from "../src/lib/export/deck/chrome";
import { renderPattern } from "../src/lib/export/deck/patterns/index";
import type { SlideBody, SlideContent } from "../src/lib/export/deck/types";

const brand = getBrandConfig();

// Test slides — one per pattern
const testSlides: Array<{
  sectionLabel: string;
  governingThought: string;
  subtitle: string;
  insightBar: { label: string; detail: string; variant?: "wash" | "accent" };
  body: SlideBody;
}> = [
  // 1. Cover
  {
    sectionLabel: "",
    governingThought: "",
    subtitle: "",
    insightBar: { label: "", detail: "" },
    body: {
      pattern: "cover",
      title: "Project Aurora",
      subtitle: "Anaplan Implementation Proposal",
      clientName: "Acme Corporation",
      date: "May 2026",
      preparedBy: "Prepared by EyeOn — Anaplan Platinum Partner",
    },
  },
  // 2. Gated Flow (the main reference test)
  {
    sectionLabel: "Our Approach",
    governingThought: "Process First, Then Technology: Three Phases of Transformation",
    subtitle: "Each phase delivers a process outcome, not a technical milestone.",
    insightBar: { label: "Client context", detail: "34 licensed users, 0% active adoption for 18+ months. Contract expires May 2027.", variant: "accent" },
    body: {
      pattern: "gated-flow",
      phases: [
        { number: 1, title: "PROCESS DISCOVERY", duration: "Weeks 1–5", bullets: ["Map current planning decisions end-to-end", "Identify why adoption failed", "Document who decides what, when, with what data"], gate: "Stakeholders\nagree\ndiagnosis" },
        { number: 2, title: "DESIGN & CONFIGURE", duration: "Weeks 5–28", bullets: ["Define target S&OP operating model first", "Configure Anaplan to serve each process step", "Users validate in sprint demos every 2 weeks"], gate: "Users\nvalidate\nprocess" },
        { number: 3, title: "EMBED & SCALE", duration: "Weeks 28–35", bullets: ["Role-based capability building", "Run one full planning cycle in Anaplan", "Measure adoption KPIs, not just go-live"] },
      ],
      details: [
        { column: 0, items: [{ bold: "Current planning process", body: "How decisions are actually made today — who owns the forecast." }, { bold: "Root cause of 0% adoption", body: "Was it training? Process mismatch? Data trust?" }] },
        { column: 1, items: [{ bold: "Target operating model first", body: "S&OP cadence, decision rights, KPIs — defined before Anaplan config." }, { bold: "Each sprint delivers a process step", body: "Not a module. Users validate every demo." }] },
        { column: 2, items: [{ bold: "One full planning cycle", body: "Not a training session — real S&OP with real data." }, { bold: "Adoption metrics", body: "Active users, cycle time, forecast accuracy — measured from day one." }] },
      ],
    },
  },
  // 3. Pyramid
  {
    sectionLabel: "AI Philosophy",
    governingThought: "AI Augments the Process — It Doesn't Replace It",
    subtitle: "Each AI layer activates only when the layer below is stable.",
    insightBar: { label: "EyeOn philosophy", detail: "AI without process is automation of chaos.", variant: "accent" },
    body: {
      pattern: "pyramid",
      layers: [
        { label: "Anaplan Agents", description: "Autonomous exception handling · Scenario generation", annotation: { bold: "Roadmap", body: "Activated when process is mature" } },
        { label: "AI Analyst", description: "Natural language queries · Root cause surfacing", annotation: { bold: "New in 2025–26", body: "Conversational planning for all users" } },
        { label: "PlanIQ Forecaster", description: "ML ensemble models · External signal ingestion", annotation: { bold: "Anaplan native", body: "Polaris engine, built-in ML" } },
        { label: "Statistical Baseline", description: "Time-series algorithms · Measurable accuracy", annotation: { bold: "Prove accuracy", body: "Baseline before ML layers" } },
        { label: "Clean Data & Integration", description: "Master data governance · Automated ERP feeds", annotation: { bold: "Prerequisite", body: "Without clean data, AI amplifies errors" } },
      ],
      leftAxis: "AI MATURITY",
    },
  },
  // 4. Waterfall
  {
    sectionLabel: "Scope Assessment",
    governingThought: "70% Recovery, 20% Rewire, 10% Build",
    subtitle: "Most capability already exists in the platform — it was never activated.",
    insightBar: { label: "Scope insight", detail: "Previous partner configured technology without building the planning process.", variant: "wash" },
    body: {
      pattern: "waterfall",
      bars: [
        { label: "Recover", percentage: 70, description: "Process capability already in platform", details: [{ bold: "Standard workflow", body: "Stat baseline, exception review, consensus cycle" }] },
        { label: "Rewire", percentage: 20, description: "Adapt to client context", details: [{ bold: "Planning cadence", body: "Rolling forecast rhythm mapped to S&OP calendar" }] },
        { label: "Build", percentage: 10, description: "New functionality", details: [{ bold: "Driver-based", body: "Installed-base to attach rate logic" }] },
      ],
      target: { label: "Target Operating Model", description: "34 users · 7 markets · Monthly S&OP" },
    },
  },
  // 5. Content Cards
  {
    sectionLabel: "Capabilities",
    governingThought: "Anaplan Modules Configured for Your Business",
    subtitle: "Each module is pre-configured with industry best practices and accelerators.",
    insightBar: { label: "Platform", detail: "Anaplan Polaris engine with CloudWorks integration layer." },
    body: {
      pattern: "content-cards",
      cards: [
        { title: "Demand Planning", body: "Statistical baseline with consensus overlay. 7-market hierarchy, NPI launch governance, SKU-level granularity.", metric: { value: "40%", label: "reduction in forecast bias" } },
        { title: "Supply & Inventory", body: "Safety stock optimization, PO generation, DRP with 3PL hub planning. Multi-echelon inventory strategy.", metric: { value: "25%", label: "inventory reduction" } },
        { title: "S&OP Process", body: "Monthly global review cycle with exception-based demand review rhythm and structured escalation triggers.", metric: { value: "3x", label: "faster cycle time" } },
        { title: "FP&A Bridge", body: "Volume × price × mix waterfall connecting demand decisions to P&L impact. Real-time what-if scenarios.", metric: { value: "€2M", label: "margin improvement" } },
      ],
      columns: 2,
    },
  },
  // 6. Architecture Flow
  {
    sectionLabel: "Technical Architecture",
    governingThought: "End-to-End Data Flow: Source to Execution",
    subtitle: "Snowflake as single source of truth, Anaplan for planning, AI for intelligence.",
    insightBar: { label: "Architecture principle", detail: "Snowflake as SSOT · Anaplan Data Hub decouples ingestion from calc · SAP-ready from day one." },
    body: {
      pattern: "architecture-flow",
      columns: [
        { zoneLabel: "Source Systems", cards: [{ title: "MS Business Central", subtitle: "5 instances · ERP of record" }, { title: "SAP S/4HANA", subtitle: "H2 2027 phased rollout", dashed: true }, { title: "FlexPLM", subtitle: "Product master data" }] },
        { zoneLabel: "Snowflake Data Hub", containerTitle: "Snowflake", cards: [{ title: "Consolidation layer", subtitle: "5 BC instances unified" }, { title: "Product hierarchy", subtitle: "Bundle/debundle logic" }, { title: "Customer master", subtitle: "Market hierarchies" }] },
        { zoneLabel: "Anaplan Layer", containerTitle: "Anaplan Apps", cards: [{ title: "Demand Planning", subtitle: "Statistical baseline · consensus" }, { title: "Supply & Inventory", subtitle: "Safety stock · PO generation" }, { title: "S&OP", subtitle: "Monthly global review cycle" }] },
        { zoneLabel: "Execution", cards: [{ title: "ERP — PO Push", subtitle: "BC today · SAP S/4 from 2027" }, { title: "3PL Partners", subtitle: "Warehouse execution" }, { title: "BI / Reporting", subtitle: "Executive dashboards" }] },
      ],
      legend: [{ color: "0B1F3A", label: "MVP scope" }, { color: "E6E6E6", label: "Future / TBD" }],
    },
  },
  // 7. Comparison Matrix
  {
    sectionLabel: "Why EyeOn",
    governingThought: "Partner Comparison: Experience That Counts",
    subtitle: "Not all Anaplan partners are equal. Here's why EyeOn is different.",
    insightBar: { label: "Track record", detail: "20+ enterprise Anaplan implementations since 2004." },
    body: {
      pattern: "comparison-matrix",
      headers: ["EyeOn", "Big 4", "DIY / Internal"],
      rows: [
        { label: "Anaplan Expertise", cells: [{ text: "Platinum Partner, 50+ certified", highlight: true }, { text: "Varies by team" }, { text: "Limited" }] },
        { label: "SCM Standard App", cells: [{ text: "Deep knowledge, pre-built accelerators", highlight: true }, { text: "General knowledge" }, { text: "No accelerators" }] },
        { label: "Process Focus", cells: [{ text: "Process-first methodology", highlight: true }, { text: "Technology-led" }, { text: "Ad-hoc" }] },
        { label: "Cost", cells: [{ text: "€750–1,100/day" }, { text: "€1,500–2,500/day" }, { text: "€400–600/day" }] },
        { label: "Timeline Risk", cells: [{ text: "Low — proven playbook", highlight: true }, { text: "Medium" }, { text: "High" }] },
      ],
      footer: "Rates are indicative. Final pricing based on scope and team composition.",
    },
  },
  // 8. Timeline
  {
    sectionLabel: "Project Timeline",
    governingThought: "35 Weeks to Full Planning Capability",
    subtitle: "Phased delivery with clear gates and measurable outcomes at each stage.",
    insightBar: { label: "Start date", detail: "June 29, 2026 — aligned with Q3 planning cycle start." },
    body: {
      pattern: "timeline",
      milestones: [
        { label: "Discovery", duration: "Weeks 1–5", description: "Map current state, diagnose adoption failure, assess platform readiness", highlighted: true },
        { label: "Design", duration: "Weeks 5–16", description: "Define target operating model, configure Anaplan modules in sprints" },
        { label: "Build", duration: "Weeks 16–28", description: "Full configuration, data migration, integration testing" },
        { label: "Embed", duration: "Weeks 28–35", description: "Run one full S&OP cycle, capability building, adoption metrics", highlighted: true },
      ],
      totalDuration: "35 weeks",
    },
  },
  // 9. Metrics Dashboard
  {
    sectionLabel: "Expected Outcomes",
    governingThought: "Measurable Impact from Day One",
    subtitle: "KPIs tracked throughout the programme, not just at go-live.",
    insightBar: { label: "Measurement", detail: "Adoption metrics, planning cycle time, and forecast accuracy tracked from sprint 1." },
    body: {
      pattern: "metrics-dashboard",
      metrics: [
        { value: "34", label: "Active Users", sublabel: "Target: all licensed users actively planning" },
        { value: "40%", label: "Forecast Bias Reduction", sublabel: "Statistical baseline + consensus overlay" },
        { value: "3×", label: "Faster Planning Cycle", sublabel: "From 3 weeks to 1 week monthly S&OP" },
        { value: "€2M+", label: "Margin Improvement", sublabel: "Volume × price × mix optimization" },
      ],
      bullets: [
        "Adoption measured from sprint 1 — not a go-live checkbox",
        "Monthly retrospective on process effectiveness and tool usage",
        "Decision audit trail: every forecast change tracked to a person and a reason",
      ],
    },
  },
  // 10. Quote Callout
  {
    sectionLabel: "References",
    governingThought: "What Our Clients Say",
    subtitle: "Feedback from recent Anaplan implementations.",
    insightBar: { label: "Reference", detail: "Available for a call upon request." },
    body: {
      pattern: "quote-callout",
      quote: "EyeOn didn't just configure Anaplan — they redesigned how we plan. The process-first approach meant our team actually adopted the tool.",
      attribution: "VP Supply Chain Planning",
      role: "Global FMCG Company — Anaplan SCM Implementation",
      context: "18-month engagement covering Demand Planning, S&OP, and Supply Chain across 12 markets.",
    },
  },
  // 11. Staircase
  {
    sectionLabel: "Adoption Framework",
    governingThought: "Adoption Is Designed, Not Deployed",
    subtitle: "Each layer builds on the one below — skip a layer and adoption collapses.",
    insightBar: { label: "Lesson learned", detail: "The previous partner skipped layers 1 and 2. Result: 34 users idle, 0% adoption.", variant: "accent" },
    body: {
      pattern: "staircase",
      steps: [
        { title: "Dashboards & Smart Touch", subtitle: "Decision intelligence · Exception-based review · Insight over interaction", annotation: { bold: "Value Delivery", detail: "System automates recurring tasks. Users act on exceptions only." } },
        { title: "Training Approach", subtitle: "Process-first · Role-based cohorts · Embedded in sprints", annotation: { bold: "Enablement", detail: "Training woven into delivery sprints. Champions sustain adoption." } },
        { title: "Adapt the Tool", subtitle: "Role-based config · Process-aligned workflows · Exception-driven UX", annotation: { bold: "Foundation", detail: "Tool mirrors process, not vice versa. Users see only their role's scope." } },
      ],
      scopeLabel: "All three layers built from day one",
    },
  },
];

async function main() {
  const pptx = new PptxGenJS();
  pptx.defineLayout({ name: "WIDESCREEN", width: SLIDE.width, height: SLIDE.height });
  pptx.layout = "WIDESCREEN";

  testSlides.forEach((ts, i) => {
    const slide = pptx.addSlide();
    const pageNum = i + 1;

    if (ts.body.pattern === "cover") {
      // Cover gets its own chrome handling
      renderPattern(slide, pptx, ts.body, brand);
    } else {
      // Standard chrome
      addFullChrome(slide, pptx, brand, {
        pageNum,
        sectionLabel: ts.sectionLabel,
        governingThought: ts.governingThought,
        subtitle: ts.subtitle,
        insightBar: ts.insightBar,
      });
      renderPattern(slide, pptx, ts.body, brand);
    }
  });

  const outDir = join(__dirname, "output");
  mkdirSync(outDir, { recursive: true });
  const buffer = await pptx.write({ outputType: "nodebuffer" }) as Buffer;
  const outPath = join(outDir, "test-all-patterns.pptx");
  writeFileSync(outPath, buffer);
  console.log(`✅ Generated ${testSlides.length}-slide deck: ${outPath}`);
}

main().catch(console.error);
