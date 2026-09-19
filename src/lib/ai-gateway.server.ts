/**
 * Server-only helpers for the Lovable AI Gateway.
 *
 * - Chat answers: Responses API with openai/gpt-6-astra (streamed, accumulated server-side).
 * - Embeddings: google/gemini-embedding-2 at 1536 dimensions (matches public.chunks).
 *
 * Never import this file from browser code.
 */

const GATEWAY_BASE = "https://ai.gateway.lovable.dev/v1";
const CHAT_MODEL = "openai/gpt-6-astra";
const EMBED_MODEL = "google/gemini-embedding-2";
export const EMBED_DIMS = 1536;

function gatewayKey(): string {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  return key;
}

export async function embedTexts(texts: string[]): Promise<number[][]> {
  const res = await fetch(`${GATEWAY_BASE}/embeddings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": gatewayKey(),
    },
    body: JSON.stringify({ model: EMBED_MODEL, input: texts, dimensions: EMBED_DIMS }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Embedding request failed (${res.status}): ${detail.slice(0, 300)}`);
  }
  const json = (await res.json()) as { data: { embedding: number[] }[] };
  return json.data.map((d) => d.embedding);
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatOptions {
  system: string;
  messages: ChatMessage[];
  effort?: "low" | "medium";
}

/**
 * Calls the Responses API with stream: true and accumulates output text.
 * Streaming is required: reasoning runs can take minutes and buffered calls
 * get killed by platform timeouts.
 */
export async function chatComplete({ system, messages, effort = "low" }: ChatOptions): Promise<string> {
  const input = messages.map((m) => ({
    role: m.role,
    content: [{ type: m.role === "assistant" ? "output_text" : "input_text", text: m.content }],
  }));

  const res = await fetch(`${GATEWAY_BASE}/responses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": gatewayKey(),
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: CHAT_MODEL,
      instructions: system,
      input,
      stream: true,
      reasoning: { effort, summary: "auto" },
    }),
  });

  if (!res.ok || !res.body) {
    const detail = await res.text().catch(() => "");
    throw new Error(`AI gateway request failed (${res.status}): ${detail.slice(0, 300)}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let answer = "";
  let streamError: string | null = null;

  const handleEvent = (raw: string) => {
    const lines = raw.split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const payload = trimmed.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      try {
        const evt = JSON.parse(payload) as {
          type?: string;
          delta?: string;
          error?: { message?: string };
        };
        if (evt.type === "response.output_text.delta" && typeof evt.delta === "string") {
          answer += evt.delta;
        } else if (evt.type === "response.failed" || evt.type === "error") {
          streamError = evt.error?.message ?? "The model stream failed.";
        } else if (evt.type === "response.completed") {
          // Terminal event; deltas already accumulated.
        }
      } catch {
        // Partial JSON chunk — ignore, SSE framing will deliver it whole via buffer.
      }
    }
  };

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let sep: number;
    while ((sep = buffer.indexOf("\n\n")) >= 0) {
      const event = buffer.slice(0, sep);
      buffer = buffer.slice(sep + 2);
      handleEvent(event);
    }
  }
  if (buffer.trim()) handleEvent(buffer);

  if (streamError) throw new Error(streamError);
  return answer.trim();
}

/** Translate a query to English for retrieval. Returns the input unchanged for English. */
export async function translateToEnglish(text: string): Promise<string> {
  const out = await chatComplete({
    system:
      "Translate the user's text to English for a search index. Output ONLY the translated text, no quotes, no commentary. Keep standard numbers (like IS 302) exactly as written.",
    messages: [{ role: "user", content: text }],
    effort: "low",
  });
  return out || text;
}
