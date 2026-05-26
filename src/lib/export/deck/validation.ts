/**
 * Deck Composer — Zod Validation Schemas
 *
 * Runtime validation of AI-generated JSON to catch malformed output
 * before it reaches the PptxGenJS rendering pipeline.
 *
 * IMPORTANT: Claude's JSON output is not always perfectly structured.
 * We use preprocessing (z.preprocess) and defaults extensively to
 * coerce AI output into the expected shapes rather than failing hard.
 */

import { z } from "zod";

/* ── Coercion Helpers ─────────────────────────────────────────── */

/** Coerce a string OR {bold,body} into {bold,body} */
const BoldBodySchema = z.preprocess(
  (val) => {
    if (typeof val === "string") return { bold: val, body: "" };
    if (val && typeof val === "object" && !Array.isArray(val)) {
      const o = val as Record<string, unknown>;
      return {
        bold: o.bold ?? o.title ?? o.label ?? o.key ?? "",
        body: o.body ?? o.detail ?? o.description ?? o.text ?? o.value ?? "",
      };
    }
    return { bold: "", body: "" };
  },
  z.object({ bold: z.string(), body: z.string() }),
);

/** Coerce a string OR {bold,detail} into {bold,detail} */
const BoldDetailSchema = z.preprocess(
  (val) => {
    if (typeof val === "string") return { bold: val, detail: "" };
    if (val && typeof val === "object" && !Array.isArray(val)) {
      const o = val as Record<string, unknown>;
      return {
        bold: o.bold ?? o.title ?? o.label ?? o.key ?? "",
        detail: o.detail ?? o.body ?? o.description ?? o.text ?? o.value ?? "",
      };
    }
    return { bold: "", detail: "" };
  },
  z.object({ bold: z.string(), detail: z.string() }),
);

/** Coerce detail items — array of strings OR objects */
const DetailItemsSchema = z.preprocess(
  (val) => {
    if (!Array.isArray(val)) return [];
    return val.map((item) => {
      if (typeof item === "string") return { bold: item, body: "" };
      if (item && typeof item === "object") {
        return {
          bold: (item as Record<string, unknown>).bold ?? (item as Record<string, unknown>).title ?? "",
          body: (item as Record<string, unknown>).body ?? (item as Record<string, unknown>).detail ?? "",
        };
      }
      return { bold: String(item), body: "" };
    });
  },
  z.array(z.object({ bold: z.string(), body: z.string() })),
);

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
  governingThought: z.string(),
  subtitle: z.string().default(""),
  insightBar: z.string().default(""),
  contentBrief: z.string().default(""),
});

const DeckSectionSchema = z.object({
  label: z.string(),
  slides: z.array(SlideOutlineSchema).min(1),
});

export const DeckOutlineSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  sections: z.array(DeckSectionSchema).min(2),
  totalSlides: z.number().int().min(3).max(40),
});

/* ── Phase 2: Content — Slide Bodies ────────────────────────────── */

const InsightBarSchema = z.preprocess(
  (val) => {
    if (typeof val === "string") return { label: val, detail: "" };
    if (val && typeof val === "object") {
      const o = val as Record<string, unknown>;
      return { label: o.label ?? o.bold ?? "", detail: o.detail ?? o.body ?? o.text ?? "" };
    }
    return { label: "", detail: "" };
  },
  z.object({ label: z.string(), detail: z.string() }),
);

const CoverBodySchema = z.preprocess(
  (val) => {
    if (val && typeof val === "object") {
      const o = val as Record<string, unknown>;
      return {
        ...o,
        title: o.title ?? o.heading ?? o.headline ?? o.name ?? "Proposal",
        clientName: o.clientName ?? o.client ?? o.companyName ?? "Client",
        preparedBy: o.preparedBy ?? o.author ?? o.prepared_by ?? "EyeOn",
        date: o.date ?? new Date().toISOString().split("T")[0],
      };
    }
    return val;
  },
  z.object({
    pattern: z.literal("cover"),
    title: z.string().default("Proposal"),
    subtitle: z.string().default(""),
    clientName: z.string().default("Client"),
    date: z.string().default(new Date().toISOString().split("T")[0]),
    preparedBy: z.string().default("EyeOn"),
  }),
);

const WaterfallBodySchema = z.object({
  pattern: z.literal("waterfall"),
  bars: z.array(z.object({
    label: z.string(),
    percentage: z.preprocess((v) => Number(v) || 0, z.number()),
    description: z.string().default(""),
    details: DetailItemsSchema.optional().default([]),
  })).min(1),
  target: z.object({ label: z.string(), description: z.string() }).optional(),
});

