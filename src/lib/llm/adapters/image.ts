import type { AdapterContext, ImageRequest, ImageResponse, LlmResponse, ProviderAdapter } from "@/lib/llm/types";

async function generateImage(ctx: AdapterContext, req: ImageRequest): Promise<ImageResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ctx.timeoutMs);
  try {
    const res = await fetch(`${ctx.baseUrl.replace(/\/$/, "")}/images/generations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        [ctx.authHeaderName]: `${ctx.authPrefix}${ctx.apiKey ?? ""}`,
        ...ctx.extraHeaders,
      },
      body: JSON.stringify({
        model: req.model,
        prompt: req.prompt,
        size: req.size ?? "1024x1024",
        n: 1,
      }),
      signal: controller.signal,
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Image provider error ${res.status}: ${errText.slice(0, 400)}`);
    }
    const data = (await res.json()) as {
      data?: { url?: string; b64_json?: string }[];
    };
    const first = data.data?.[0];
    if (first?.url) {
      return {
        kind: "url",
        value: first.url,
        alt: req.alt,
        source: "provider",
        model: req.model,
        providerId: ctx.providerId,
      };
    }
    if (first?.b64_json) {
      return {
        kind: "data-uri",
        value: `data:image/png;base64,${first.b64_json}`,
        alt: req.alt,
        source: "provider",
        model: req.model,
        providerId: ctx.providerId,
      };
    }
    throw new Error("Image provider returned no image");
  } finally {
    clearTimeout(timeout);
  }
}

async function complete(): Promise<LlmResponse> {
  throw new Error("This adapter is image-only");
}

export const imageOpenAiAdapter: ProviderAdapter = {
  protocol: "image-openai",
  complete,
  generateImage,
};

export const imageOpenAiCompatibleAdapter: ProviderAdapter = {
  protocol: "image-openai-compatible",
  complete,
  generateImage,
};
