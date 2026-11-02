import type { AdapterContext, LlmRequest, LlmResponse, ProviderAdapter } from "@/lib/llm/types";
import { extractJson } from "@/lib/llm/json";

async function complete(ctx: AdapterContext, req: LlmRequest): Promise<LlmResponse> {
  const started = Date.now();
  const system = req.messages.filter((m) => m.role === "system").map((m) => m.content).join("\n");
  const messages = req.messages
    .filter((m) => m.role !== "system")
    .map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content }));

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), req.timeoutMs ?? ctx.timeoutMs);
  try {
    const res = await fetch(`${ctx.baseUrl.replace(/\/$/, "")}/v1/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ctx.apiKey ?? "",
        "anthropic-version": "2023-06-01",
        ...ctx.extraHeaders,
      },
      body: JSON.stringify({
        model: req.model,
        max_tokens: req.maxTokens ?? 3000,
        temperature: req.temperature ?? 0.4,
        system,
        messages,
      }),
      signal: controller.signal,
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Anthropic error ${res.status}: ${errText.slice(0, 400)}`);
    }
    const data = (await res.json()) as {
      content?: { type: string; text?: string }[];
      usage?: { input_tokens?: number; output_tokens?: number };
      model?: string;
    };
    const text = data.content?.map((c) => c.text ?? "").join("\n") ?? "";
    let json: unknown;
    if (req.jsonSchema) json = extractJson(text);
    return {
      text,
      json,
      model: data.model || req.model,
      providerId: ctx.providerId,
      usage: {
        inputTokens: data.usage?.input_tokens ?? 0,
        outputTokens: data.usage?.output_tokens ?? 0,
        durationMs: Date.now() - started,
      },
    };
  } finally {
    clearTimeout(timeout);
  }
}

export const anthropicAdapter: ProviderAdapter = {
  protocol: "anthropic-messages",
  complete,
};