const GatedFlowBodySchema = z.object({
  pattern: z.literal("gated-flow"),
  phases: z.preprocess(
    (val) => {
      if (!Array.isArray(val)) return val;
      return val.map((phase, i) => {
        if (phase && typeof phase === "object") {
          const p = phase as Record<string, unknown>;
          return {
            ...p,
            number: p.number ?? p.phase ?? p.step ?? i + 1,
            title: p.title ?? p.name ?? p.label ?? `Phase ${i + 1}`,
            bullets: Array.isArray(p.bullets) ? p.bullets :
                     Array.isArray(p.items) ? p.items :
                     Array.isArray(p.steps) ? p.steps :
                     [`Phase ${i + 1}`],
          };
        }
        return phase;
      });
    },
    z.array(z.object({
      number: z.preprocess((v) => Number(v) || 0, z.number()),
      title: z.string(),
      bullets: z.array(z.string()).min(1),
      gate: z.string().optional(),
    })).min(1),
  ),
  details: z.array(z.object({
    column: z.number().int(),
    items: z.array(z.object({ bold: z.string(), body: z.string() })),
  })).optional(),
});

const PyramidBodySchema = z.object({
  pattern: z.literal("pyramid"),
  layers: z.array(z.object({
    label: z.string(),
    description: z.string().default(""),
    annotation: BoldBodySchema,
  })).min(2),
  leftAxis: z.string().optional(),
});

const StaircaseBodySchema = z.object({
  pattern: z.literal("staircase"),
  steps: z.array(z.object({
    title: z.string(),
    subtitle: z.string().default(""),
    annotation: BoldDetailSchema,
  })).min(2),
  scopeLabel: z.string().optional(),
});

const ArchitectureFlowBodySchema = z.object({
  pattern: z.literal("architecture-flow"),
  columns: z.preprocess(
    (val) => {
      if (!Array.isArray(val)) return val;
      return val.map((col) => {
        if (col && typeof col === "object") {
          const c = col as Record<string, unknown>;
          // Coerce cards from strings to objects
          let cards = c.cards ?? c.items ?? c.components ?? [];
          if (Array.isArray(cards)) {
            cards = (cards as unknown[]).map((card) => {
              if (typeof card === "string") return { title: card, subtitle: "" };
              if (card && typeof card === "object") {
                const cd = card as Record<string, unknown>;
                return {
                  ...cd,
                  title: cd.title ?? cd.name ?? cd.label ?? cd.text ?? "Card",
                  subtitle: cd.subtitle ?? cd.description ?? cd.detail ?? "",
                };
              }
              return { title: String(card ?? "Card"), subtitle: "" };
            });
          }
          return {
            ...c,
            zoneLabel: c.zoneLabel ?? c.zone ?? c.label ?? c.title ?? c.name ?? "Zone",
            cards,
          };
        }
        return col;
      });
    },
    z.array(z.object({
      zoneLabel: z.string(),
      containerTitle: z.string().optional(),
      cards: z.array(z.object({
        title: z.string(),
        subtitle: z.string().default(""),
        accentColor: z.string().optional(),
        dashed: z.boolean().optional(),
      })).min(1),
    })).min(1),
  ),
  legend: z.array(z.object({ color: z.string(), label: z.string() })).optional(),
});

const ContentCardsBodySchema = z.object({
  pattern: z.literal("content-cards"),
  cards: z.array(z.object({
    title: z.string(),
    body: z.string().default(""),
    accentColor: z.string().optional(),
    metric: z.object({ value: z.string(), label: z.string() }).optional(),
  })).min(1),
  columns: z.number().int().min(2).max(3).optional(),
});

const ComparisonMatrixBodySchema = z.object({
  pattern: z.literal("comparison-matrix"),
  headers: z.preprocess(
    (val) => {
      if (!Array.isArray(val)) return val;
      return val.map((h) => typeof h === "string" ? h : String(h ?? ""));
    },
    z.array(z.string()).min(2),
  ),
  rows: z.preprocess(
    (val) => {
      if (!Array.isArray(val)) return val;
      return val.map((row) => {
        if (row && typeof row === "object") {
          const r = row as Record<string, unknown>;
          // Coerce label from alternate field names
          const label = r.label ?? r.name ?? r.title ?? r.category ?? r.row ?? r.feature ?? "";
          // Coerce cells from alternate field names
          let cells = r.cells ?? r.values ?? r.columns ?? r.data ?? [];
          // If cells are strings, wrap them in {text} objects
          if (Array.isArray(cells)) {
            cells = (cells as unknown[]).map((c) => {
              if (typeof c === "string") return { text: c, highlight: false };
              if (typeof c === "boolean") return { text: c ? "✓" : "✗", highlight: c };
              if (c && typeof c === "object") {
                const co = c as Record<string, unknown>;
                return {
                  text: co.text ?? co.value ?? co.content ?? String(co.label ?? ""),
                  highlight: co.highlight ?? co.selected ?? co.active ?? false,
                };
              }
              return { text: String(c ?? ""), highlight: false };
            });
          }
          return { label: String(label), cells };
        }
        return row;
      });
    },
    z.array(z.object({
      label: z.string(),
      cells: z.array(z.object({
        text: z.string().default(""),
        highlight: z.boolean().optional(),
      })),
    })).min(1),
  ),
  footer: z.string().optional(),
});

