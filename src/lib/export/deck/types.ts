/**
 * Deck Composer — Type Definitions
 *
 * Core types for the AI-powered PPTX proposal deck generation system.
 * Uses discriminated unions for slide body variants so each pattern
 * renderer gets strongly-typed data.
 */

/* ── Brand & Chrome ─────────────────────────────────────────────── */

export interface BrandConfig {
  logoBase64: string; // PNG base64 of EyeOn logo
  colors: {
    dark: string;   // 0B1F3A — primary navy
    mid: string;    // 1B3A5C
    steel: string;  // 2C5F8A
    light: string;  // 4A90C4
    pale: string;   // A8C8E8
    wash: string;   // E8F0F8
    ice: string;    // F4F8FC
    white: string;  // FFFFFF
    black: string;  // 1A1A1A
    grey70: string; // 4D4D4D
    grey50: string; // 808080
    grey30: string; // B3B3B3
    grey10: string; // E6E6E6
    eyeonNavy: string; // 132C53 — EyeOn brand primary
    accent: string;    // C85A3A — warm terracotta for urgent banners
    accentBg: string;  // FDF0EC — light coral background
    accentBlue: string; // 1B4F8A — blue for "EyeOn advantage" text
  };
  fonts: {
    heading: string;  // Calibri Light
    body: string;     // Calibri
  };
  footer: string; // "YEARS AHEAD"
}

/* ── Request / Response ─────────────────────────────────────────── */

export interface DeckRequest {
  /** RFP questions with their generated responses (optional — may be absent for document-only RFPs) */
  questions?: Array<{
    id: string;
    text: string;
    category: string;
    response: string;
    wordCount: number;
    score?: number;
  }>;
  /** Raw RFP documents — uploaded PDFs, DOCXs, or pasted text that Claude should analyze */
  documents?: Array<{
    name: string;
    content: string;
    wordCount: number;
  }>;
  /** Client context */
  client: {
    companyName: string;
    industry: string;
    size?: string;
    region?: string;
    painPoints?: string[];
  };
  /** Costing data (if available) */
  costing?: {
    totalCost: number;
    currency: string;
    phases: Array<{
      name: string;
      weeks: number;
      cost: number;
    }>;
    teamRoles: Array<{
      role: string;
      rate: number;
      days: number;
    }>;
    licensing?: {
      tier: string;
      annualCost: number;
    };
  };
  /** Competitive intelligence context */
  competitiveContext?: string;
  /** Engagement metadata */
  engagementName?: string;
  modules?: string[];
}

/* ── AI Output: Outline (Phase 1) ───────────────────────────────── */

export interface DeckOutline {
  title: string;
  subtitle: string;
  sections: DeckSection[];
  totalSlides: number;
}

export interface DeckSection {
  label: string; // e.g. "EXECUTIVE SUMMARY", "OUR APPROACH"
  slides: SlideOutline[];
}

export interface SlideOutline {
  /** Unique ID for tracking */
  id: string;
  /** Visual pattern to use */
  pattern: PatternType;
  /** The assertive governing thought (max 1 line) */
  governingThought: string;
  /** Supporting subtitle (italic, grey) */
  subtitle: string;
  /** Client-specific insight bar text */
  insightBar: string;
  /** Brief description of what data to show */
  contentBrief: string;
}

/* ── Pattern Types ──────────────────────────────────────────────── */

export type PatternType =
  | "cover"
  | "waterfall"
  | "gated-flow"
  | "pyramid"
  | "staircase"
  | "architecture-flow"
  | "content-cards"
  | "comparison-matrix"
  | "timeline"
  | "metrics-dashboard"
  | "quote-callout";

/* ── AI Output: Content (Phase 2) ───────────────────────────────── */

export interface DeckContent {
  slides: SlideContent[];
}

export interface SlideContent {
  id: string;
  sectionLabel: string;
  governingThought: string;
  subtitle: string;
  insightBar: InsightBar;
  body: SlideBody;
}

