/**
 * Issuer Intelligence API — uses Claude to analyze an organization and its
 * RFP questions, returning structured research that guides response generation.
 *
 * POST /api/research
 * Body: { issuerName, issuerWebsite?, issuerNotes?, rfpQuestions, industry? }
 * Returns: IssuerIntelligence JSON (non-streaming, single response)
 */

import type { IssuerIntelligence } from "@/lib/issuer-intel";

const CLAUDE_MODEL = "claude-sonnet-4-20250514";
const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";

export interface ResearchRequest {
  issuerName: string;
  issuerWebsite?: string;
  issuerNotes?: string;
  rfpQuestions: string[];
  industry?: string;
}

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "ANTHROPIC_API_KEY not configured" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  let body: ResearchRequest;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid request body" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!body.issuerName || !Array.isArray(body.rfpQuestions) || body.rfpQuestions.length === 0) {
    return new Response(
      JSON.stringify({ error: "issuerName and at least one rfpQuestion are required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const systemPrompt = `You are a senior Anaplan consulting strategist at EyeOn (a leading Anaplan implementation partner). Your job is to analyze an RFP issuer and produce structured intelligence that will guide how we write our proposal responses.

You have deep knowledge of:
- The Anaplan ecosystem, competitors (Workday Adaptive, Oracle PBCS, SAP BPC, OneStream, Pigment, Planful)
- How enterprise organizations evaluate and select Anaplan partners
- Common decision criteria, budget ranges, and procurement patterns
- What differentiates winning Anaplan proposals from losing ones

Analyze the organization and the RFP questions they are asking to infer as much as possible about:
- Who they are and what they need
- What their budget expectations might be
- Who we are likely competing against
- How we should position ourselves to win

You MUST respond with ONLY valid JSON matching this exact structure:
{
  "organizationProfile": "<1-3 sentence overview of the organization and what they likely need>",
  "likelyBudgetRange": "<estimated budget range based on scope signals in the questions>",
  "decisionFactors": ["<factor 1>", "<factor 2>", ...],
  "competitorRisks": ["<risk 1>", "<risk 2>", ...],
  "winStrategy": ["<strategy 1>", "<strategy 2>", ...],
  "redFlags": ["<flag 1>", "<flag 2>", ...],
  "toneRecommendation": "<how to pitch: executive, technical, consultative, etc.>",
  "strengthsToEmphasize": ["<strength 1>", "<strength 2>", ...]
}

Guidelines:
- decisionFactors: 3-6 items — what this issuer probably cares about most
- competitorRisks: 2-4 items — likely incumbents or competitors and why they are a threat
- winStrategy: 3-5 items — concrete, actionable recommendations for how to win
- redFlags: 1-3 items — concerns, risks, or things to watch out for (empty array if none)
- strengthsToEmphasize: 3-5 items — EyeOn capabilities to highlight given this context

Output ONLY the JSON — no explanation, no markdown fences.`;

  const questionsBlock = body.rfpQuestions
    .map((q, i) => `${i + 1}. ${q}`)
    .join("\n");

  const contextParts: string[] = [];
  contextParts.push(`Organization: ${body.issuerName}`);
  if (body.industry) contextParts.push(`Industry: ${body.industry}`);
  if (body.issuerWebsite) contextParts.push(`Website: ${body.issuerWebsite}`);
  if (body.issuerNotes) contextParts.push(`Additional context: ${body.issuerNotes}`);

  const userPrompt = `## Issuer Information
${contextParts.join("\n")}

## RFP Questions They Are Asking
${questionsBlock}

Analyze this issuer and produce the structured intelligence JSON.`;

  try {
    const claudeResponse = await fetch(CLAUDE_API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!claudeResponse.ok) {
      const errText = await claudeResponse.text();
      return new Response(
        JSON.stringify({ error: `Claude API ${claudeResponse.status}: ${errText}` }),
        { status: claudeResponse.status, headers: { "Content-Type": "application/json" } }
      );
    }

    const result = await claudeResponse.json();
    const text: string = result.content?.[0]?.text || "";

    // Parse the JSON response from Claude
    const intel: IssuerIntelligence = JSON.parse(text);

    return new Response(JSON.stringify(intel), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "Research analysis failed",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
