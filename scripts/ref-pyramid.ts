/**
 * Reference Implementation: Stacked Pyramid Layers (Tonies Slide 5)
 *
 * "AI Augments the Process — It Doesn't Replace It"
 *
 * Five horizontal bands growing wider from top to bottom (inverted pyramid),
 * with right-side annotations and vertical axis label.
 *
 * Run: npx tsx scripts/ref-pyramid.ts
 * Output: scripts/output/ref-pyramid.pptx
 */

import PptxGenJS from "pptxgenjs";
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";

// ── Shared Design System ─────────────────────────────────────────

const BRAND = {
  colors: {
    dark:       "0B1F3A",
    mid:        "1B3A5C",
    steel:      "2C5F8A",
    light:      "4A90C4",
    pale:       "A8C8E8",
    wash:       "E8F0F8",
    ice:        "F4F8FC",
    white:      "FFFFFF",
    black:      "1A1A1A",
    grey70:     "4D4D4D",
    grey50:     "808080",
    grey30:     "B3B3B3",
    grey10:     "E6E6E6",
    eyeonNavy:  "132C53",
    accent:     "C85A3A",
    accentBg:   "FDF0EC",
    accentBlue: "1B4F8A",
  },
  fonts: {
    heading: "Calibri Light",
    body:    "Calibri",
  },
  footer: "YEARS AHEAD",
} as const;

const SLIDE = {
  width:  13.33,
  height: 7.5,
  margin: { left: 0.45, right: 0.48, top: 0.11 },
  content: { left: 0.45, right: 12.85, top: 2.0, width: 12.4 },
} as const;

const EYEON_LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 85" width="200" height="85">
  <circle cx="28" cy="36" r="22" fill="none" stroke="#132C53" stroke-width="2.5"/>
  <circle cx="28" cy="36" r="10" fill="#132C53"/>
  <circle cx="28" cy="36" r="4" fill="#FFFFFF"/>
  <text x="58" y="48" font-family="Calibri, Arial, sans-serif" font-size="42" font-weight="700" fill="#132C53" letter-spacing="-1">eyeon</text>
  <text x="58" y="70" font-family="Calibri, Arial, sans-serif" font-size="11" fill="#132C53" letter-spacing="4" font-weight="300">YEARS AHEAD</text>
</svg>`;

function svgToBase64(svg: string): string {
  return `image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

// ── Chrome ────────────────────────────────────────────────────────

function addChrome(slide: PptxGenJS.Slide, pageNum: number): void {
  slide.background = { color: BRAND.colors.white };
  slide.addImage({
    data: svgToBase64(EYEON_LOGO_SVG),
    x: SLIDE.margin.left, y: SLIDE.margin.top + 0.05, w: 1.43, h: 0.61,
  });
  slide.addText(BRAND.footer, {
    x: SLIDE.margin.left, y: 7.04, w: 2.38, h: 0.23,
    fontSize: 8, fontFace: BRAND.fonts.heading, color: BRAND.colors.dark,
  });
  slide.addText(`PAGE ${pageNum}`, {
    x: 12.0, y: 7.04, w: 1.0, h: 0.23,
    fontSize: 8, fontFace: BRAND.fonts.heading, color: BRAND.colors.dark, align: "right",
  });
}

function addGoverningThought(
  slide: PptxGenJS.Slide,
  sectionLabel: string,
  title: string,
  subtitle: string,
): void {
  slide.addText(sectionLabel.toUpperCase(), {
    x: SLIDE.margin.left, y: 0.88, w: 5, h: 0.2,
    fontSize: 8.5, fontFace: BRAND.fonts.body, color: BRAND.colors.steel,
    bold: true, charSpacing: 2.5,
  });
  slide.addText(title, {
    x: SLIDE.margin.left, y: 1.08, w: 11.5, h: 0.42,
    fontSize: 20, fontFace: BRAND.fonts.heading, color: BRAND.colors.dark, bold: true,
  });
  slide.addText(subtitle, {
    x: SLIDE.margin.left, y: 1.52, w: 11.5, h: 0.3,
    fontSize: 11, fontFace: BRAND.fonts.body, color: BRAND.colors.grey50, italic: true,
  });
}

// ── Stacked Pyramid Layers ───────────────────────────────────────

interface PyramidLayer {
  title: string;
  description: string;     // Bullet points separated by " · "
  color: string;
  annotation: {
    bold: string;
    body: string;
  };
}

