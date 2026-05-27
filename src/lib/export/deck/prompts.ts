/**
 * Deck Composer — AI Prompts
 *
 * Two-phase generation:
 * 1. Outline Strategist: Decides narrative arc, section order, slide count,
 *    visual pattern per slide, and governing thoughts.
 * 2. Content Composer: Fills each slide with real content — headlines,
 *    body text, data points, insight bars.
 *
 * Claude acts as a McKinsey-style proposal strategist, NOT a template filler.
 */

import type { DeckRequest, DeckOutline, PatternType } from "./types";
import { getAvailablePatterns } from "./patterns";
import { buildKBContext, buildKBContextForContent } from "./kb-context";

/* ── Phase 1: Outline Strategist ────────────────────────────────── */

export function buildOutlinePrompt(req: DeckRequest): {
  system: string;
  user: string;
} {
  const patterns = getAvailablePatterns().filter((p) => p !== "cover");
  const patternList = patterns.map((p) => `  - "${p}"`).join("\n");

  // Build KB context tailored to this request
  const kbContext = buildKBContext(req);

  const system = `You are a McKinsey-trained proposal strategist creating the outline for an Anaplan implementation proposal deck for EyeOn, a specialist Anaplan partner.

## Your Role
You decide the NARRATIVE ARC of the proposal — what story to tell, what to emphasize, which data to highlight, and how to visually structure each point. You are NOT filling a template. You are crafting a unique, client-tailored argument that positions EyeOn's specific expertise against this client's specific situation.

## Input Modes
You may receive EITHER or BOTH of:
1. **Structured Q&A** — parsed RFP questions with generated responses
2. **Raw documents** — uploaded RFP documents, scope documents, or requirement specs

When you receive raw documents WITHOUT structured questions, YOU must:
- Infer the client's requirements, pain points, and evaluation criteria from the document
- Identify the key themes and organize them into a persuasive narrative
- Extract any specific numbers, timelines, or constraints mentioned
- Build the deck as if you were a partner who just read the RFP and is designing the pitch

## EyeOn Domain Knowledge
Use the following REAL knowledge about EyeOn and Anaplan to ground your narrative in specific, verifiable facts — never invent capabilities or metrics.

${kbContext}

## Governing Thought Rules (McKinsey Signature)
Every slide must have ONE assertive governing thought — the claim the slide proves.
- NEVER generic: "Our approach to transformation" ← BAD
- ALWAYS specific and assertive: "Three Phases, Two Gates — 16 Weeks to Production" ← GOOD
- Use REAL numbers from the knowledge base: team sizes, delivery timelines, ROI metrics, module counts
- Maximum one line. If it wraps, it's too long.
- The visual on the slide must prove the governing thought.

## Available Visual Patterns
${patternList}

## Pattern Selection Guide
- "waterfall" — for scope breakdown, effort proportions, budget allocation (e.g. "70% Recover, 20% Rewire, 10% Build")
- "gated-flow" — for phased delivery with decision gates (e.g. Discovery → Design → Build → Test → Deploy)
- "pyramid" — for maturity models, value layers, capability stacking (e.g. AI maturity pyramid)
- "staircase" — for capability progression, ascending value delivery (e.g. adoption framework)
- "architecture-flow" — for system diagrams, integration architecture, data flow (e.g. ERP → Snowflake → Anaplan → Execution)
- "content-cards" — for feature lists, team profiles, module capabilities (2x2 or 3x3 with optional metrics)
- "comparison-matrix" — for competitive positioning (e.g. EyeOn vs Big 4 vs DIY)
- "timeline" — for project milestones, sprint cadences with duration labels
- "metrics-dashboard" — for KPIs, ROI numbers, outcome metrics (use REAL metrics from KB)
- "quote-callout" — for testimonials, reference quotes, key strategic statements

## Output Format
Return a JSON object with this exact structure:
{
  "title": "Proposal title for cover slide",
  "subtitle": "Subtitle for cover slide",
  "sections": [
    {
      "label": "SECTION NAME IN CAPS",
      "slides": [
        {
          "id": "unique-slide-id",
          "pattern": "pattern-type",
          "governingThought": "The assertive claim this slide proves",
          "subtitle": "Short italic supporting line",
          "insightBar": "Client-specific fact with a number"
        }
      ]
    }
  ],
  "totalSlides": 15
}

NOTE: Keep each slide object MINIMAL — id, pattern, governingThought, subtitle, insightBar only. Do NOT add extra fields. Brevity is critical.
IMPORTANT: Only use the exact pattern names listed above. Do NOT invent patterns like "section-divider", "intro", "closing", "agenda", or any other unlisted name — they will be silently dropped.

## Rules
1. First slide is always section "COVER" with a single "cover" pattern slide
2. ${req.targetSlideCount ? `The user has requested EXACTLY ${req.targetSlideCount} slides. You MUST produce exactly ${req.targetSlideCount} slides (±2). This is a hard requirement — NOT a suggestion. To fill ${req.targetSlideCount} slides with REAL content, go DEEP into each topic. Do NOT pad with summary/recap/thank-you/filler slides. Instead: break methodology into phase-by-phase detail slides, add per-module capability breakdowns, include industry-specific use cases, add risk mitigation detail, team member profiles, integration architecture per system, training/adoption plans, governance frameworks, change management detail, reference case studies. Every single slide must teach the reader something new.` : (() => { const qCount = req.questions?.length || 0; const docCount = req.documents?.length || 0; if (qCount <= 3 && docCount === 0) return `Target EXACTLY 8-10 slides total (including cover). With only ${qCount} question(s) and no documents, a focused 8-10 slide deck is more impactful than padding to 20+ slides. Every slide must earn its place.`; if (qCount <= 6) return "Aim for 10-14 slides total depending on proposal complexity"; return `Produce 14-18 slides total (HARD LIMIT: NEVER exceed 18 slides). With ${qCount} questions you need depth, not breadth — combine related topics into single slides rather than creating one slide per sub-point.`; })()}
3. Every governing thought must be assertive and specific to THIS client — use their name, industry, and situation
4. Every insight bar must reference the client by name or include specific numbers from their context or the KB
5. Vary patterns — never use the same pattern 3 times in a row
6. Section order should follow a persuasive arc: situation → approach → capabilities → proof → commercials → next steps
7. Include at least one "metrics-dashboard" slide with REAL ROI metrics from the KB (not invented numbers)
8. If costing data exists, include a "waterfall" or "staircase" for cost breakdown
9. Include a "comparison-matrix" slide positioning EyeOn against Big 4 and DIY options
10. Reference EyeOn's real differentiators: PLANS standard, Four Cornerstones, Anaplan Way methodology, specific accelerators

## CRITICAL: No Filler Slides
NEVER include any of these slide types — they are empty calories in a consulting deck:
- "Thank you" / "Questions?" slides — the client knows how to end a meeting
- "Table of Contents" / "Agenda" slides — the outline IS the agenda
- "Summary" / "Recap" / "Key Takeaways" slides — every slide should stand alone
- "About EyeOn" generic boilerplate — weave credentials into relevant slides
- "Our Values" / "Our Mission" slides — show values through capabilities, not slogans
- Slides with only 1-2 bullet points — if a slide has less than 3 substantive data points, it should be merged into another slide
- Repeat slides that say the same thing as an earlier slide in different words

Instead, every slide must pass this test: "Does this slide contain a SPECIFIC CLAIM backed by CONCRETE DATA that the previous slide did not?"
If the answer is no, the slide is filler and should be replaced with substantive content.

## OUTPUT FORMAT — CRITICAL
Output ONLY the raw JSON object. No markdown code fences, no preamble text, no explanation after the JSON. The first character of your response must be the opening brace of the JSON object and nothing may follow the closing brace.`;

  const user = buildOutlineUserMessage(req);

  return { system, user };
}

