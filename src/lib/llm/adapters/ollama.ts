import type { AdapterContext, LlmRequest, LlmResponse, ProviderAdapter } from "@/lib/llm/types";
import { extractJson } from "@/lib/llm/json";

async function complete(ctx: AdapterContext, req: LlmRequest): Promise<LlmResponse> {
  const started = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), req.timeoutMs ?? ctx.timeoutMs);
  try {
    const res = await fetch(`${ctx.baseUrl.replace(/\/$/, "")}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...ctx.extraHeaders },
      body: JSON.stringify({
        model: req.model,
        messages: req.messages,
        stream: false,
        format: req.jsonSchema ? "json" : undefined,
        options: { temperature: req.temperature ?? 0.4 },
      }),
      signal: controller.signal,
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Ollama error ${res.status}: ${errText.slice(0, 400)}`);
    }
    const data = (await res.json()) as {
      message?: { content?: string };
      prompt_eval_count?: number;
      eval_count?: number;
    };
    const text = data.message?.content ?? "";
    let json: unknown;
    if (req.jsonSchema) json = extractJson(text);
    return {
      text,
      json,
      model: req.model,
      providerId: ctx.providerId,
      usage: {
        inputTokens: data.prompt_eval_count ?? 0,
        outputTokens: data.eval_count ?? 0,
        durationMs: Date.now() - started,
      },
    };
  } finally {
    clearTimeout(timeout);
  }
}

export const ollamaAdapter: ProviderAdapter = {
  protocol: "ollama",
  complete,
};
