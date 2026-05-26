/**
 * API Route: POST /api/parse/extract
 *
 * AI-powered extraction of RFP questions and requirements from raw text.
 * Uses Claude to intelligently identify actual questions, requirements,
 * and scope items — filtering out headers, TOC entries, page numbers,
 * boilerplate, and other noise that naive line-splitting would include.
 *
 * Accepts: { text: string }
 * Returns: { items: Array<{ text: string, type: "question" | "requirement" | "scope" }> }
 */

import { NextRequest } from "next/server";

const CLAUDE_MODEL = "claude-sonnet-4-20250514";
const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";

export const maxDuration = 60;

const EXTRACTION_PROMPT = `You are an RFP analyst. Extract ALL meaningful questions and requirements from this document text.

RULES:
1. Extract every actual question (ends with ?) and every substantive requirement/scope item
2. Each item must be a COMPLETE, self-contained sentence or requirement — not a fragment
3. If a requirement spans multiple lines, merge them into one coherent item
4. SKIP: page numbers, table of contents entries, headers/footers, section titles alone, disclaimers, boilerplate confidentiality notices, formatting artifacts
5. SKIP: items shorter than 15 words that aren't clear questions
6. For bullet-point requirements, include the parent context so each stands alone
   e.g. "Integration with DRL's technology landscape, including SAP S/4HANA, SAP Business One" → keep as one item
7. Classify each as:
   - "question" if it asks something (contains ?)
   - "requirement" if it states what the vendor must do/provide
   - "scope" if it describes project scope, objectives, or context

Return a JSON array. No markdown fencing, no explanation — ONLY the JSON array.

Example output format:
[
  {"text": "How does your platform handle multi-entity consolidation across different ERP systems?", "type": "question"},
  {"text": "The solution must support configuration for a multi-archetype operating model across 15 markets, including direct, co-marketed, and partner-led channels", "type": "requirement"},
  {"text": "Implementation timeline must not exceed 16 weeks from project kickoff to go-live", "type": "requirement"}
]`;

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
    let items: Array<{ text: string; type: string }>;
    try {
      // Handle potential markdown fencing
      const cleaned = content.replace(/```(?:json)?\s*\n?/g, "").replace(/\n?```/g, "").trim();
      const startIdx = cleaned.indexOf("[");
      const endIdx = cleaned.lastIndexOf("]");
      if (startIdx >= 0 && endIdx > startIdx) {
        items = JSON.parse(cleaned.slice(startIdx, endIdx + 1));
      } else {
        items = JSON.parse(cleaned);
      }
    } catch {
      console.error("Failed to parse AI response:", content.slice(0, 500));
      return Response.json(
        { error: "AI returned malformed response. Try again." },
        { status: 502 },
      );
    }

    // Validate and clean
    const validated = items
      .filter(
        (item) =>
          item &&
          typeof item.text === "string" &&
          item.text.trim().length > 0,
      )
      .map((item) => ({
        text: item.text.trim(),
        type: ["question", "requirement", "scope"].includes(item.type)
          ? item.type
          : "requirement",
      }));

    return Response.json({ items: validated });
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
