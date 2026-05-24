/**
 * Cost calculation engine for Anaplan implementation proposals.
 * Generates effort matrices, cost breakdowns, and licensing estimates
 * based on clarification answers and detected modules.
 */

import { ANAPLAN_KB } from "@/data/knowledge-base";

// ── Types ──

export interface RateCard {
  role: string;
  dailyRate: number;
}

export interface EffortEntry {
  phase: string;
  role: string;
  days: number;
  cost: number;
}

export interface LicensingConfig {
  modelBuilderSeats: number;
  endUserSeats: number;
  adminSeats: number;
  monthlyModelBuilder: number;
  monthlyEndUser: number;
  monthlyAdmin: number;
  durationMonths: number;
}

export interface CostBreakdown {
  laborCost: number;
  licensingCost: number;
  travelCost: number;
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  marginPercent: number;
  marginAmount: number;
  totalCost: number;
}

export interface CostSummary {
  rateCards: RateCard[];
  effortMatrix: EffortEntry[];
  licensing: LicensingConfig;
  breakdown: CostBreakdown;
  totalDays: number;
  totalWeeks: number;
  averageDailyRate: number;
}

// ── Role allocation weights ──
// Determines what fraction of phase effort each role gets

const ROLE_ALLOCATION: Record<string, number> = {
  "solution architect": 0.25,
  "model builder": 0.35,
  "project manager": 0.15,
  "business analyst": 0.15,
  "change manager": 0.10,
};

function matchRoleAllocation(role: string): number {
  const lower = role.toLowerCase();
  for (const [key, alloc] of Object.entries(ROLE_ALLOCATION)) {
    if (lower.includes(key) || key.includes(lower)) return alloc;
  }
  return 0.15; // default for unknown roles
}

// ── Parse rate cards from clarification answers ──

export function parseRateCards(answers: Record<string, string>): RateCard[] {
  const cards: RateCard[] = [];

  // Map clarification answer IDs to role names
  const roleMap: Record<string, string> = {
    "rate-architect": "Solution Architect",
    "rate-model-builder": "Model Builder",
    "rate-pm": "Project Manager",
    "rate-analyst": "Business Analyst",
    "rate-change-manager": "Change Manager",
  };

  for (const [id, role] of Object.entries(roleMap)) {
    const value = answers[id];
    if (value && !isNaN(Number(value))) {
      cards.push({ role, dailyRate: Number(value) });
    }
  }

  // If no rates provided, use defaults (EUR)
  if (cards.length === 0) {
    cards.push(
      { role: "Solution Architect", dailyRate: 2200 },
      { role: "Model Builder", dailyRate: 1500 },
      { role: "Project Manager", dailyRate: 1800 },
      { role: "Business Analyst", dailyRate: 1200 },
      { role: "Change Manager", dailyRate: 1400 },
    );
  }

  return cards;
}

// ── Effort matrix generation ──

type AnaplanModuleKey = keyof typeof ANAPLAN_KB.platform.modules;

export function generateEffortMatrix(
  rateCards: RateCard[],
  detectedModules: string[],
  engagementDurationWeeks: number = 12,
): EffortEntry[] {
  const entries: EffortEntry[] = [];
  if (rateCards.length === 0) return entries;

  // Find the best implementation phases from detected modules
  type PhaseType = { name: string; durationWeeks: number; activities: readonly string[] };
  let bestPhases: PhaseType[] = [];
  let maxWeeks = 0;

  for (const modKey of detectedModules) {
    const modData = ANAPLAN_KB.platform.modules[modKey as AnaplanModuleKey];
    if (!modData) continue;
    const phases = modData.implementationPhases as unknown as PhaseType[];
    const totalWeeks = phases.reduce((sum, p) => sum + p.durationWeeks, 0);
    if (totalWeeks > maxWeeks) {
      maxWeeks = totalWeeks;
      bestPhases = phases;
    }
  }

  // Fallback to FP&A phases
  if (bestPhases.length === 0) {
    bestPhases = ANAPLAN_KB.platform.modules.fpa.implementationPhases as unknown as PhaseType[];
  }

  // Scale to engagement duration
  const kbTotalWeeks = bestPhases.reduce((s, p) => s + p.durationWeeks, 0);
  const scaleFactor = kbTotalWeeks > 0 ? engagementDurationWeeks / kbTotalWeeks : 1;

  for (const phase of bestPhases) {
    const scaledWeeks = phase.durationWeeks * scaleFactor;
    const totalPhaseDays = Math.round(scaledWeeks * 5); // 5 working days per week

    // Allocate days across roles
    let totalAlloc = 0;
    const roleAllocs: { card: RateCard; alloc: number }[] = [];
    for (const card of rateCards) {
      const alloc = matchRoleAllocation(card.role);
      roleAllocs.push({ card, alloc });
      totalAlloc += alloc;
    }

    for (const { card, alloc } of roleAllocs) {
      const normalizedAlloc = totalAlloc > 0 ? alloc / totalAlloc : 1 / rateCards.length;
      const days = Math.round(totalPhaseDays * normalizedAlloc);
      if (days > 0) {
        entries.push({
          phase: phase.name,
          role: card.role,
          days,
          cost: days * card.dailyRate,
        });
      }
    }
  }

  return entries;
}

