/**
 * Deck Composer — Brand Assets & Configuration
 *
 * Base64-encoded logo and brand configuration for serverless compatibility.
 * The EyeOn logo SVG is converted to a simplified version suitable for
 * PptxGenJS rendering (which requires PNG base64 or simple SVG).
 */

import type { BrandConfig } from "./types";

/**
 * EyeOn brand colors — navy monochrome palette.
 * Based on the McKinsey handoff doc but using EyeOn's primary #132C53.
 */
const COLORS = {
  dark:      "0B1F3A",
  mid:       "1B3A5C",
  steel:     "2C5F8A",
  light:     "4A90C4",
  pale:      "A8C8E8",
  wash:      "E8F0F8",
  ice:       "F4F8FC",
  white:     "FFFFFF",
  black:     "1A1A1A",
  grey70:    "4D4D4D",
  grey50:    "808080",
  grey30:    "B3B3B3",
  grey10:    "E6E6E6",
  eyeonNavy: "132C53",
  accent:    "C85A3A",
  accentBg:  "FDF0EC",
  accentBlue: "1B4F8A",
} as const;

/**
 * Simplified EyeOn wordmark as SVG for PPTX embedding.
 * PptxGenJS supports SVG data URIs for images.
 * This is a compact representation of "eyeon" + "YEARS AHEAD".
 */
const EYEON_LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 85" width="200" height="85">
  <text x="10" y="48" font-family="Calibri, Arial, sans-serif" font-size="42" font-weight="700" fill="#132C53" letter-spacing="-1">eyeon</text>
  <text x="10" y="70" font-family="Calibri, Arial, sans-serif" font-size="11" fill="#132C53" letter-spacing="4" font-weight="300">YEARS AHEAD</text>
</svg>`;

/**
 * Convert SVG string to base64 data URI for PptxGenJS.
 */
function svgToBase64(svg: string): string {
  const encoded = Buffer.from(svg).toString("base64");
  return `image/svg+xml;base64,${encoded}`;
}

/**
 * Build the brand configuration used by chrome and pattern renderers.
 */
export function getBrandConfig(): BrandConfig {
  return {
    logoBase64: svgToBase64(EYEON_LOGO_SVG),
    colors: { ...COLORS },
    fonts: {
      heading: "Calibri Light",
      body: "Calibri",
    },
    footer: "YEARS AHEAD",
  };
}

/**
 * Category colors for section-coded slides.
 * Matches the Orion UI category color scheme.
 */
export const CATEGORY_COLORS: Record<string, string> = {
  technical:   "7B6FAB",
  functional:  "5D7FA3",
  methodology: "7A9461",
  team:        "A68458",
  pricing:     "B26B58",
  references:  "B09558",
  general:     "6B7B8D",
};

/**
 * Slide dimensions — widescreen 16:9.
 */
export const SLIDE = {
  width:  13.33,
  height: 7.5,
  margin: {
    left:   0.45,
    right:  0.48,
    top:    0.11,
    bottom: 0.46,
  },
  content: {
    left:   0.45,
    right:  12.85,
    top:    2.0,
    bottom: 6.4,
    width:  12.4,
    height: 4.4,
  },
} as const;