const TimelineBodySchema = z.object({
  pattern: z.literal("timeline"),
  milestones: z.preprocess(
    (val) => {
      if (!Array.isArray(val)) return val;
      return val.map((m) => {
        if (m && typeof m === "object") {
          const ms = m as Record<string, unknown>;
          return {
            label: ms.label ?? ms.title ?? ms.name ?? ms.milestone ?? "Milestone",
            duration: ms.duration ?? ms.time ?? ms.weeks ?? ms.timeframe ?? "",
            description: ms.description ?? ms.detail ?? ms.details ?? ms.body ?? ms.text ?? "",
            highlighted: ms.highlighted ?? ms.highlight ?? ms.active ?? false,
          };
        }
        return m;
      });
    },
    z.array(z.object({
      label: z.string(),
      duration: z.string().default(""),
      description: z.string().default(""),
      highlighted: z.boolean().optional(),
    })).min(1),
  ),
  totalDuration: z.string().optional(),
});

const MetricsDashboardBodySchema = z.preprocess(
  (val) => {
    if (val && typeof val === "object" && !Array.isArray(val)) {
      const o = val as Record<string, unknown>;
      // Claude may use alternate names for the metrics array
      const metrics = o.metrics ?? o.kpis ?? o.stats ?? o.figures ?? o.items ?? o.data ?? o.numbers ?? [];
      return { ...o, metrics };
    }
    return val;
  },
  z.object({
    pattern: z.literal("metrics-dashboard"),
    metrics: z.preprocess(
      (val) => {
        if (!Array.isArray(val)) return val;
        return val.map((m) => {
          if (m && typeof m === "object") {
            const mt = m as Record<string, unknown>;
            return {
              value: mt.value ?? mt.number ?? mt.metric ?? mt.stat ?? mt.figure ?? "",
              label: mt.label ?? mt.title ?? mt.name ?? mt.description ?? "",
              sublabel: mt.sublabel ?? mt.subtitle ?? mt.detail ?? undefined,
              color: mt.color ?? mt.accentColor ?? undefined,
            };
          }
          return m;
        });
      },
      z.array(z.object({
        value: z.preprocess((v) => String(v ?? ""), z.string()),
        label: z.string().default(""),
        sublabel: z.string().optional(),
        color: z.string().optional(),
      })).min(1),
    ),
    bullets: z.array(z.string()).optional(),
  }),
);

const QuoteCalloutBodySchema = z.object({
  pattern: z.literal("quote-callout"),
  quote: z.string(),
  attribution: z.string().default(""),
  role: z.string().default(""),
  context: z.string().optional(),
});

/**
 * Manual pattern dispatch instead of z.union / z.discriminatedUnion.
 * z.union gives useless "Invalid input" errors when no variant matches,
 * and z.discriminatedUnion can't see through z.preprocess wrappers.
 * This reads the `pattern` field and routes directly to the correct schema,
 * giving clear error messages per pattern type.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PATTERN_SCHEMAS: Record<string, z.ZodType<any>> = {
  "cover": CoverBodySchema,
  "waterfall": WaterfallBodySchema,
  "gated-flow": GatedFlowBodySchema,
  "pyramid": PyramidBodySchema,
  "staircase": StaircaseBodySchema,
  "architecture-flow": ArchitectureFlowBodySchema,
  "content-cards": ContentCardsBodySchema,
  "comparison-matrix": ComparisonMatrixBodySchema,
  "timeline": TimelineBodySchema,
  "metrics-dashboard": MetricsDashboardBodySchema,
  "quote-callout": QuoteCalloutBodySchema,
};

const SlideBodySchema = z.any().transform((val, ctx) => {
  const pattern = val?.pattern;
  if (!pattern || typeof pattern !== "string") {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Missing or invalid 'pattern' field on slide body" });
    return z.NEVER;
  }
  const schema = PATTERN_SCHEMAS[pattern];
  if (!schema) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Unknown slide pattern: "${pattern}". Expected one of: ${Object.keys(PATTERN_SCHEMAS).join(", ")}` });
    return z.NEVER;
  }
  const result = schema.safeParse(val);
  if (!result.success) {
    for (const issue of result.error.issues) {
      ctx.addIssue(issue);
    }
    return z.NEVER;
  }
  return result.data;
});

const SlideContentSchema = z.object({
  id: z.string(),
  sectionLabel: z.string().default(""),
  governingThought: z.string().default(""),
  subtitle: z.string().default(""),
  insightBar: InsightBarSchema,
  body: SlideBodySchema,
});

export const DeckContentSchema = z.object({
  slides: z.array(SlideContentSchema).min(3),
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