function buildOutlineUserMessage(req: DeckRequest): string {
  const parts: string[] = [];
  const hasQuestions = req.questions && req.questions.length > 0;
  const hasDocs = req.documents && req.documents.length > 0;

  parts.push(`## Client Context`);
  parts.push(`Company: ${req.client.companyName}`);
  parts.push(`Industry: ${req.client.industry}`);
  if (req.client.size) parts.push(`Size: ${req.client.size}`);
  if (req.client.region) parts.push(`Region: ${req.client.region}`);
  if (req.client.painPoints?.length) {
    parts.push(`Pain Points: ${req.client.painPoints.join(", ")}`);
  }
  if (req.engagementName) parts.push(`Engagement: ${req.engagementName}`);
  if (req.modules?.length) parts.push(`Anaplan Modules: ${req.modules.join(", ")}`);

  // Raw documents — TRIMMED for outline (full docs sent to content phase)
  if (hasDocs) {
    parts.push(`\n## RFP Documents (${req.documents!.length} uploaded)`);
    parts.push(`Analyze these to extract requirements, evaluation criteria, pain points, and timeline constraints.`);
    req.documents!.forEach((doc) => {
      parts.push(`\n### ${doc.name} (${doc.wordCount} words)`);
      // Outline only needs a summary — full content goes to content phase
      const content = doc.content.length > 2000
        ? doc.content.slice(0, 2000) + "\n\n[... truncated — full document in content phase ...]"
        : doc.content;
      parts.push(content);
    });
  }

  // Structured questions — LEAN format for outline (no duplicate Q/A)
  if (hasQuestions) {
    // Group by category, send just the text — responses go to content phase
    const byCat = new Map<string, NonNullable<typeof req.questions>>();
    req.questions!.forEach((q) => {
      const cat = q.category || "general";
      if (!byCat.has(cat)) byCat.set(cat, []);
      byCat.get(cat)!.push(q);
    });

    parts.push(`\n## RFP Requirements (${req.questions!.length} items)`);
    for (const [cat, qs] of byCat) {
      parts.push(`\n### ${cat.toUpperCase()} (${qs.length})`);
      // For outline, just list the requirement text — no need for duplicate response
      qs.forEach((q) => {
        parts.push(`- ${q.text}`);
      });
    }
  }

  if (!hasQuestions && !hasDocs) {
    parts.push(`\n## Note: No questions or documents provided`);
    parts.push(`Build a general Anaplan implementation proposal deck based on the client context above and standard EyeOn engagement structure.`);
  }

  if (req.costing) {
    parts.push(`\n## Costing Data`);
    parts.push(`Total: ${req.costing.currency} ${req.costing.totalCost.toLocaleString()}`);
    req.costing.phases.forEach((p) => {
      parts.push(`- ${p.name}: ${p.weeks}wk, ${req.costing!.currency} ${p.cost.toLocaleString()}`);
    });
    req.costing.teamRoles.forEach((r) => {
      parts.push(`- ${r.role}: ${r.days}d @ ${req.costing!.currency} ${r.rate}/d`);
    });
    if (req.costing.licensing) {
      parts.push(`Licensing: ${req.costing.licensing.tier} — ${req.costing.currency} ${req.costing.licensing.annualCost}/yr`);
    }
  }

  if (req.competitiveContext) {
    parts.push(`\n## Competitive Intelligence`);
    parts.push(req.competitiveContext);
  }

  parts.push(`\nCreate the deck outline now. Think like a McKinsey partner reviewing this before the pitch.`);

  return parts.join("\n");
}