export interface InsightBar {
  label: string;  // Bold prefix
  detail: string; // Grey body text
  variant?: "wash" | "accent"; // Visual style — default "wash", "accent" for coral/red banners
}

/* ── Slide Body: Discriminated Union ────────────────────────────── */

export type SlideBody =
  | CoverBody
  | WaterfallBody
  | GatedFlowBody
  | PyramidBody
  | StaircaseBody
  | ArchitectureFlowBody
  | ContentCardsBody
  | ComparisonMatrixBody
  | TimelineBody
  | MetricsDashboardBody
  | QuoteCalloutBody;

export interface CoverBody {
  pattern: "cover";
  title: string;
  subtitle: string;
  clientName: string;
  date: string;
  preparedBy: string;
}

export interface WaterfallBody {
  pattern: "waterfall";
  bars: Array<{
    label: string;
    percentage: number;
    description: string;
    details: Array<{ bold: string; body: string }>;
  }>;
  /** Optional outcome/target bar (dashed) */
  target?: { label: string; description: string };
}

export interface GatedFlowBody {
  pattern: "gated-flow";
  phases: Array<{
    number: number;
    title: string;
    bullets: string[];
    gate?: string;
    duration?: string; // e.g. "Weeks 1-5"
  }>;
  details?: Array<{
    column: number;
    items: Array<{ bold: string; body: string }>;
  }>;
}

export interface PyramidBody {
  pattern: "pyramid";
  layers: Array<{
    label: string;
    description: string;
    annotation: { bold: string; body: string };
  }>;
  leftAxis?: string; // e.g. "MATURITY"
}

export interface StaircaseBody {
  pattern: "staircase";
  steps: Array<{
    title: string;
    subtitle: string;
    annotation: { bold: string; detail: string };
  }>;
  scopeLabel?: string;
}

export interface ArchitectureFlowBody {
  pattern: "architecture-flow";
  columns: Array<{
    zoneLabel: string;
    containerTitle?: string;
    cards: Array<{
      title: string;
      subtitle: string;
      accentColor?: string;
      dashed?: boolean;
    }>;
  }>;
  legend?: Array<{ color: string; label: string }>;
}

export interface ContentCardsBody {
  pattern: "content-cards";
  cards: Array<{
    title: string;
    body: string;
    accentColor?: string;
    metric?: { value: string; label: string };
  }>;
  /** 2 or 3 columns */
  columns?: number;
}

export interface ComparisonMatrixBody {
  pattern: "comparison-matrix";
  headers: string[];
  rows: Array<{
    label: string;
    cells: Array<{
      text: string;
      highlight?: boolean;
    }>;
  }>;
  footer?: string;
}

export interface TimelineBody {
  pattern: "timeline";
  milestones: Array<{
    label: string;
    duration: string;
    description: string;
    highlighted?: boolean;
  }>;
  totalDuration?: string;
}

export interface MetricsDashboardBody {
  pattern: "metrics-dashboard";
  metrics: Array<{
    value: string;
    label: string;
    sublabel?: string;
    color?: string;
  }>;
  /** Below the metrics: supporting bullet points */
  bullets?: string[];
}

export interface QuoteCalloutBody {
  pattern: "quote-callout";
  quote: string;
  attribution: string;
  role: string;
  context?: string;
}

/* ── Pattern Renderer Interface ─────────────────────────────────── */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PptxSlide = any; // PptxGenJS slide type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PptxInstance = any; // PptxGenJS instance type

export interface PatternRenderer {
  pattern: PatternType;
  render(
    slide: PptxSlide,
    pptx: PptxInstance,
    body: SlideBody,
    brand: BrandConfig,
  ): void;
}

/* ── Generation Progress ────────────────────────────────────────── */

export type DeckGenerationStage =
  | "preparing"
  | "generating-outline"
  | "generating-content"
  | "rendering-slides"
  | "complete"
  | "error";

export interface DeckGenerationProgress {
  stage: DeckGenerationStage;
  message: string;
  slidesRendered?: number;
  totalSlides?: number;
}
