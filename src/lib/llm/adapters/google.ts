import type { AdapterContext, LlmRequest, LlmResponse, ProviderAdapter } from "@/lib/llm/types";
import { extractJson } from "@/lib/llm/json";

async function complete(ctx: AdapterContext, req: LlmRequest): Promise<LlmResponse> {
  const started = Date.now();
  const contents = req.messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));
  const system = req.messages.filter((m) => m.role === "system").map((m) => m.content).join("\n");
  const url = `${ctx.baseUrl.replace(/\/$/, "")}/models/${encodeURIComponent(req.model)}:generateContent?key=${encodeURIComponent(ctx.apiKey ?? "")}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), req.timeoutMs ?? ctx.timeoutMs);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...ctx.extraHeaders },
      body: JSON.stringify({
        systemInstruction: system ? { parts: [{ text: system }] } : undefined,
        contents,
        generationConfig: {
          temperature: req.temperature ?? 0.4,
          maxOutputTokens: req.maxTokens ?? 3000,
          responseMimeType: req.jsonSchema ? "application/json" : undefined,
        },
      }),
      signal: controller.signal,
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Gemini error ${res.status}: ${errText.slice(0, 400)}`);
    }
    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
      usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number };
    };
    const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("\n") ?? "";
    let json: unknown;
    if (req.jsonSchema) json = extractJson(text);
    return {
      text,
      json,
      model: req.model,
      providerId: ctx.providerId,
      usage: {
        inputTokens: data.usageMetadata?.promptTokenCount ?? 0,
        outputTokens: data.usageMetadata?.candidatesTokenCount ?? 0,
        durationMs: Date.now() - started,
      },
    };
  } finally {
    clearTimeout(timeout);
  }
}

export const googleAdapter: ProviderAdapter = {
  protocol: "google-generative",
  complete,
};
