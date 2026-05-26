/**
 * Quality scoring API — evaluates response quality across 5 dimensions.
 * Returns structured scores for the Scoring tab in ContextPanel.
 */

const CLAUDE_MODEL = "claude-sonnet-4-6";
const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";

export interface ScoreRequest {
  questionText: string;
  responseContent: string;
  category: string;
  clientName: string;
  industry: string;
}

export interface ScoreResult {
  overall: number;
  dimensions: {
    completeness: number;
    relevance: number;
    differentiation: number;
    tone: number;
    specificity: number;
  };
  strengths: string[];
  improvements: string[];
}

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "ANTHROPIC_API_KEY not configured" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  let body: ScoreRequest;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid request body" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!body.responseContent || !body.questionText) {
    return new Response(
      JSON.stringify({ error: "questionText and responseContent required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const systemPrompt = `You are an expert RFP evaluator for Anaplan implementation proposals. Score the following RFP response on a 1-10 scale across 5 dimensions. Be critical but fair — most responses should score 5-8.

You MUST respond with ONLY valid JSON matching this exact structure:
{
  "overall": <number 1-10>,
  "dimensions": {
    "completeness": <number 1-10>,
    "relevance": <number 1-10>,
    "differentiation": <number 1-10>,
    "tone": <number 1-10>,
    "specificity": <number 1-10>
  },
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<improvement 1>", "<improvement 2>"]
}

Dimension definitions:
- completeness: Does it fully address all parts of the question?
- relevance: Is the content relevant to the client's industry and needs?
- differentiation: Does it differentiate from competitors and avoid boilerplate?
- tone: Is the tone professional, confident, and appropriate for a proposal?
- specificity: Does it include concrete metrics, timelines, examples?

Provide 2-3 strengths and 2-3 improvement suggestions.
Output ONLY the JSON — no explanation, no markdown fences.`;

  const userPrompt = `## RFP Question (${body.category})
"${body.questionText}"

## Client Context
Company: ${body.clientName || "Not specified"}
Industry: ${body.industry || "Not specified"}

## Response to Evaluate
${body.responseContent}`;

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
        max_tokens: 512,
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
    const text = result.content?.[0]?.text || "";

    // Parse the JSON response
    const scoreData: ScoreResult = JSON.parse(text);

    return new Response(JSON.stringify(scoreData), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Scoring failed" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
