/**
 * Implementation timeline generator.
 * Produces a structured project timeline from effort matrix data
 * with sprint cadences, milestones, and phase dependencies.
 */

import type { EffortEntry, CostSummary } from "@/lib/costing";

export interface TimelinePhase {
  name: string;
  startWeek: number;
  endWeek: number;
  durationWeeks: number;
  totalDays: number;
  roles: string[];
  milestone: string | null;
  activities: string[];
}

export interface ProjectTimeline {
  phases: TimelinePhase[];
  totalWeeks: number;
  sprintCadence: string;
  keyMilestones: { week: number; label: string }[];
}

// Phase order for scheduling
const PHASE_ORDER = [
  "Discovery",
  "Design",
  "Build",
  "Test",
  "Deploy",
  "Hypercare",
];

// Activities by phase
const PHASE_ACTIVITIES: Record<string, string[]> = {
  Discovery: [
    "Stakeholder interviews & requirements gathering",
    "Current-state process documentation",
    "Module scope confirmation & data source inventory",
    "Solution architecture blueprint",
  ],
  Design: [
    "Functional design specifications",
    "Data model design (PLANS methodology)",
    "UX/dashboard wireframes & approval",
    "Integration mapping & API design",
  ],
  Build: [
    "Core model build & module configuration",
    "Dashboard & reporting development",
    "Integration development & data connectors",
    "User acceptance testing preparation",
  ],
  Test: [
    "System integration testing",
    "User acceptance testing (UAT)",
    "Performance & load testing",
    "Defect resolution & sign-off",
  ],
  Deploy: [
    "Production deployment & cutover",
    "Data migration & validation",
    "End-user training delivery",
    "Go-live support & monitoring",
  ],
  Hypercare: [
    "Post-go-live support & issue triage",
    "Performance optimization & tuning",
    "Knowledge transfer to internal team",
    "Lessons learned & roadmap handoff",
  ],
};

// Milestones by phase
const PHASE_MILESTONES: Record<string, string> = {
  Discovery: "Discovery Complete / Scope Sign-off",
  Design: "Design Approved / Build Authorization",
  Build: "Development Complete / UAT Entry",
  Test: "UAT Sign-off / Go-Live Authorization",
  Deploy: "Go-Live",
  Hypercare: "Project Closure & Handoff",
};

export function generateTimeline(costSummary: CostSummary): ProjectTimeline {
  const { effortMatrix, totalWeeks } = costSummary;

  // Group effort entries by phase
  const phaseMap = new Map<string, EffortEntry[]>();
  for (const entry of effortMatrix) {
    const list = phaseMap.get(entry.phase) || [];
    list.push(entry);
    phaseMap.set(entry.phase, list);
  }

  // Sort phases by PHASE_ORDER
  const orderedPhases = PHASE_ORDER.filter((p) => phaseMap.has(p));

  // Calculate phase durations proportionally
  const totalDays = effortMatrix.reduce((s, e) => s + e.days, 0);
  let currentWeek = 1;

  const phases: TimelinePhase[] = orderedPhases.map((phaseName) => {
    const entries = phaseMap.get(phaseName)!;
    const phaseDays = entries.reduce((s, e) => s + e.days, 0);
    const roles = [...new Set(entries.map((e) => e.role))];

    // Duration proportional to effort, minimum 1 week
    const rawWeeks = totalWeeks > 0
      ? Math.round((phaseDays / totalDays) * totalWeeks)
      : 1;
    const durationWeeks = Math.max(1, rawWeeks);

    const startWeek = currentWeek;
    const endWeek = currentWeek + durationWeeks - 1;
    currentWeek = endWeek + 1;

    return {
      name: phaseName,
      startWeek,
      endWeek,
      durationWeeks,
      totalDays: phaseDays,
      roles,
      milestone: PHASE_MILESTONES[phaseName] || null,
      activities: PHASE_ACTIVITIES[phaseName] || [],
    };
  });

  // Build milestones list
  const keyMilestones = phases
    .filter((p) => p.milestone)
    .map((p) => ({ week: p.endWeek, label: p.milestone! }));

  // Add kickoff
  keyMilestones.unshift({ week: 1, label: "Project Kickoff" });

  // Sprint cadence based on total weeks
  const sprintCadence =
    totalWeeks <= 8
      ? "1-week sprints"
      : totalWeeks <= 16
      ? "2-week sprints"
      : "2-week sprints with monthly steering";

  return {
    phases,
    totalWeeks: phases.length > 0
      ? phases[phases.length - 1].endWeek
      : totalWeeks,
    sprintCadence,
    keyMilestones,
  };
}

/**
 * Render timeline as formatted text for inclusion in proposal documents.
 */
export function renderTimelineText(timeline: ProjectTimeline): string {
  const lines: string[] = [];

  lines.push(`**Implementation Timeline — ${timeline.totalWeeks} Weeks**`);
  lines.push("");
  lines.push(`Sprint Cadence: ${timeline.sprintCadence}`);
  lines.push("");

  for (const phase of timeline.phases) {
    lines.push(
      `### ${phase.name} (Weeks ${phase.startWeek}–${phase.endWeek}, ${phase.durationWeeks}w)`
    );
    lines.push(`Team: ${phase.roles.join(", ")}`);
    lines.push(`Effort: ${phase.totalDays} person-days`);
    lines.push("");
    for (const activity of phase.activities) {
      lines.push(`- ${activity}`);
    }
    if (phase.milestone) {
      lines.push("");
      lines.push(`**Milestone:** ${phase.milestone}`);
    }
    lines.push("");
  }

  lines.push("### Key Milestones");
  for (const m of timeline.keyMilestones) {
    lines.push(`- Week ${m.week}: ${m.label}`);
  }

  return lines.join("\n");
}