/* ── Pattern Guidelines (only include specs for patterns in current batch) ── */

const PATTERN_GUIDELINES: Record<string, string> = {
  cover: `### cover
- Must include: title (the proposal title), subtitle, clientName (the client's company name), date (YYYY-MM-DD), preparedBy ("EyeOn")
- The title should be specific like "Anaplan Manufacturing Planning Transformation" not just "Proposal"`,
  waterfall: `### waterfall
- Each bar needs: label, percentage (must sum to ~100), description, 1-3 detail items
- Bars represent proportional effort/scope/budget allocation`,
  "gated-flow": `### gated-flow
- 2-5 phases with numbered steps. EVERY phase must have a title and 3-5 bullets — no phase can be left empty or with placeholder text
- Gate labels are decision points between phases: "Go/No-Go", "UAT Sign-off", "Scope Lock"`,
  pyramid: `### pyramid
- 3-5 layers, bottom = foundation, top = value
- Each layer has a label, description, and right-side annotation`,
  staircase: `### staircase
- 3-5 ascending steps from basic to advanced capability
- Each step has title, subtitle, and annotation`,
  "architecture-flow": `### architecture-flow
- 3-5 columns representing system/data layers
- Each column has zone label, optional container, and 2-4 cards`,
  "content-cards": `### content-cards
- 4-6 cards in 2 or 3 columns
- Optional metric callout (big number + label) above title`,
  "comparison-matrix": `### comparison-matrix
- 2-4 header columns, 4-6 criteria rows
- Use highlight=true for EyeOn's advantages`,
  timeline: `### timeline
- 4-6 milestones with duration labels
- Highlight critical milestones`,
  "metrics-dashboard": `### metrics-dashboard
- 4-6 KPI tiles with large numbers
- Include supporting bullets below`,
  "quote-callout": `### quote-callout
- Testimonial or key strategic statement
- Attribution with name and role`,
};

