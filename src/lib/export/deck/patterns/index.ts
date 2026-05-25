/**
 * Pattern Registry
 *
 * Maps PatternType to its renderer function.
 * Each renderer takes a PptxGenJS slide, the pptx instance, typed body data,
 * and brand config, then adds shapes/text to the slide.
 */

import type { PatternType, SlideBody, BrandConfig, PptxSlide, PptxInstance } from "../types";
import { renderCover } from "./cover";
import { renderWaterfall } from "./waterfall";
import { renderGatedFlow } from "./gated-flow";
import { renderPyramid } from "./pyramid";
import { renderStaircase } from "./staircase";
import { renderArchitectureFlow } from "./architecture-flow";
import { renderContentCards } from "./content-cards";
import { renderComparisonMatrix } from "./comparison-matrix";
import { renderTimeline } from "./timeline";
import { renderMetricsDashboard } from "./metrics-dashboard";
import { renderQuoteCallout } from "./quote-callout";

type RendererFn = (
  slide: PptxSlide,
  pptx: PptxInstance,
  body: SlideBody,
  brand: BrandConfig,
) => void;

/**
 * Pattern renderer registry.
 * Each renderer is typed loosely here but expects the correct body variant
 * (enforced by the discriminated union's `pattern` field).
 */
const REGISTRY: Record<PatternType, RendererFn> = {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  "cover":              renderCover as any,
  "waterfall":          renderWaterfall as any,
  "gated-flow":         renderGatedFlow as any,
  "pyramid":            renderPyramid as any,
  "staircase":          renderStaircase as any,
  "architecture-flow":  renderArchitectureFlow as any,
  "content-cards":      renderContentCards as any,
  "comparison-matrix":  renderComparisonMatrix as any,
  "timeline":           renderTimeline as any,
  "metrics-dashboard":  renderMetricsDashboard as any,
  "quote-callout":      renderQuoteCallout as any,
  /* eslint-enable @typescript-eslint/no-explicit-any */
};

/**
 * Render a slide body using the appropriate pattern renderer.
 * Falls back to content-cards for unknown patterns.
 */
export function renderPattern(
  slide: PptxSlide,
  pptx: PptxInstance,
  body: SlideBody,
  brand: BrandConfig,
): void {
  const renderer = REGISTRY[body.pattern];
  if (renderer) {
    renderer(slide, pptx, body, brand);
  } else {
    console.warn(`Unknown pattern "${body.pattern}", falling back to content-cards`);
    // Fallback: render as a simple text slide
    slide.addText(`[Pattern "${body.pattern}" not implemented]`, {
      x: 0.45,
      y: 3.5,
      w: 12.4,
      h: 0.5,
      fontSize: 14,
      fontFace: brand.fonts.body,
      color: brand.colors.grey50,
      align: "center",
    });
  }
}

/**
 * Get the list of all available pattern types.
 */
export function getAvailablePatterns(): PatternType[] {
  return Object.keys(REGISTRY) as PatternType[];
}
