import type { AdapterContext, LlmRequest, LlmResponse, ProviderAdapter } from "@/lib/llm/types";
import { extractJson } from "@/lib/llm/json";

async function complete(ctx: AdapterContext, req: LlmRequest): Promise<LlmResponse> {
  const started = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), req.timeoutMs ?? ctx.timeoutMs);
  try {
    const res = await fetch(`${ctx.baseUrl.replace(/\/$/, "")}/responses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        [ctx.authHeaderName]: `${ctx.authPrefix}${ctx.apiKey ?? ""}`,
        ...ctx.extraHeaders,
      },
      body: JSON.stringify({
        model: req.model,
        input: req.messages.map((m) => `${m.role}: ${m.content}`).join("\n"),
        max_output_tokens: req.maxTokens ?? 3000,
        temperature: req.temperature ?? 0.4,
      }),
      signal: controller.signal,
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Responses API error ${res.status}: ${errText.slice(0, 400)}`);
    }
    const data = (await res.json()) as {
      output_text?: string;
      output?: { content?: { text?: string }[] }[];
      usage?: { input_tokens?: number; output_tokens?: number };
      model?: string;
    };
    const text =
      data.output_text ||
      data.output?.flatMap((o) => o.content ?? []).map((c) => c.text ?? "").join("\n") ||
      "";
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

export const openaiResponsesAdapter: ProviderAdapter = {
  protocol: "openai-responses",
  complete,
};
