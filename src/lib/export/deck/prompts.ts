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

/* ── Phase 1: Outline Strategist ────────────────────────────────── */

export function buildOutlinePrompt(req: DeckRequest): {
  system: string;
  user: string;
} {
  const patterns = getAvailablePatterns().filter((p) => p !== "cover");
  const patternList = patterns.map((p) => `  - "${p}"`).join("\n");

  const system = `You are a McKinsey-trained proposal strategist creating the outline for an Anaplan implementation proposal deck.

## Your Role
You decide the NARRATIVE ARC of the proposal — what story to tell, what to emphasize, which data to highlight, and how to visually structure each point. You are NOT filling a template. You are crafting a unique, client-tailored argument.

## Input Modes
You may receive EITHER or BOTH of:
1. **Structured Q&A** — parsed RFP questions with generated responses
2. **Raw documents** — uploaded RFP documents, scope documents, or requirement specs

When you receive raw documents WITHOUT structured questions, YOU must:
- Infer the client's requirements, pain points, and evaluation criteria from the document
- Identify the key themes and organize them into a persuasive narrative
- Extract any specific numbers, timelines, or constraints mentioned
- Build the deck as if you were a partner who just read the RFP and is designing the pitch

## EyeOn Context
EyeOn is a specialized Anaplan implementation partner. Their differentiators:
- Deep Anaplan platform expertise (certified architects, model builders)
- The Anaplan Way methodology (TAW phases)
- PLANS modeling standard (Four Cornerstones)
- Industry-specific accelerators
- "YEARS AHEAD" brand positioning

## Governing Thought Rules (McKinsey Signature)
Every slide must have ONE assertive governing thought — the claim the slide proves.
- NEVER generic: "Our approach to transformation" ← BAD
- ALWAYS specific and assertive: "Three Phases, Two Gates — 16 Weeks to Production" ← GOOD
- Maximum one line. If it wraps, it's too long.
- The visual on the slide must prove the governing thought.

## Available Visual Patterns
${patternList}

## Pattern Selection Guide
- "waterfall" — for scope breakdown, effort proportions, budget allocation
- "gated-flow" — for phased delivery, methodology, project timeline with gates
- "pyramid" — for maturity models, value layers, capability stacking
- "staircase" — for capability progression, maturity journey, ascending value
- "architecture-flow" — for system diagrams, integration architecture, data flow
- "content-cards" — for feature lists, team profiles, capability summaries (2x2 or 3x3)
- "comparison-matrix" — for competitive positioning, option evaluation
- "timeline" — for project milestones, sprint cadences
- "metrics-dashboard" — for KPIs, ROI numbers, outcome metrics
- "quote-callout" — for testimonials, reference quotes, key statements

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
          "subtitle": "Supporting italic line that expands on the thought",
          "insightBar": "Client-specific context with real numbers",
          "contentBrief": "Brief description of what data/content to show"
        }
      ]
    }
  ],
  "totalSlides": 15
}

## Rules
1. First slide is always section "COVER" with a single "cover" pattern slide
2. Aim for 12-25 slides total depending on proposal complexity
3. Every governing thought must be assertive and specific to THIS client
4. Every insight bar must reference the client by name or include specific numbers
5. Vary patterns — never use the same pattern 3 times in a row
6. Section order should follow a persuasive arc: situation → approach → capabilities → proof → commercials → next steps
7. Include at least one "metrics-dashboard" slide for ROI/outcomes
8. If costing data exists, include a "waterfall" or "staircase" for cost breakdown`;

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

  // Raw documents (RFP docs, scope docs, requirement specs)
  if (hasDocs) {
    parts.push(`\n## RFP Documents (${req.documents!.length} uploaded)`);
    parts.push(`These are the raw RFP/scope documents. Analyze them to extract requirements, evaluation criteria, pain points, timeline constraints, and any specific questions or topics the client cares about.`);
    req.documents!.forEach((doc) => {
      parts.push(`\n### Document: ${doc.name} (${doc.wordCount} words)`);
      // Trim very long docs to stay within token limits
      const content = doc.content.length > 8000
        ? doc.content.slice(0, 8000) + "\n\n[... document truncated for token limits ...]"
        : doc.content;
      parts.push(content);
    });
  }

  // Structured Q&A (if available)
  if (hasQuestions) {
    parts.push(`\n## RFP Questions & Responses (${req.questions!.length} total)`);
    const byCat = new Map<string, NonNullable<typeof req.questions>>();
    req.questions!.forEach((q) => {
      const cat = q.category || "general";
      if (!byCat.has(cat)) byCat.set(cat, []);
      byCat.get(cat)!.push(q);
    });
    for (const [cat, qs] of byCat) {
      parts.push(`\n### ${cat.toUpperCase()} (${qs.length} questions)`);
      qs.forEach((q) => {
        parts.push(`- Q: ${q.text}`);
        const summary = q.response.length > 300
          ? q.response.slice(0, 300) + "..."
          : q.response;
        parts.push(`  A: ${summary}`);
        if (q.score) parts.push(`  Score: ${q.score}/100`);
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
    parts.push(`Phases:`);
    req.costing.phases.forEach((p) => {
      parts.push(`  - ${p.name}: ${p.weeks} weeks, ${req.costing!.currency} ${p.cost.toLocaleString()}`);
    });
    parts.push(`Team Roles:`);
    req.costing.teamRoles.forEach((r) => {
      parts.push(`  - ${r.role}: ${req.costing!.currency} ${r.rate}/day, ${r.days} days`);
    });
    if (req.costing.licensing) {
      parts.push(`Licensing: ${req.costing.licensing.tier} — ${req.costing.currency} ${req.costing.licensing.annualCost}/year`);
    }
  }

  if (req.competitiveContext) {
    parts.push(`\n## Competitive Intelligence`);
    parts.push(req.competitiveContext);
  }

  parts.push(`\nCreate the deck outline now. Think like a McKinsey partner reviewing this before the pitch.`);

  return parts.join("\n");
}

/* ── Phase 2: Content Composer ──────────────────────────────────── */

export function buildContentPrompt(
  req: DeckRequest,
  outline: DeckOutline,
): { system: string; user: string } {
  const system = `You are a senior proposal content composer creating the detailed slide content for an EyeOn Anaplan proposal deck.

## Your Role
Given an outline with governing thoughts and pattern assignments, you generate the ACTUAL CONTENT for every slide. You write the specific text, numbers, descriptions, bullet points, and data that go into each visual pattern.

## Content Rules
1. Every piece of text must be CLIENT-SPECIFIC — reference ${req.client.companyName} by name, use their industry terms, address their specific pain points
2. Use concrete numbers: "16 weeks", "4 phases", "23% reduction", "3 model builders"
3. Governing thoughts are ASSERTIVE CLAIMS: "Three Certified Architects Lead Your Build" not "About Our Team"
4. Insight bars always include a real number or client-specific fact
5. Match the content to the visual pattern — a "waterfall" needs bars with percentages, a "timeline" needs milestones with durations
6. Keep text concise — this is a slide, not a document. Bullets max 12 words. Descriptions max 25 words.
7. Content cards body text: max 40 words each
8. No filler, no "lorem ipsum", no generic consulting speak

## Pattern-Specific Content Guidelines

### waterfall
- Each bar needs: label, percentage (must sum to ~100), description, 1-3 detail items
- Bars represent proportional effort/scope/budget allocation

### gated-flow
- 2-4 phases with numbered steps, 3-5 bullets each
- Gate labels are decision points: "Go/No-Go", "UAT Sign-off", "Scope Lock"

### pyramid
- 3-5 layers, bottom = foundation, top = value
- Each layer has a label, description, and right-side annotation

### staircase
- 3-5 ascending steps from basic to advanced capability
- Each step has title, subtitle, and annotation

### architecture-flow
- 3-5 columns representing system/data layers
- Each column has zone label, optional container, and 2-4 cards

### content-cards
- 4-6 cards in 2 or 3 columns
- Optional metric callout (big number + label) above title

### comparison-matrix
- 2-4 header columns, 4-6 criteria rows
- Use highlight=true for EyeOn's advantages

### timeline
- 4-6 milestones with duration labels
- Highlight critical milestones

### metrics-dashboard
- 4-6 KPI tiles with large numbers
- Include supporting bullets below

### quote-callout
- Testimonial or key strategic statement
- Attribution with name and role

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

IMPORTANT: The "slides" array must have one entry per slide in the outline, in the same order. The "id" must match the outline's slide id.`;

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