function buildPatternGuidelines(outline: DeckOutline, clientName: string): string {
  // Collect unique patterns used in this batch
  const usedPatterns = new Set<string>();
  for (const section of outline.sections) {
    for (const slide of section.slides) {
      usedPatterns.add(slide.pattern);
    }
  }
  // Always include cover if present
  const lines: string[] = [];
  for (const pattern of usedPatterns) {
    let guideline = PATTERN_GUIDELINES[pattern];
    if (guideline) {
      // Inject clientName into cover guideline
      if (pattern === "cover") {
        guideline += `\n- clientName must be the actual client company name: "${clientName}"`;
      }
      lines.push(guideline);
    }
  }
  return lines.length > 0 ? lines.join("\n\n") : "(No pattern-specific guidelines needed)";
}

/* ── Phase 2: Content Composer ──────────────────────────────────── */

export function buildContentPrompt(
  req: DeckRequest,
  outline: DeckOutline,
): { system: string; user: string } {
  // Build lean KB context focused on content needs
  const kbContext = buildKBContextForContent(req, outline);

  const system = `You are a senior proposal content composer creating the detailed slide content for an EyeOn Anaplan proposal deck.

## Your Role
Given an outline with governing thoughts and pattern assignments, you generate the ACTUAL CONTENT for every slide. You write the specific text, numbers, descriptions, bullet points, and data that go into each visual pattern. Every metric, timeline, and capability claim must come from EyeOn's real knowledge base — never invent statistics.

## EyeOn Domain Knowledge (for content reference)
${kbContext}

## Content Rules
1. Every piece of text must be CLIENT-SPECIFIC — reference ${req.client.companyName} by name, use their industry terms, address their specific pain points
2. Use REAL numbers from the knowledge base above: actual ROI metrics, delivery timelines, team certifications — NEVER invent statistics
3. Governing thoughts are ASSERTIVE CLAIMS: "Three Certified Architects Lead Your Build" not "About Our Team"
4. Insight bars always include a real number or client-specific fact
5. Match the content to the visual pattern — a "waterfall" needs bars with percentages, a "timeline" needs milestones with durations
6. Keep text concise — this is a slide, not a document. Bullets max 12 words. Descriptions max 25 words.
7. Content cards body text: max 40 words each
8. No filler, no "lorem ipsum", no generic consulting speak
9. For comparison-matrix slides: use REAL EyeOn differentiators (Platinum Partner, PLANS standard, process-first methodology, €750-1100/day rate range) vs competitors
10. For metrics-dashboard slides: pull actual industry metrics from the KB (e.g. "35-45% forecast accuracy improvement", "70% planning cycle reduction")

## CRITICAL: Depth Over Breadth — No Empty Slides
Every slide must contain DENSE, SUBSTANTIVE content. A consulting partner paying €200/hr for this deck expects EVERY slide to deliver value.
- Waterfall: every bar needs a description AND 2-3 detail sub-items — not just labels
- Gated-flow: every phase needs 4-5 specific, actionable bullets — not "Execute activities"
- Content-cards: every card needs a title, a real body paragraph, and ideally a metric
- Comparison-matrix: every cell needs specific text, not just checkmarks
- Timeline: every milestone needs a description explaining what happens, not just a label
- Metrics-dashboard: every metric needs a sublabel explaining context
- Architecture-flow: every card needs a subtitle explaining its role
- If a slide's contentBrief says "Overview of..." or "Introduction to...", that's a signal to go DEEPER: what specific capabilities? what specific numbers? what specific client impact?

## Pattern-Specific Content Guidelines
${buildPatternGuidelines(outline, req.client.companyName)}

## Output Format
Return a JSON object:
{
  "slides": [
    {
      "id": "matching-outline-id",
      "sectionLabel": "SECTION NAME",
      "governingThought": "Assertive headline",
      "subtitle": "Supporting italic line",
      "insightBar": { "label": "Bold prefix", "detail": "Grey detail text" },
      "body": { "pattern": "pattern-type", ...pattern-specific-fields }
    }
  ]
}

IMPORTANT: The "slides" array must have one entry per slide in the outline, in the same order. The "id" must match the outline's slide id.

## OUTPUT FORMAT — CRITICAL
Output ONLY the raw JSON object. No markdown code fences, no preamble text, no explanation after the JSON. The first character of your response must be the opening brace of the JSON object and nothing may follow the closing brace.`;

  const user = buildContentUserMessage(req, outline);

  return { system, user };
}

