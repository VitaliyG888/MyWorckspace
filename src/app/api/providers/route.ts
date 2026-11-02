import { fail, json, readBody } from "@/lib/api";
import { encryptSecret } from "@/lib/crypto/secrets";
import { createId } from "@/lib/ids";
import { nowIso } from "@/lib/schema/common";
import { llmProtocolSchema, modelCapabilitySchema, type LlmModel } from "@/lib/schema/llm";
import { mutateState } from "@/lib/store/db";

export async function POST(req: Request) {
  const body = await readBody<{
    displayName?: string;
    protocol?: string;
    baseUrl?: string;
    apiKey?: string;
    authHeaderName?: string;
    authPrefix?: string;
    models?: string;
    kind?: "llm" | "image" | "content";
    allowLocal?: boolean;
    extraHeaders?: Record<string, string>;
  }>(req);
  const protocol = llmProtocolSchema.safeParse(body.protocol ?? "openai-chat-completions");
  if (!protocol.success) return fail("Unknown protocol");
  if (!body.displayName || !body.baseUrl) return fail("Name and base URL are required");
  const models: LlmModel[] = (body.models || "custom-model")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
    .map((id) => ({
      id,
      displayName: id,
      contextLimit: 128000,
      maxOutput: 4096,
      capabilities: modelCapabilitySchema.parse({
        text: body.kind !== "image",
        imageGeneration: body.kind === "image",
        structuredOutput: body.kind !== "image",
        streaming: body.kind !== "image",
      }),
    }));
  const provider = await mutateState((state) => {
    const item = {
      id: createId("prov"),
      displayName: body.displayName!,
      protocol: protocol.data,
      baseUrl: body.baseUrl!,
      authHeaderName: body.authHeaderName || "Authorization",
      authPrefix: body.authPrefix ?? "Bearer ",
      extraHeaders: body.extraHeaders ?? {},
      models,
      timeoutMs: 60000,
      status: "untested" as const,
      hasSecret: Boolean(body.apiKey),
      allowLocal: Boolean(body.allowLocal),
      kind: body.kind ?? "llm",
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    state.providers.push(item);
    if (body.apiKey) {
      state.secrets = state.secrets.filter((s) => s.providerId !== item.id);
      state.secrets.push({ providerId: item.id, ciphertext: encryptSecret(body.apiKey) });
    }
    return item;
  });
  return json(provider, 201);
}