function renderStackedPyramid(
  slide: PptxGenJS.Slide,
  pptx: PptxGenJS,
  layers: PyramidLayer[],     // Top to bottom (narrowest first)
  leftAxisLabel: string,
): void {
  const count = layers.length;
  if (count === 0) return;

  // Layout
  const pyramidLeft = SLIDE.content.left + 0.6;   // Leave room for axis label
  const annotationRight = SLIDE.content.left + SLIDE.content.width;
  const annotationW = 2.8;                          // Width for right annotations
  const maxBoxW = annotationRight - pyramidLeft - annotationW - 0.3;
  const minBoxW = maxBoxW * 0.48;                   // Narrowest layer

  const layerH = 0.72;
  const layerGap = 0.12;
  const totalH = count * layerH + (count - 1) * layerGap;
  const startY = SLIDE.content.top + 0.15;

  // Draw layers from top (narrowest) to bottom (widest)
  layers.forEach((layer, i) => {
    // Width grows linearly from min to max
    const ratio = count > 1 ? i / (count - 1) : 1;
    const boxW = minBoxW + ratio * (maxBoxW - minBoxW);
    const boxY = startY + i * (layerH + layerGap);

    // Center the box (right-aligned to show growth)
    const boxX = pyramidLeft;

    // Layer box
    slide.addShape(pptx.ShapeType.roundRect, {
      x: boxX,
      y: boxY,
      w: boxW,
      h: layerH,
      fill: { color: layer.color },
      rectRadius: 0.04,
      shadow: {
        type: "outer",
        blur: 2,
        offset: 1,
        color: "000000",
        opacity: 0.08,
      },
    });

    // Title — bold white, left-aligned
    slide.addText(layer.title, {
      x: boxX + 0.2,
      y: boxY + 0.08,
      w: boxW - 0.4,
      h: 0.22,
      fontSize: 10.5,
      fontFace: BRAND.fonts.body,
      color: BRAND.colors.white,
      bold: true,
    });

    // Description — smaller, light color
    slide.addText(layer.description, {
      x: boxX + 0.2,
      y: boxY + 0.32,
      w: boxW - 0.4,
      h: 0.32,
      fontSize: 8.5,
      fontFace: BRAND.fonts.body,
      color: BRAND.colors.pale,
      lineSpacingMultiple: 1.15,
    });

    // Right-side annotation — dashed line connector + text
    const annotX = annotationRight - annotationW;
    const connY = boxY + layerH / 2;

    // Dashed connector line from box edge to annotation
    slide.addShape(pptx.ShapeType.line, {
      x: boxX + boxW + 0.05,
      y: connY,
      w: annotX - (boxX + boxW) - 0.1,
      h: 0,
      line: {
        color: BRAND.colors.grey30,
        width: 0.5,
        dashType: "dash",
      },
    });

    // Annotation text
    slide.addText(layer.annotation.bold, {
      x: annotX,
      y: boxY + 0.05,
      w: annotationW,
      h: 0.2,
      fontSize: 9.5,
      fontFace: BRAND.fonts.body,
      color: BRAND.colors.dark,
      bold: true,
    });
    slide.addText(layer.annotation.body, {
      x: annotX,
      y: boxY + 0.25,
      w: annotationW,
      h: 0.42,
      fontSize: 8.5,
      fontFace: BRAND.fonts.body,
      color: BRAND.colors.grey70,
      lineSpacingMultiple: 1.15,
    });
  });

  // ── Left Axis Label (vertical text) ──
  // PptxGenJS doesn't support rotation on text boxes easily,
  // so we use a shape with rotated text
  const axisX = SLIDE.content.left;
  const axisY = startY + totalH / 2 - 0.5;

  slide.addText(leftAxisLabel, {
    x: axisX,
    y: axisY,
    w: 0.45,
    h: 1.0,
    fontSize: 8,
    fontFace: BRAND.fonts.body,
    color: BRAND.colors.grey50,
    bold: true,
    charSpacing: 1.5,
    align: "center",
    valign: "middle",
    rotate: 270,
  });

  // Arrow pointing up along left axis
  slide.addShape(pptx.ShapeType.line, {
    x: axisX + 0.22,
    y: startY - 0.05,
    w: 0,
    h: totalH + 0.1,
    line: {
      color: BRAND.colors.grey30,
      width: 0.7,
      beginArrowType: "arrow",
    },
  });
}

// ── Context Banner ───────────────────────────────────────────────

