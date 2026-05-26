/**
 * API Route: POST /api/parse/extract
 *
 * AI-powered extraction of RFP questions, requirements, and context
 * from raw document text — including unstructured documents that
 * describe business processes, landscapes, and pain points without
 * explicit numbered questions.
 *
 * The AI reads like a consultant: identifies the core ask, pulls out
 * explicit requirements, and INFERS implicit needs from the business
 * context described (systems, processes, scale, pain points).
 *
 * Accepts: { text: string }
 * Returns: {
 *   items: Array<{ text: string, type: "question" | "requirement" | "inferred" | "context" }>,
 *   clientContext: { companyName, industry, systems, painPoints, scale, modules }
 * }
 */

import { NextRequest } from "next/server";

const CLAUDE_MODEL = "claude-sonnet-4-6";
const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";

export const maxDuration = 60;

const EXTRACTION_PROMPT = `You are a senior Anaplan implementation consultant reading an RFP or project brief.

Your job is to extract everything needed to write a winning proposal. Many RFP documents do NOT contain explicit questions — they describe business processes, pain points, current systems, and objectives. You must READ BETWEEN THE LINES like a consultant would.

EXTRACT TWO THINGS:

## 1. Items (questions, requirements, and inferred needs)

For each item, classify as:
- "question" — explicit question the client is asking (ends with ?)
- "requirement" — something the client explicitly states they need
- "inferred" — a need you INFER from the context described (this is the consultant's interpretation)
- "context" — important background that shapes the proposal (company scale, timeline, budget signals)

CRITICAL RULES FOR INFERRED ITEMS:
- If the document describes a business process (e.g., demand planning across 15 markets), infer what Anaplan capabilities they'll need
- If they mention current systems (SAP, Oracle, Salesforce), infer integration requirements
- If they describe pain points (manual Excel processes, slow consolidation), infer what the solution must solve
- If they mention organizational structure (multiple BUs, regions), infer multi-dimensional modeling needs
- Write inferred items as proposal-ready requirements: "The solution should provide [capability] to address [their context]"
- Even if the only explicit ask is "we need a planning tool," you should produce 15-30 inferred items from the landscape described

RULES:
- Each item must be a COMPLETE, self-contained sentence — not a fragment
- Merge multi-line content into coherent items
- SKIP: page numbers, TOC, headers/footers, confidentiality boilerplate, formatting artifacts
- Every item should be something a proposal slide could address

## 2. Client Context (auto-extracted)

Also extract structured client information to auto-populate the proposal context:
- companyName: the client's company name
- industry: their industry/sector
- systems: list of current systems mentioned (ERP, CRM, BI tools, etc.)
- painPoints: list of pain points or challenges described
- scale: indicators of company size (revenue, headcount, markets, entities)
- modules: Anaplan modules they likely need (demand planning, supply planning, FP&A, workforce planning, etc.)

Return JSON with this exact structure. No markdown fencing, no explanation — ONLY the JSON.

{
  "items": [
    {"text": "How does your platform handle multi-entity consolidation?", "type": "question"},
    {"text": "The solution must integrate with SAP S/4HANA for actuals data", "type": "requirement"},
    {"text": "The solution should support driver-based demand forecasting across 15 regional markets with different demand patterns, given their multi-archetype go-to-market model", "type": "inferred"},
    {"text": "Client operates in 15 markets across EMEA and APAC with €2.1B revenue", "type": "context"}
  ],
  "clientContext": {
    "companyName": "DRLCH Group",
    "industry": "Consumer Goods / FMCG",
    "systems": ["SAP S/4HANA", "SAP Business One", "Salesforce"],
    "painPoints": ["Manual Excel-based planning", "No demand sensing capability", "Slow month-end close"],
    "scale": "€2.1B revenue, 15 markets, 3,500 employees",
    "modules": ["Demand Planning", "Supply Planning", "S&OP"]
  }
}`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "ANTHROPIC_API_KEY not configured" },
      { status: 500 },
    );
  }

  let body: { text: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.text || typeof body.text !== "string" || body.text.trim().length < 20) {
    return Response.json(
      { error: "Provide extracted document text (min 20 chars)" },
      { status: 400 },
    );
  }

  // Truncate very long docs to stay within context window
  const maxChars = 80_000;
  const text = body.text.length > maxChars
    ? body.text.slice(0, maxChars) + "\n\n[Document truncated at 80,000 characters]"
    : body.text;

  try {
    const response = await fetch(CLAUDE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 8192,
        messages: [
          {
            role: "user",
            content: `${EXTRACTION_PROMPT}\n\n---DOCUMENT TEXT---\n${text}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error("Claude API error:", response.status, errBody);
      return Response.json(
        { error: `AI extraction failed (${response.status})` },
        { status: 502 },
      );
    }

    const result = await response.json();
    const content = result.content?.[0]?.text || "[]";

    // Parse the JSON response
    let parsed: {
      items?: Array<{ text: string; type: string }>;
      clientContext?: Record<string, unknown>;
    };
    try {
      // Handle potential markdown fencing
      const cleaned = content.replace(/```(?:json)?\s*\n?/g, "").replace(/\n?```/g, "").trim();
      const startIdx = cleaned.indexOf("{");
      const endIdx = cleaned.lastIndexOf("}");
      if (startIdx >= 0 && endIdx > startIdx) {
        parsed = JSON.parse(cleaned.slice(startIdx, endIdx + 1));
      } else {
        // Might be just an array (old format fallback)
        const arrStart = cleaned.indexOf("[");
        const arrEnd = cleaned.lastIndexOf("]");
        if (arrStart >= 0 && arrEnd > arrStart) {
          parsed = { items: JSON.parse(cleaned.slice(arrStart, arrEnd + 1)) };
        } else {
          parsed = JSON.parse(cleaned);
        }
      }
    } catch {
      console.error("Failed to parse AI response:", content.slice(0, 500));
      return Response.json(
        { error: "AI returned malformed response. Try again." },
        { status: 502 },
      );
    }

    const rawItems = Array.isArray(parsed.items) ? parsed.items : Array.isArray(parsed) ? parsed : [];

    // Validate and clean items
    const validTypes = ["question", "requirement", "inferred", "context"];
    const validated = (rawItems as Array<{ text: string; type: string }>)
      .filter(
        (item) =>
          item &&
          typeof item.text === "string" &&
          item.text.trim().length > 0,
      )
      .map((item) => ({
        text: item.text.trim(),
        type: validTypes.includes(item.type) ? item.type : "inferred",
      }));

    return Response.json({
      items: validated,
      clientContext: parsed.clientContext || null,
    });
  } catch (err) {
    console.error("Extraction error:", err);
    return Response.json(
      {
        error: err instanceof Error ? err.message : "Extraction failed",
      },
      { status: 500 },
    );
  }
}
