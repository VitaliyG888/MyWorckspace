import type { AdapterContext, LlmRequest, LlmResponse, ProviderAdapter } from "@/lib/llm/types";
import { extractJson } from "@/lib/llm/json";

async function complete(ctx: AdapterContext, req: LlmRequest): Promise<LlmResponse> {
  const started = Date.now();
  const body: Record<string, unknown> = {
    model: req.model,
    messages: req.messages,
    temperature: req.temperature ?? 0.4,
    max_tokens: req.maxTokens ?? 3000,
  };
  if (req.jsonSchema && ctx.capabilities.structuredOutput) {
    body.response_format = {
      type: "json_schema",
      json_schema: {
        name: req.jsonSchemaName || "result",
        schema: req.jsonSchema,
        strict: false,
      },
    };
  } else if (req.jsonSchema) {
    body.response_format = { type: "json_object" };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), req.timeoutMs ?? ctx.timeoutMs);
  try {
    const res = await fetch(`${ctx.baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        [ctx.authHeaderName]: `${ctx.authPrefix}${ctx.apiKey ?? ""}`,
        ...ctx.extraHeaders,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Provider error ${res.status}: ${errText.slice(0, 400)}`);
    }
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
      usage?: { prompt_tokens?: number; completion_tokens?: number };
      model?: string;
    };
    const text = data.choices?.[0]?.message?.content ?? "";
    let json: unknown;
    if (req.jsonSchema) json = extractJson(text);
    return {
      text,
      json,
      model: data.model || req.model,
      providerId: ctx.providerId,
      usage: {
        inputTokens: data.usage?.prompt_tokens ?? 0,
        outputTokens: data.usage?.completion_tokens ?? 0,
        durationMs: Date.now() - started,
      },
    };
  } finally {
    clearTimeout(timeout);
  }
}

export const openaiChatAdapter: ProviderAdapter = {
  protocol: "openai-chat-completions",
  complete,
};
