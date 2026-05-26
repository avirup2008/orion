import { buildSystemPrompt, type GenerateRequest } from "@/lib/agents";

const CLAUDE_MODEL = "claude-sonnet-4-6";
const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";

export interface RefineRequest {
  action: "refine-tone" | "expand" | "condense" | "add-kb" | "custom";
  currentResponse: string;
  questionText: string;
  category: GenerateRequest["category"];
  customInstruction?: string;
  kbSnippet?: string;
  client: GenerateRequest["client"];
  clarification: GenerateRequest["clarification"];
}

const ACTION_PROMPTS: Record<string, string> = {
  "refine-tone": `Rewrite the response below with a more polished, executive-level tone. Keep the same structure and facts, but make it more compelling and persuasive. Strengthen verbs, remove hedging language, and ensure confident authority. Keep the same approximate length.`,
  "expand": `Expand the response below with additional detail, concrete examples, and supporting evidence. Add depth to each section. Target approximately 50% more content. Maintain the same structure and tone.`,
  "condense": `Condense the response below to approximately 60% of its current length. Keep the most impactful points, remove redundancy, and tighten prose. Every sentence must earn its place. Maintain the same professional tone.`,
  "add-kb": `Integrate the provided knowledge base snippet into the response below. Weave the new information naturally — don't just append it. Ensure the response flows smoothly and the KB content strengthens the answer.`,
  "custom": `Follow the user's instruction below to modify the response.`,
};

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "ANTHROPIC_API_KEY not configured" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  let body: RefineRequest;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid request body" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!body.currentResponse || !body.action) {
    return new Response(
      JSON.stringify({ error: "currentResponse and action are required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Build system prompt with full context
  const genReq: GenerateRequest = {
    questionId: "refine",
    questionText: body.questionText,
    category: body.category,
    priority: "high",
    client: body.client,
    clarification: body.clarification,
  };

  const systemPrompt = buildSystemPrompt(genReq);
  const actionPrompt = ACTION_PROMPTS[body.action] || ACTION_PROMPTS.custom;

  let userPrompt = `${actionPrompt}

## Original RFP Question
"${body.questionText}"

## Current Response to Refine
${body.currentResponse}`;

  if (body.action === "add-kb" && body.kbSnippet) {
    userPrompt += `\n\n## Knowledge Base Snippet to Integrate\n${body.kbSnippet}`;
  }

  if (body.action === "custom" && body.customInstruction) {
    userPrompt += `\n\n## User Instruction\n${body.customInstruction}`;
  }

  userPrompt += `\n\nRewrite the response now. Output ONLY the refined response text — no preamble, no explanation, no "Here is the refined version:".`;

  // Call Claude API with streaming
  const claudeResponse = await fetch(CLAUDE_API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 3000,
      stream: true,
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

  // Stream SSE through
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const stream = new ReadableStream({
    async start(controller) {
      const reader = claudeResponse.body?.getReader();
      if (!reader) { controller.close(); return; }

      let buffer = "";
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") continue;
              try {
                const parsed = JSON.parse(data);
                if (parsed.type === "content_block_delta" && parsed.delta?.text) {
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ type: "delta", text: parsed.delta.text })}\n\n`)
                  );
                } else if (parsed.type === "message_stop") {
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`)
                  );
                }
              } catch { /* skip */ }
            }
          }
        }
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`));
      } catch (err) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: "error", error: String(err) })}\n\n`)
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