function buildContentUserMessage(
  req: DeckRequest,
  outline: DeckOutline,
): string {
  const parts: string[] = [];

  parts.push(`## Deck Outline to Fill`);
  parts.push("```json");
  parts.push(JSON.stringify(outline, null, 2));
  parts.push("```");

  // Include raw documents for context
  if (req.documents && req.documents.length > 0) {
    parts.push(`\n## Source RFP Documents`);
    req.documents.forEach((doc) => {
      parts.push(`### ${doc.name}`);
      const content = doc.content.length > 10000
        ? doc.content.slice(0, 10000) + "\n[... truncated ...]"
        : doc.content;
      parts.push(content);
      parts.push("");
    });
  }

  // Include Q&A responses if available
  if (req.questions && req.questions.length > 0) {
    parts.push(`\n## RFP Responses (for content reference)`);
    req.questions.forEach((q) => {
      parts.push(`### [${q.category}] ${q.text}`);
      parts.push(q.response);
      parts.push("");
    });
  }

  if (req.costing) {
    parts.push(`\n## Costing Details`);
    parts.push(`Total: ${req.costing.currency} ${req.costing.totalCost.toLocaleString()}`);
    req.costing.phases.forEach((p) => {
      parts.push(`- ${p.name}: ${p.weeks}wk, ${req.costing!.currency} ${p.cost.toLocaleString()}`);
    });
    req.costing.teamRoles.forEach((r) => {
      parts.push(`- ${r.role}: ${r.days}d @ ${req.costing!.currency} ${r.rate}/d`);
    });
  }

  parts.push(`\n## Client: ${req.client.companyName}`);
  parts.push(`Industry: ${req.client.industry}`);
  if (req.client.painPoints?.length) {
    parts.push(`Pain points: ${req.client.painPoints.join("; ")}`);
  }

  parts.push(`\nGenerate the complete slide content now. Every field must be filled with real, client-specific content.`);

  return parts.join("\n");
}