function addContextBanner(
  slide: PptxGenJS.Slide,
  pptx: PptxGenJS,
  label: string,
  detail: string,
): void {
  const bannerY = 6.5;
  slide.addShape(pptx.ShapeType.roundRect, {
    x: SLIDE.content.left, y: bannerY,
    w: SLIDE.content.width, h: 0.38,
    fill: { color: BRAND.colors.accentBg },
    rectRadius: 0.03,
    line: { color: BRAND.colors.accent, width: 0.3, transparency: 60 },
  });
  slide.addText(
    [
      { text: `${label}: `, options: { bold: true, color: BRAND.colors.accent, fontSize: 9 } },
      { text: detail, options: { color: BRAND.colors.grey70, fontSize: 9 } },
    ],
    {
      x: SLIDE.content.left + 0.15, y: bannerY,
      w: SLIDE.content.width - 0.3, h: 0.38,
      fontFace: BRAND.fonts.body, valign: "middle",
    },
  );
}

// ── Footnote ─────────────────────────────────────────────────────

function addFootnote(slide: PptxGenJS.Slide, text: string): void {
  slide.addText(text, {
    x: SLIDE.content.left,
    y: 6.92,
    w: SLIDE.content.width,
    h: 0.15,
    fontSize: 7.5,
    fontFace: BRAND.fonts.body,
    color: BRAND.colors.grey50,
    italic: true,
    align: "center",
  });
}

// ── Build ────────────────────────────────────────────────────────

async function main() {
  const pptx = new PptxGenJS();
  pptx.defineLayout({ name: "WIDESCREEN", width: SLIDE.width, height: SLIDE.height });
  pptx.layout = "WIDESCREEN";

  const slide = pptx.addSlide();

  // Chrome
  addChrome(slide, 22);
  addGoverningThought(
    slide,
    "AI Philosophy",
    "AI Augments the Process — It Doesn't Replace It",
    "Each AI layer activates only when the layer below is stable. Rushing to agents without clean data creates noise, not insight.",
  );

  // Pyramid layers (top = narrowest/most advanced, bottom = widest/foundation)
  renderStackedPyramid(
    slide,
    pptx,
    [
      {
        title: "ANAPLAN AGENTS",
        description: "Autonomous exception handling · Scenario generation · Recommended actions · Human-in-the-loop",
        color: "0B1F3A",
        annotation: { bold: "Roadmap", body: "Activated when planning process is mature" },
      },
      {
        title: "AI ANALYST",
        description: "Natural language queries · Anomaly explanation · Root cause surfacing · \"Why did DACH spike in Q3?\"",
        color: "132C53",
        annotation: { bold: "New in 2025–26", body: "Conversational planning interface for all users" },
      },
      {
        title: "PLANIQ FORECASTER",
        description: "ML ensemble models · External signal ingestion (weather, macro, events) · Auto-model selection on Polaris",
        color: "1B3A5C",
        annotation: { bold: "Anaplan native", body: "Polaris engine, built-in ML on SCM standard app" },
      },
      {
        title: "STATISTICAL BASELINE",
        description: "Time-series algorithms · Seasonality & trend decomposition · Measurable forecast accuracy (MAPE / bias)",
        color: "2C5F8A",
        annotation: { bold: "Prove accuracy", body: "Measurable baseline before ML layers activate" },
      },
      {
        title: "CLEAN DATA & INTEGRATION",
        description: "Master data governance · Automated ERP feeds · Single source of truth across 7 markets",
        color: "4A7DAF",
        annotation: { bold: "Prerequisite", body: "Without clean data, AI amplifies errors" },
      },
    ],
    "AI MATURITY",
  );

  // Context banner
  addContextBanner(
    slide,
    pptx,
    "EyeOn philosophy",
    "AI without process is automation of chaos. We activate Statistical and PlanIQ Forecaster in the 35-week programme. AI Analyst and Agents activate as the planning cadence stabilises and users build confidence.",
  );

  // Footnote
  addFootnote(slide, "Activated in 35-week programme");

  // Write
  const outDir = join(__dirname, "output");
  mkdirSync(outDir, { recursive: true });
  const buffer = await pptx.write({ outputType: "nodebuffer" }) as Buffer;
  writeFileSync(join(outDir, "ref-pyramid.pptx"), buffer);
  console.log("✅ Generated: scripts/output/ref-pyramid.pptx");
}

main().catch(console.error);
