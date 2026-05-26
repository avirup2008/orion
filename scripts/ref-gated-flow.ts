/**
 * Reference Implementation: Gated-Flow (Tonies Slide 2)
 *
 * "Process First, Then Technology: Three Phases of Transformation"
 *
 * This proves PptxGenJS can match consulting-quality slide design.
 * Run: npx tsx scripts/ref-gated-flow.ts
 * Output: scripts/output/ref-gated-flow.pptx
 */

import PptxGenJS from "pptxgenjs";
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";

// ── EyeOn Design System ──────────────────────────────────────────
// Extracted from Tonies ARC proposal deck analysis

const BRAND = {
  colors: {
    // Core navy palette
    dark:      "0B1F3A",  // Primary dark navy — phase boxes, titles
    mid:       "1B3A5C",  // Secondary navy
    steel:     "2C5F8A",  // Tertiary steel blue
    light:     "4A90C4",  // Light accent blue
    pale:      "A8C8E8",  // Pale blue for subtle elements
    wash:      "E8F0F8",  // Wash background for insight bars
    ice:       "F4F8FC",  // Ice background
    white:     "FFFFFF",
    black:     "1A1A1A",

    // Greys
    grey70:    "4D4D4D",
    grey50:    "808080",
    grey30:    "B3B3B3",
    grey10:    "E6E6E6",

    // EyeOn brand
    eyeonNavy: "132C53",

    // Accent — context banner (red/coral from Tonies deck)
    accent:    "C85A3A",  // Warm terracotta for urgent banners
    accentBg:  "FDF0EC",  // Light coral background for banners
    accentBlue: "1B4F8A", // Blue accent for "EyeOn advantage" text
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
  content: {
    left:   0.45,
    right:  12.85,
    top:    2.0,
    width:  12.4,
  },
} as const;

// ── Logo SVG ─────────────────────────────────────────────────────

const EYEON_LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 85" width="200" height="85">
  <circle cx="28" cy="36" r="22" fill="none" stroke="#132C53" stroke-width="2.5"/>
  <circle cx="28" cy="36" r="10" fill="#132C53"/>
  <circle cx="28" cy="36" r="4" fill="#FFFFFF"/>
  <text x="58" y="48" font-family="Calibri, Arial, sans-serif" font-size="42" font-weight="700" fill="#132C53" letter-spacing="-1">eyeon</text>
  <text x="58" y="70" font-family="Calibri, Arial, sans-serif" font-size="11" fill="#132C53" letter-spacing="4" font-weight="300">YEARS AHEAD</text>
</svg>`;

function svgToBase64(svg: string): string {
  const encoded = Buffer.from(svg).toString("base64");
  return `image/svg+xml;base64,${encoded}`;
}

// ── Chrome: Logo + Footer + Page Number ──────────────────────────

function addChrome(slide: PptxGenJS.Slide, pageNum: number): void {
  slide.background = { color: BRAND.colors.white };

  // Logo
  slide.addImage({
    data: svgToBase64(EYEON_LOGO_SVG),
    x: SLIDE.margin.left,
    y: SLIDE.margin.top + 0.05,
    w: 1.43,
    h: 0.61,
  });

  // Footer — "YEARS AHEAD"
  slide.addText(BRAND.footer, {
    x: SLIDE.margin.left,
    y: 7.04,
    w: 2.38,
    h: 0.23,
    fontSize: 8,
    fontFace: BRAND.fonts.heading,
    color: BRAND.colors.dark,
  });

  // Page number
  slide.addText(`PAGE ${pageNum}`, {
    x: 12.0,
    y: 7.04,
    w: 1.0,
    h: 0.23,
    fontSize: 8,
    fontFace: BRAND.fonts.heading,
    color: BRAND.colors.dark,
    align: "right",
  });
}

// ── Chrome: Governing Thought Header ─────────────────────────────

function addGoverningThought(
  slide: PptxGenJS.Slide,
  sectionLabel: string,
  title: string,
  subtitle: string,
): void {
  // Section label — small caps, letter-spaced, navy
  slide.addText(sectionLabel.toUpperCase(), {
    x: SLIDE.margin.left,
    y: 0.88,
    w: 5,
    h: 0.2,
    fontSize: 8.5,
    fontFace: BRAND.fonts.body,
    color: BRAND.colors.steel,
    bold: true,
    charSpacing: 2.5,
  });

  // Assertive headline
  slide.addText(title, {
    x: SLIDE.margin.left,
    y: 1.08,
    w: 11.5,
    h: 0.42,
    fontSize: 20,
    fontFace: BRAND.fonts.heading,
    color: BRAND.colors.dark,
    bold: true,
  });

  // Supporting subtitle — italic
  slide.addText(subtitle, {
    x: SLIDE.margin.left,
    y: 1.52,
    w: 11.5,
    h: 0.3,
    fontSize: 11,
    fontFace: BRAND.fonts.body,
    color: BRAND.colors.grey50,
    italic: true,
  });
}

// ── Gated-Flow: Phase Boxes + Gate Arrows ────────────────────────

interface Phase {
  number: number;
  title: string;
  duration: string;     // e.g. "Weeks 1-5"
  bullets: string[];
  gate?: string;        // Gate label between this phase and next
}

interface DetailColumn {
  heading: string;
  items: Array<{ bold: string; body: string }>;
}

function renderGatedFlow(
  slide: PptxGenJS.Slide,
  pptx: PptxGenJS,
  phases: Phase[],
  details: DetailColumn[],
  eyeonAdvantage?: string,
): void {
  const count = phases.length;
  if (count === 0) return;

  // Layout constants
  const gateW = 0.8;        // Width for gate arrows
  const boxGap = gateW + 0.15;
  const totalGaps = (count - 1) * boxGap;
  const boxW = (SLIDE.content.width - totalGaps) / count;
  const boxH = 2.2;
  const boxY = SLIDE.content.top + 0.1;

  // Phase colors — gradient from dark to slightly lighter for visual hierarchy
  const phaseColors = ["0B1F3A", "0F2845", "132C53"];

  phases.forEach((phase, i) => {
    const boxX = SLIDE.content.left + i * (boxW + boxGap);
    const bgColor = phaseColors[i % phaseColors.length];

    // ── Phase box with subtle rounded corners ──
    slide.addShape(pptx.ShapeType.roundRect, {
      x: boxX,
      y: boxY,
      w: boxW,
      h: boxH,
      fill: { color: bgColor },
      rectRadius: 0.06,
      shadow: {
        type: "outer",
        blur: 4,
        offset: 2,
        color: "000000",
        opacity: 0.12,
      },
    });

    // ── Number circle — white fill, dark text ──
    const circleSize = 0.36;
    const circleX = boxX + 0.2;
    const circleY = boxY + 0.18;

    slide.addShape(pptx.ShapeType.ellipse, {
      x: circleX,
      y: circleY,
      w: circleSize,
      h: circleSize,
      fill: { color: BRAND.colors.white },
    });
    slide.addText(String(phase.number), {
      x: circleX,
      y: circleY,
      w: circleSize,
      h: circleSize,
      fontSize: 14,
      fontFace: BRAND.fonts.body,
      color: bgColor,
      bold: true,
      align: "center",
      valign: "middle",
    });

    // ── Phase title — bold white, to the right of circle ──
    slide.addText(phase.title, {
      x: circleX + circleSize + 0.12,
      y: circleY - 0.02,
      w: boxW - circleSize - 0.55,
      h: 0.22,
      fontSize: 11.5,
      fontFace: BRAND.fonts.body,
      color: BRAND.colors.white,
      bold: true,
      valign: "middle",
    });

    // ── Duration — lighter text under title ──
    slide.addText(phase.duration, {
      x: circleX + circleSize + 0.12,
      y: circleY + 0.2,
      w: boxW - circleSize - 0.55,
      h: 0.18,
      fontSize: 9,
      fontFace: BRAND.fonts.body,
      color: BRAND.colors.pale,
      valign: "middle",
    });

    // ── Separator line inside box ──
    const sepY = boxY + 0.72;
    slide.addShape(pptx.ShapeType.line, {
      x: boxX + 0.2,
      y: sepY,
      w: boxW - 0.4,
      h: 0,
      line: { color: "FFFFFF", width: 0.4, transparency: 60 },
    });

    // ── Bullets — consulting content ──
    const bulletY = sepY + 0.12;
    const bulletH = boxH - (bulletY - boxY) - 0.15;
    const bulletText = phase.bullets.map((b) => `${b}`).join("\n");

    slide.addText(bulletText, {
      x: boxX + 0.22,
      y: bulletY,
      w: boxW - 0.44,
      h: bulletH,
      fontSize: 9,
      fontFace: BRAND.fonts.body,
      color: BRAND.colors.pale,
      lineSpacingMultiple: 1.35,
      valign: "top",
      paraSpaceAfter: 4,
    });

    // ── Gate arrow to next phase ──
    if (i < count - 1 && phase.gate) {
      const arrowStartX = boxX + boxW + 0.08;
      const arrowY = boxY + boxH / 2 - 0.05;
      const arrowLen = gateW - 0.16;

      // Arrow line with arrowhead
      slide.addShape(pptx.ShapeType.line, {
        x: arrowStartX,
        y: arrowY,
        w: arrowLen,
        h: 0,
        line: {
          color: BRAND.colors.grey30,
          width: 1.2,
          endArrowType: "arrow",
        },
      });

      // Gate label — italic, centered between boxes
      slide.addText(phase.gate, {
        x: arrowStartX - 0.15,
        y: arrowY + 0.12,
        w: gateW + 0.1,
        h: 0.55,
        fontSize: 7.5,
        fontFace: BRAND.fonts.body,
        color: BRAND.colors.grey50,
        align: "center",
        valign: "top",
        italic: false,
        lineSpacingMultiple: 1.2,
      });
    }
  });

  // ── Detail Grid Below Flow ──────────────────────────────────────
  if (details.length > 0) {
    const detailY = boxY + boxH + 0.35;
    const detailW = (SLIDE.content.width - totalGaps) / count;

    // Top border for detail section
    slide.addShape(pptx.ShapeType.line, {
      x: SLIDE.content.left,
      y: detailY - 0.08,
      w: SLIDE.content.width,
      h: 0,
      line: { color: BRAND.colors.grey10, width: 0.75 },
    });

    details.forEach((col, colIdx) => {
      const detailX = SLIDE.content.left + colIdx * (detailW + boxGap);

      // Column heading — bold, underlined
      slide.addText(col.heading, {
        x: detailX,
        y: detailY,
        w: detailW,
        h: 0.22,
        fontSize: 10,
        fontFace: BRAND.fonts.body,
        color: BRAND.colors.dark,
        bold: true,
        underline: { style: "sng" },
      });

      // Detail items — bold label + body text
      col.items.forEach((item, ii) => {
        const itemY = detailY + 0.3 + ii * 0.56;

        slide.addText(
          [
            {
              text: `${item.bold}\n`,
              options: {
                bold: true,
                color: BRAND.colors.dark,
                fontSize: 9,
              },
            },
            {
              text: item.body,
              options: {
                color: BRAND.colors.grey70,
                fontSize: 8.5,
                lineSpacingMultiple: 1.2,
              },
            },
          ],
          {
            x: detailX,
            y: itemY,
            w: detailW - 0.1,
            h: 0.52,
            fontFace: BRAND.fonts.body,
            valign: "top",
          },
        );
      });
    });
  }

  // ── EyeOn Advantage Callout ──────────────────────────────────────
  if (eyeonAdvantage) {
    const advantageY = 6.22;
    slide.addText(
      [
        {
          text: "EyeOn advantage: ",
          options: {
            bold: true,
            color: BRAND.colors.accentBlue,
            fontSize: 8.5,
            italic: true,
          },
        },
        {
          text: eyeonAdvantage,
          options: {
            color: BRAND.colors.grey70,
            fontSize: 8.5,
            italic: true,
          },
        },
      ],
      {
        x: SLIDE.content.left,
        y: advantageY,
        w: SLIDE.content.width / 2.5,
        h: 0.25,
        fontFace: BRAND.fonts.body,
        valign: "top",
      },
    );
  }
}

// ── Context Banner (Red/Coral) ───────────────────────────────────

function addContextBanner(
  slide: PptxGenJS.Slide,
  pptx: PptxGenJS,
  label: string,
  detail: string,
): void {
  const bannerY = 6.5;
  const bannerH = 0.38;

  // Red-tinted background strip
  slide.addShape(pptx.ShapeType.roundRect, {
    x: SLIDE.content.left,
    y: bannerY,
    w: SLIDE.content.width,
    h: bannerH,
    fill: { color: BRAND.colors.accentBg },
    rectRadius: 0.03,
    line: { color: BRAND.colors.accent, width: 0.3, transparency: 60 },
  });

  // Mixed-format text
  slide.addText(
    [
      {
        text: `${label}: `,
        options: {
          bold: true,
          color: BRAND.colors.accent,
          fontSize: 9,
        },
      },
      {
        text: detail,
        options: {
          color: BRAND.colors.grey70,
          fontSize: 9,
        },
      },
    ],
    {
      x: SLIDE.content.left + 0.15,
      y: bannerY,
      w: SLIDE.content.width - 0.3,
      h: bannerH,
      fontFace: BRAND.fonts.body,
      valign: "middle",
    },
  );
}

// ── Build the Slide ──────────────────────────────────────────────

async function main() {
  const pptx = new PptxGenJS();
  pptx.defineLayout({ name: "WIDESCREEN", width: SLIDE.width, height: SLIDE.height });
  pptx.layout = "WIDESCREEN";

  const slide = pptx.addSlide();

  // Chrome
  addChrome(slide, 21);
  addGoverningThought(
    slide,
    "Our Approach",
    "Process First, Then Technology: Three Phases of Transformation",
    "Each phase delivers a process outcome, not a technical milestone. Gates are stakeholder decisions, not code reviews.",
  );

  // Gated Flow
  renderGatedFlow(
    slide,
    pptx,
    [
      {
        number: 1,
        title: "PROCESS DISCOVERY",
        duration: "Weeks 1–5",
        bullets: [
          "Map current planning decisions end-to-end",
          "Identify why adoption failed (training? process? trust?)",
          "Document who decides what, when, with what data",
        ],
        gate: "Stakeholders\nagree\ndiagnosis",
      },
      {
        number: 2,
        title: "DESIGN & CONFIGURE",
        duration: "Weeks 5–28",
        bullets: [
          "Define target S&OP operating model first",
          "Configure Anaplan to serve each process step",
          "Users validate in sprint demos every 2 weeks",
        ],
        gate: "Users\nvalidate\nprocess\nworks",
      },
      {
        number: 3,
        title: "EMBED & SCALE",
        duration: "Weeks 28–35",
        bullets: [
          "Role-based capability building, not training days",
          "Run one full planning cycle in Anaplan",
          "Measure adoption KPIs, not just go-live",
        ],
      },
    ],
    [
      {
        heading: "What discovery uncovers",
        items: [
          {
            bold: "Current planning process",
            body: "How decisions are actually made today — who owns the forecast, where does Excel fill the gap, what triggers an escalation.",
          },
          {
            bold: "Root cause of 0% adoption",
            body: "Was it training? Process mismatch? Data trust? No ownership? We diagnose before we prescribe.",
          },
          {
            bold: "Platform readiness",
            body: "What the previous partner built and what state it is in — inventory, not rebuild.",
          },
        ],
      },
      {
        heading: "How design & configure works",
        items: [
          {
            bold: "Target operating model first",
            body: "S&OP cadence, demand review rhythm, decision rights, escalation triggers, KPIs — defined before any Anaplan configuration.",
          },
          {
            bold: "Each sprint delivers a process step",
            body: "Not a module. Users attend every demo and validate: does this match how we need to plan?",
          },
          {
            bold: "Process champions emerge",
            body: "Key users take ownership of their part of the process during build, not after go-live.",
          },
        ],
      },
      {
        heading: "What embed & scale delivers",
        items: [
          {
            bold: "One full planning cycle in Anaplan",
            body: "Not a training session — a real monthly S&OP cycle with real data, real decisions, real consequences.",
          },
          {
            bold: "Adoption metrics, not a go-live checkbox",
            body: "Active users, planning cycle time, forecast accuracy, decision audit trail — measured from day one.",
          },
          {
            bold: "Continuous improvement loop",
            body: "Monthly retrospective on what is working and what needs adjustment. The process keeps improving.",
          },
        ],
      },
    ],
    "We know the SCM standard app inside out — we can assess what's configured before the first workshop.",
  );

  // Context banner
  addContextBanner(
    slide,
    pptx,
    "tonies® context",
    "34 licensed users, 0% active adoption for 18+ months. Anaplan contract expires May 2027 — that gives a 10-month window from June 29 start to prove the platform earns its renewal.",
  );

  // Write file
  const outDir = join(__dirname, "output");
  mkdirSync(outDir, { recursive: true });

  const buffer = await pptx.write({ outputType: "nodebuffer" }) as Buffer;
  const outPath = join(outDir, "ref-gated-flow.pptx");
  writeFileSync(outPath, buffer);
  console.log(`✅ Generated: ${outPath}`);
}

main().catch(console.error);
