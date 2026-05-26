/**
 * Reference Implementation: Proportional Staircase (Tonies Slide 1)
 *
 * "The Platform Works — The Operating Model Doesn't"
 *
 * Three boxes sized by proportion (70/20/10%) staggered downward,
 * with target outcome on the right and context banner below.
 *
 * Run: npx tsx scripts/ref-staircase.ts
 * Output: scripts/output/ref-staircase.pptx
 */

import PptxGenJS from "pptxgenjs";
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";

// ── Shared Design System (will become design-system.ts) ──────────

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
    x: SLIDE.margin.left, y: SLIDE.margin.top + 0.05,
    w: 1.43, h: 0.61,
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

// ── Proportional Staircase Pattern ───────────────────────────────

interface StaircaseStep {
  title: string;
  percentage: string;
  description: string;
  color: string;           // Fill color for the box
  annotation: {
    bold: string;
    detail: string;
  };
}

interface TargetOutcome {
  title: string;
  bullets: string[];
}

function renderProportionalStaircase(
  slide: PptxGenJS.Slide,
  pptx: PptxGenJS,
  steps: StaircaseStep[],
  target: TargetOutcome,
): void {
  const count = steps.length;
  if (count === 0) return;

  // Layout: boxes are stacked in a descending staircase pattern
  // Each box width represents the proportion (70% = wider than 20%)
  // Y position descends for each step

  const contentLeft = SLIDE.content.left;
  const maxBoxW = 7.5;    // Maximum box width (for the largest step)
  const maxBoxH = 2.8;    // Maximum box height (for the largest step)
  const minBoxH = 1.1;    // Minimum box height (for smallest step)
  const startY = SLIDE.content.top + 0.15;
  const xGap = 0.25;      // Gap between steps horizontally

  // Calculate proportional sizes
  const percentages = steps.map((s) => parseInt(s.percentage.replace(/[^0-9]/g, "")) || 10);
  const maxPct = Math.max(...percentages);

  // Staircase layout: each step shifts right and down
  let currentX = contentLeft;

  steps.forEach((step, i) => {
    const pct = percentages[i];
    const ratio = pct / maxPct;

    // Box dimensions scale with proportion
    const boxW = 2.6 + (ratio * 0.8);  // Wider for larger proportions
    const boxH = minBoxH + ratio * (maxBoxH - minBoxH);  // Taller for larger proportions

    // Y position: each step descends (aligns bottom)
    const bottomY = startY + maxBoxH;
    const boxY = bottomY - boxH;

    // Box with rounded corners and shadow
    slide.addShape(pptx.ShapeType.roundRect, {
      x: currentX,
      y: boxY,
      w: boxW,
      h: boxH,
      fill: { color: step.color },
      rectRadius: 0.05,
      shadow: {
        type: "outer",
        blur: 3,
        offset: 1.5,
        color: "000000",
        opacity: 0.1,
      },
    });

    // Title — bold, white, caps
    slide.addText(step.title, {
      x: currentX + 0.25,
      y: boxY + 0.2,
      w: boxW - 0.5,
      h: 0.3,
      fontSize: 16,
      fontFace: BRAND.fonts.body,
      color: BRAND.colors.white,
      bold: true,
      align: "center",
    });

    // Percentage
    slide.addText(step.percentage, {
      x: currentX + 0.25,
      y: boxY + 0.52,
      w: boxW - 0.5,
      h: 0.28,
      fontSize: 14,
      fontFace: BRAND.fonts.heading,
      color: BRAND.colors.pale,
      align: "center",
    });

    // Description (only if box is tall enough)
    if (boxH > 1.5) {
      slide.addText(step.description, {
        x: currentX + 0.25,
        y: boxY + boxH - 0.65,
        w: boxW - 0.5,
        h: 0.4,
        fontSize: 9.5,
        fontFace: BRAND.fonts.body,
        color: BRAND.colors.pale,
        align: "center",
        lineSpacingMultiple: 1.2,
      });
    }

    // Annotation below box
    const annotY = bottomY + 0.15;
    slide.addText(step.annotation.bold, {
      x: currentX,
      y: annotY,
      w: boxW,
      h: 0.2,
      fontSize: 9,
      fontFace: BRAND.fonts.body,
      color: BRAND.colors.dark,
      bold: true,
    });
    slide.addText(step.annotation.detail, {
      x: currentX,
      y: annotY + 0.18,
      w: boxW,
      h: 0.55,
      fontSize: 8.5,
      fontFace: BRAND.fonts.body,
      color: BRAND.colors.grey70,
      lineSpacingMultiple: 1.2,
    });

    currentX += boxW + xGap;
  });

  // ── Equals sign ──
  const equalsX = currentX - 0.05;
  const equalsY = startY + maxBoxH / 2;
  slide.addText("=", {
    x: equalsX,
    y: equalsY - 0.15,
    w: 0.4,
    h: 0.3,
    fontSize: 24,
    fontFace: BRAND.fonts.heading,
    color: BRAND.colors.dark,
    bold: true,
    align: "center",
    valign: "middle",
  });

  // ── Target outcome box (dashed border) ──
  const targetX = equalsX + 0.55;
  const targetW = SLIDE.content.width - (targetX - SLIDE.content.left);
  const targetH = 1.6;
  const targetY = startY + (maxBoxH - targetH) / 2;

  slide.addShape(pptx.ShapeType.roundRect, {
    x: targetX,
    y: targetY,
    w: targetW,
    h: targetH,
    fill: { color: BRAND.colors.white },
    rectRadius: 0.05,
    line: {
      color: BRAND.colors.dark,
      width: 1.2,
      dashType: "dash",
    },
  });

  // Target title
  slide.addText(target.title, {
    x: targetX + 0.2,
    y: targetY + 0.15,
    w: targetW - 0.4,
    h: 0.35,
    fontSize: 13,
    fontFace: BRAND.fonts.body,
    color: BRAND.colors.dark,
    bold: true,
    align: "center",
  });

  // Target bullets
  const bulletText = target.bullets.join("\n");
  slide.addText(bulletText, {
    x: targetX + 0.2,
    y: targetY + 0.55,
    w: targetW - 0.4,
    h: targetH - 0.75,
    fontSize: 9,
    fontFace: BRAND.fonts.body,
    color: BRAND.colors.grey70,
    align: "center",
    lineSpacingMultiple: 1.4,
  });
}