// ── Licensing estimation ──

export function getDefaultLicensing(durationWeeks: number = 12): LicensingConfig {
  const durationMonths = Math.ceil(durationWeeks / 4.33);
  return {
    modelBuilderSeats: 3,
    endUserSeats: 20,
    adminSeats: 2,
    monthlyModelBuilder: 4500,
    monthlyEndUser: 1200,
    monthlyAdmin: 2500,
    durationMonths,
  };
}

export function calculateLicensingCost(config: LicensingConfig): number {
  return (
    config.modelBuilderSeats * config.monthlyModelBuilder +
    config.endUserSeats * config.monthlyEndUser +
    config.adminSeats * config.monthlyAdmin
  ) * config.durationMonths;
}

// ── Cost breakdown ──

export function calculateCostBreakdown(
  effortMatrix: EffortEntry[],
  licensing: LicensingConfig,
  travelCostPerTrip: number = 1500,
  numberOfTrips: number = 0,
  discountPercent: number = 0,
  marginPercent: number = 25,
): CostBreakdown {
  const laborCost = effortMatrix.reduce((sum, e) => sum + e.cost, 0);
  const licensingCost = calculateLicensingCost(licensing);
  const travelCost = travelCostPerTrip * numberOfTrips;
  const subtotal = laborCost + licensingCost + travelCost;
  const discountAmount = subtotal * discountPercent / 100;
  const afterDiscount = subtotal - discountAmount;
  const marginAmount = afterDiscount * marginPercent / 100;
  const totalCost = afterDiscount + marginAmount;

  return {
    laborCost,
    licensingCost,
    travelCost,
    subtotal,
    discountPercent,
    discountAmount,
    marginPercent,
    marginAmount,
    totalCost,
  };
}

// ── Full cost summary ──

export function generateCostSummary(
  clarificationAnswers: Record<string, string>,
  detectedModules: string[],
): CostSummary {
  // Parse engagement duration from clarification
  const durationAnswer = clarificationAnswers["eng-duration"] || "12";
  const engagementWeeks = parseInt(durationAnswer) || 12;

  // Parse travel
  const travelAnswer = clarificationAnswers["eng-travel"] || "None";
  let numberOfTrips = 0;
  if (travelAnswer === "Weekly") numberOfTrips = engagementWeeks;
  else if (travelAnswer === "Bi-weekly") numberOfTrips = Math.ceil(engagementWeeks / 2);
  else if (travelAnswer === "Monthly") numberOfTrips = Math.ceil(engagementWeeks / 4.33);

  // Parse margin
  const marginAnswer = clarificationAnswers["eng-margin"] || "25";
  const marginPercent = parseInt(marginAnswer) || 25;

  // Build everything
  const rateCards = parseRateCards(clarificationAnswers);
  const effortMatrix = generateEffortMatrix(rateCards, detectedModules, engagementWeeks);
  const licensing = getDefaultLicensing(engagementWeeks);
  const breakdown = calculateCostBreakdown(
    effortMatrix, licensing, 1500, numberOfTrips, 0, marginPercent
  );

  const totalDays = effortMatrix.reduce((sum, e) => sum + e.days, 0);
  const totalWeeks = engagementWeeks;
  const totalLabor = effortMatrix.reduce((sum, e) => sum + e.cost, 0);
  const averageDailyRate = totalDays > 0 ? Math.round(totalLabor / totalDays) : 0;

  return {
    rateCards,
    effortMatrix,
    licensing,
    breakdown,
    totalDays,
    totalWeeks,
    averageDailyRate,
  };
}

// ── Helpers for dashboard display ──

export function getEffortByPhase(matrix: EffortEntry[]): { phase: string; days: number; cost: number }[] {
  const byPhase = new Map<string, { days: number; cost: number }>();
  for (const e of matrix) {
    const existing = byPhase.get(e.phase) || { days: 0, cost: 0 };
    existing.days += e.days;
    existing.cost += e.cost;
    byPhase.set(e.phase, existing);
  }
  return Array.from(byPhase.entries()).map(([phase, data]) => ({ phase, ...data }));
}

export function getEffortByRole(matrix: EffortEntry[]): { role: string; days: number; cost: number }[] {
  const byRole = new Map<string, { days: number; cost: number }>();
  for (const e of matrix) {
    const existing = byRole.get(e.role) || { days: 0, cost: 0 };
    existing.days += e.days;
    existing.cost += e.cost;
    byRole.set(e.role, existing);
  }
  return Array.from(byRole.entries()).map(([role, data]) => ({ role, ...data }));
}

export function formatCurrency(amount: number, currency: string = "EUR"): string {
  const symbol = currency === "USD" ? "$" : "€";
  return `${symbol}${amount.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}
