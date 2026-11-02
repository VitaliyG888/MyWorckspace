import { decryptSecret } from "@/lib/crypto/secrets";
import { createId } from "@/lib/ids";
import type { AgentRole, LlmProvider } from "@/lib/schema/llm";
import { mutateState, readState } from "@/lib/store/db";
import { getAdapter } from "./registry";
import { assertSafeProviderUrl } from "./ssrf";
import type { AdapterContext, ImageRequest, ImageResponse, LlmRequest, LlmResponse } from "./types";

function defaultCapabilities() {
  return {
    text: true,
    vision: false,
    imageInput: false,
    imageGeneration: false,
    structuredOutput: false,
    toolCalling: false,
    streaming: true,
    reasoning: false,
  };
}

async function buildContext(provider: LlmProvider, modelId: string): Promise<AdapterContext> {
  const allowLocal = provider.allowLocal || process.env.STUDIO_ALLOW_LOCAL_LLM === "true";
  if (provider.protocol !== "demo") {
    await assertSafeProviderUrl(provider.baseUrl, allowLocal);
  }
  const state = await readState();
  const secret = state.secrets.find((s) => s.providerId === provider.id);
  const model = provider.models.find((m) => m.id === modelId);
  return {
    providerId: provider.id,
    baseUrl: provider.baseUrl,
    apiKey: secret ? decryptSecret(secret.ciphertext) : undefined,
    authHeaderName: provider.authHeaderName,
    authPrefix: provider.authPrefix,
    extraHeaders: provider.extraHeaders,
    timeoutMs: provider.timeoutMs,
    capabilities: model?.capabilities ?? defaultCapabilities(),
  };
}

async function recordUsage(role: string, response: LlmResponse) {
  await mutateState((state) => {
    state.usage.unshift({
      id: createId("use"),
      at: new Date().toISOString(),
      role,
      providerId: response.providerId,
      modelId: response.model,
      inputTokens: response.usage.inputTokens,
      outputTokens: response.usage.outputTokens,
      durationMs: response.usage.durationMs,
    });
    state.usage = state.usage.slice(0, 500);
  });
}

export async function completeForRole(role: AgentRole, request: LlmRequest): Promise<LlmResponse> {
  const state = await readState();
  const assignment = state.assignments.find((a) => a.role === role);
  if (!assignment) throw new Error(`No model assigned for role ${role}`);
  const provider = state.providers.find((p) => p.id === assignment.providerId);
  if (!provider) throw new Error(`Provider ${assignment.providerId} not found`);
  try {
    const adapter = getAdapter(provider.protocol);
    const ctx = await buildContext(provider, assignment.modelId);
    const response = await adapter.complete(ctx, { ...request, model: assignment.modelId });
    await recordUsage(role, response);
    return response;
  } catch (error) {
    if (!assignment.fallbackProviderId || !assignment.fallbackModelId) throw error;
    const fallback = state.providers.find((p) => p.id === assignment.fallbackProviderId);
    if (!fallback) throw error;
    const adapter = getAdapter(fallback.protocol);
    const ctx = await buildContext(fallback, assignment.fallbackModelId);
    const response = await adapter.complete(ctx, { ...request, model: assignment.fallbackModelId });
    await recordUsage(`${role}:fallback`, response);
    return response;
  }
}

export async function generateImageForRole(role: AgentRole, request: ImageRequest): Promise<ImageResponse> {
  const state = await readState();
  const assignment = state.assignments.find((a) => a.role === role);
  if (!assignment) throw new Error(`No image model assigned for ${role}`);
  const provider = state.providers.find((p) => p.id === assignment.providerId);
  if (!provider) throw new Error("Image provider not found");
  const adapter = getAdapter(provider.protocol);
  if (!adapter.generateImage) {
    const demo = getAdapter("demo");
    const ctx = await buildContext(provider, assignment.modelId);
    return demo.generateImage!(ctx, request);
  }
  const ctx = await buildContext(provider, assignment.modelId);
  return adapter.generateImage(ctx, { ...request, model: assignment.modelId });
}

export async function testProvider(providerId: string): Promise<{ ok: boolean; message: string }> {
  const state = await readState();
  const provider = state.providers.find((p) => p.id === providerId);
  if (!provider) return { ok: false, message: "Provider not found" };
  try {
    const modelId = provider.models[0]?.id;
    if (!modelId) return { ok: false, message: "Add at least one model ID" };
    const adapter = getAdapter(provider.protocol);
    const ctx = await buildContext(provider, modelId);
    if (adapter.generateImage && !adapter.protocol.startsWith("demo") && provider.kind === "image") {
      await adapter.generateImage(ctx, {
        prompt: "A simple abstract gradient, draft placeholder, no people",
        model: modelId,
        alt: "connection test",
      });
    } else {
      await adapter.complete(ctx, {
        model: modelId,
        messages: [
          { role: "system", content: "Reply with the JSON object {\"ok\":true} and nothing else." },
          { role: "user", content: "ping" },
        ],
        maxTokens: 32,
        jsonSchema: {
          type: "object",
          properties: { ok: { type: "boolean" } },
          required: ["ok"],
        },
      });
    }
    await mutateState((s) => {
      const p = s.providers.find((item) => item.id === providerId);
      if (p) {
        p.status = "ok";
        p.lastError = undefined;
        p.lastTestedAt = new Date().toISOString();
        p.updatedAt = p.lastTestedAt;
      }
    });
    return { ok: true, message: "Connection succeeded" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    await mutateState((s) => {
      const p = s.providers.find((item) => item.id === providerId);
      if (p) {
        p.status = "error";
        p.lastError = message;
        p.lastTestedAt = new Date().toISOString();
        p.updatedAt = p.lastTestedAt;
      }
    });
    return { ok: false, message };
  }
}