// ── Context Banner ───────────────────────────────────────────────

function addContextBanner(
  slide: PptxGenJS.Slide,
  pptx: PptxGenJS,
  label: string,
  detail: string,
): void {
  const bannerY = 6.0;
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

// ── "What Was Missing" Section ───────────────────────────────────

function addWhatWasMissing(
  slide: PptxGenJS.Slide,
  items: Array<{ bold: string; body: string }>,
): void {
  const y = 6.45;
  const colW = SLIDE.content.width / items.length;

  items.forEach((item, i) => {
    const x = SLIDE.content.left + i * colW;

    slide.addText(item.bold, {
      x, y, w: colW - 0.3, h: 0.18,
      fontSize: 9, fontFace: BRAND.fonts.body,
      color: BRAND.colors.accent, bold: true,
    });
    slide.addText(item.body, {
      x, y: y + 0.18, w: colW - 0.3, h: 0.35,
      fontSize: 8.5, fontFace: BRAND.fonts.body,
      color: BRAND.colors.grey70, lineSpacingMultiple: 1.2,
    });
  });
}

// ── Build the Slide ──────────────────────────────────────────────

async function main() {
  const pptx = new PptxGenJS();
  pptx.defineLayout({ name: "WIDESCREEN", width: SLIDE.width, height: SLIDE.height });
  pptx.layout = "WIDESCREEN";

  const slide = pptx.addSlide();

  // Chrome
  addChrome(slide, 20);
  addGoverningThought(
    slide,
    "Our Approach",
    "The Platform Works — The Operating Model Doesn't",
    "No one was trained. No process was redesigned. Excel stayed. The previous partner configured technology without building the planning process around it.",
  );

  // Proportional staircase
  renderProportionalStaircase(
    slide,
    pptx,
    [
      {
        title: "RECOVER",
        percentage: "~70%",
        description: "Process capability\nalready in platform",
        color: "0B1F3A",
        annotation: {
          bold: "Standard planning workflow",
          detail: "Stat baseline, exception review, consensus cycle — the core planning process is configured\nDemand hierarchy structure",
        },
      },
      {
        title: "REWIRE",
        percentage: "~20%",
        description: "Adapt process to\ntonies® context",
        color: "1B3A5C",
        annotation: {
          bold: "tonies® planning cadence",
          detail: "DACH 3+9 rolling forecast rhythm mapped to S&OP calendar\nMulti-market decision rights",
        },
      },
      {
        title: "BUILD",
        percentage: "~10%",
        description: "",
        color: "5B7FA5",
        annotation: {
          bold: "Driver-based planning process",
          detail: "Toniebox installed-base → figurine attach rate logic\nCPFR collaboration process",
        },
      },
    ],
    {
      title: "TARGET\nOPERATING MODEL",
      bullets: [
        "34 users · 7 markets",
        "Monthly S&OP cadence",
        "Demand → Supply → Finance",
      ],
    },
  );

  // Context banner
  addContextBanner(
    slide,
    pptx,
    "tonies® context",
    "34 licensed users, 0% active adoption for 18+ months. Anaplan contract expires May 2027 — that gives a 10-month window from June 29 start to prove the platform earns its renewal.",
  );

  // "What was missing" section
  addWhatWasMissing(slide, [
    { bold: "What was missing", body: "Operating model, decision rights, training, process ownership — none of it was delivered." },
    { bold: "NPI launch governance", body: "Stage-gate process for new product introductions" },
    { bold: "Volume × price × mix waterfall", body: "Connecting demand to P&L" },
  ]);

  // Write
  const outDir = join(__dirname, "output");
  mkdirSync(outDir, { recursive: true });
  const buffer = await pptx.write({ outputType: "nodebuffer" }) as Buffer;
  writeFileSync(join(outDir, "ref-staircase.pptx"), buffer);
  console.log("✅ Generated: scripts/output/ref-staircase.pptx");
}

main().catch(console.error);
