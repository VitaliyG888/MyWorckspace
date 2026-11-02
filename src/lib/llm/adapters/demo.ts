import type {
  AdapterContext,
  ImageRequest,
  ImageResponse,
  LlmRequest,
  LlmResponse,
  ProviderAdapter,
} from "@/lib/llm/types";
import { extractJson } from "@/lib/llm/json";
import { demoComplete } from "@/lib/agents/demo-brain";

async function complete(_ctx: AdapterContext, req: LlmRequest): Promise<LlmResponse> {
  const started = Date.now();
  const text = demoComplete(req);
  let json: unknown;
  if (req.jsonSchema) {
    try {
      json = extractJson(text);
    } catch {
      json = undefined;
    }
  }
  return {
    text,
    json,
    model: req.model,
    providerId: _ctx.providerId,
    usage: {
      inputTokens: Math.ceil(req.messages.reduce((n, m) => n + m.content.length, 0) / 4),
      outputTokens: Math.ceil(text.length / 4),
      durationMs: Date.now() - started,
    },
  };
}

function generateImage(ctx: AdapterContext, req: ImageRequest): Promise<ImageResponse> {
  const svg = encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#7C3AED"/>
          <stop offset="1" stop-color="#0891B2"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="800" fill="#0F172A"/>
      <rect x="80" y="80" width="1040" height="640" rx="32" fill="url(#g)" opacity="0.35"/>
      <text x="600" y="390" text-anchor="middle" fill="#F8FAFC" font-family="Inter,sans-serif" font-size="36">${escapeXml(req.alt.slice(0, 48))}</text>
      <text x="600" y="440" text-anchor="middle" fill="#CBD5E1" font-family="Inter,sans-serif" font-size="18">Draft visual · not a real photo</text>
    </svg>`,
  );
  return Promise.resolve({
    kind: "data-uri",
    value: `data:image/svg+xml,${svg}`,
    alt: `${req.alt} (draft placeholder)`,
    source: "draft-placeholder",
    model: req.model,
    providerId: ctx.providerId,
  });
}

function escapeXml(value: string): string {
  return value.replace(/[<>&'"]/g, (ch) => {
    switch (ch) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      default:
        return "&quot;";
    }
  });
}

export const demoAdapter: ProviderAdapter = {
  protocol: "demo",
  complete,
  generateImage,
};
