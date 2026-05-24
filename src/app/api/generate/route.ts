import { buildSystemPrompt, buildQuestionPrompt, type GenerateRequest } from "@/lib/agents";

const CLAUDE_MODEL = "claude-sonnet-4-20250514";
const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "ANTHROPIC_API_KEY not configured" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  let body: GenerateRequest;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid request body" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!body.questionText || !body.category) {
    return new Response(
      JSON.stringify({ error: "questionText and category are required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const systemPrompt = buildSystemPrompt(body);
  const userPrompt = buildQuestionPrompt(body);

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
      max_tokens: 2048,
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

  // Stream the SSE response through to the client
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const stream = new ReadableStream({
    async start(controller) {
      const reader = claudeResponse.body?.getReader();
      if (!reader) {
        controller.close();
        return;
      }

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
                  // Forward the text delta as SSE
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ type: "delta", text: parsed.delta.text })}\n\n`)
                  );
                } else if (parsed.type === "message_stop") {
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`)
                  );
                } else if (parsed.type === "error") {
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ type: "error", error: parsed.error?.message || "Unknown error" })}\n\n`)
                  );
                }
              } catch {
                // Skip unparseable lines
              }
            }
          }
        }

        // Process remaining buffer
        if (buffer.startsWith("data: ")) {
          const data = buffer.slice(6);
          try {
            const parsed = JSON.parse(data);
            if (parsed.type === "content_block_delta" && parsed.delta?.text) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: "delta", text: parsed.delta.text })}\n\n`)
              );
            }
          } catch {
            // ignore
          }
        }

        // Send final done event
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`)
        );
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
