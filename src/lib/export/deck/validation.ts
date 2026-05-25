/**
 * Deck Composer — Zod Validation Schemas
 *
 * Runtime validation of AI-generated JSON to catch malformed output
 * before it reaches the PptxGenJS rendering pipeline.
 */

import { z } from "zod";

/* ── Pattern Types ──────────────────────────────────────────────── */

const PatternTypeSchema = z.enum([
  "cover",
  "waterfall",
  "gated-flow",
  "pyramid",
  "staircase",
  "architecture-flow",
  "content-cards",
  "comparison-matrix",
  "timeline",
  "metrics-dashboard",
  "quote-callout",
]);

/* ── Phase 1: Outline ───────────────────────────────────────────── */

const SlideOutlineSchema = z.object({
  id: z.string(),
  pattern: PatternTypeSchema,
  governingThought: z.string().max(200),
  subtitle: z.string().max(300),
  insightBar: z.string().max(300),
  contentBrief: z.string().max(500),
});

const DeckSectionSchema = z.object({
  label: z.string(),
  slides: z.array(SlideOutlineSchema).min(1).max(8),
});

export const DeckOutlineSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  sections: z.array(DeckSectionSchema).min(2).max(12),
  totalSlides: z.number().int().min(5).max(35),
});

/* ── Phase 2: Content — Slide Bodies ────────────────────────────── */

const InsightBarSchema = z.object({
  label: z.string(),
  detail: z.string(),
});

const CoverBodySchema = z.object({
  pattern: z.literal("cover"),
  title: z.string(),
  subtitle: z.string(),
  clientName: z.string(),
  date: z.string(),
  preparedBy: z.string(),
});

const WaterfallBodySchema = z.object({
  pattern: z.literal("waterfall"),
  bars: z.array(z.object({
    label: z.string(),
    percentage: z.number().min(0).max(100),
    description: z.string(),
    details: z.array(z.object({ bold: z.string(), body: z.string() })).optional().default([]),
  })).min(2).max(5),
  target: z.object({ label: z.string(), description: z.string() }).optional(),
});

const GatedFlowBodySchema = z.object({
  pattern: z.literal("gated-flow"),
  phases: z.array(z.object({
    number: z.number().int(),
    title: z.string(),
    bullets: z.array(z.string()).min(1).max(6),
    gate: z.string().optional(),
  })).min(2).max(5),
  details: z.array(z.object({
    column: z.number().int(),
    items: z.array(z.object({ bold: z.string(), body: z.string() })),
  })).optional(),
});

const PyramidBodySchema = z.object({
  pattern: z.literal("pyramid"),
  layers: z.array(z.object({
    label: z.string(),
    description: z.string(),
    annotation: z.object({ bold: z.string(), body: z.string() }),
  })).min(2).max(6),
  leftAxis: z.string().optional(),
});

const StaircaseBodySchema = z.object({
  pattern: z.literal("staircase"),
  steps: z.array(z.object({
    title: z.string(),
    subtitle: z.string(),
    annotation: z.object({ bold: z.string(), detail: z.string() }),
  })).min(3).max(6),
  scopeLabel: z.string().optional(),
});

const ArchitectureFlowBodySchema = z.object({
  pattern: z.literal("architecture-flow"),
  columns: z.array(z.object({
    zoneLabel: z.string(),
    containerTitle: z.string().optional(),
    cards: z.array(z.object({
      title: z.string(),
      subtitle: z.string(),
      accentColor: z.string().optional(),
      dashed: z.boolean().optional(),
    })).min(1).max(6),
  })).min(2).max(5),
  legend: z.array(z.object({ color: z.string(), label: z.string() })).optional(),
});

const ContentCardsBodySchema = z.object({
  pattern: z.literal("content-cards"),
  cards: z.array(z.object({
    title: z.string(),
    body: z.string(),
    accentColor: z.string().optional(),
    metric: z.object({ value: z.string(), label: z.string() }).optional(),
  })).min(2).max(9),
  columns: z.number().int().min(2).max(3).optional(),
});

const ComparisonMatrixBodySchema = z.object({
  pattern: z.literal("comparison-matrix"),
  headers: z.array(z.string()).min(2).max(4),
  rows: z.array(z.object({
    label: z.string(),
    cells: z.array(z.object({
      text: z.string(),
      highlight: z.boolean().optional(),
    })),
  })).min(2).max(8),
  footer: z.string().optional(),
});

const TimelineBodySchema = z.object({
  pattern: z.literal("timeline"),
  milestones: z.array(z.object({
    label: z.string(),
    duration: z.string(),
    description: z.string(),
    highlighted: z.boolean().optional(),
  })).min(3).max(7),
  totalDuration: z.string().optional(),
});

const MetricsDashboardBodySchema = z.object({
  pattern: z.literal("metrics-dashboard"),
  metrics: z.array(z.object({
    value: z.string(),
    label: z.string(),
    sublabel: z.string().optional(),
    color: z.string().optional(),
  })).min(2).max(8),
  bullets: z.array(z.string()).optional(),
});

const QuoteCalloutBodySchema = z.object({
  pattern: z.literal("quote-callout"),
  quote: z.string(),
  attribution: z.string(),
  role: z.string(),
  context: z.string().optional(),
});

const SlideBodySchema = z.discriminatedUnion("pattern", [
  CoverBodySchema,
  WaterfallBodySchema,
  GatedFlowBodySchema,
  PyramidBodySchema,
  StaircaseBodySchema,
  ArchitectureFlowBodySchema,
  ContentCardsBodySchema,
  ComparisonMatrixBodySchema,
  TimelineBodySchema,
  MetricsDashboardBodySchema,
  QuoteCalloutBodySchema,
]);

const SlideContentSchema = z.object({
  id: z.string(),
  sectionLabel: z.string(),
  governingThought: z.string(),
  subtitle: z.string(),
  insightBar: InsightBarSchema,
  body: SlideBodySchema,
});

export const DeckContentSchema = z.object({
  slides: z.array(SlideContentSchema).min(5).max(35),
});

/* ── Validation Helpers ─────────────────────────────────────────── */

export function validateOutline(data: unknown) {
  return DeckOutlineSchema.safeParse(data);
}

export function validateContent(data: unknown) {
  return DeckContentSchema.safeParse(data);
}

/**
 * Extract JSON from a Claude response that may contain markdown fencing.
 */
export function extractJSON(text: string): unknown {
  // Try to find JSON in code blocks first
  const fenced = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (fenced) {
    return JSON.parse(fenced[1].trim());
  }
  // Try parsing the whole thing
  const trimmed = text.trim();
  // Find first { or [ and last } or ]
  const start = trimmed.search(/[{[]/);
  const end = Math.max(trimmed.lastIndexOf("}"), trimmed.lastIndexOf("]"));
  if (start >= 0 && end > start) {
    return JSON.parse(trimmed.slice(start, end + 1));
  }
  return JSON.parse(trimmed);
}
