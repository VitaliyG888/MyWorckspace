import type { AgentRole, ModelCapability } from "@/lib/schema/llm";

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type LlmRequest = {
  messages: ChatMessage[];
  model: string;
  temperature?: number;
  maxTokens?: number;
  jsonSchemaName?: string;
  jsonSchema?: Record<string, unknown>;
  timeoutMs?: number;
};

export type LlmUsage = {
  inputTokens: number;
  outputTokens: number;
  durationMs: number;
};

export type LlmResponse = {
  text: string;
  json?: unknown;
  usage: LlmUsage;
  model: string;
  providerId: string;
};

export type ImageRequest = {
  prompt: string;
  model: string;
  size?: "1024x1024" | "1792x1024" | "1024x1792";
  alt: string;
};

export type ImageResponse = {
  kind: "url" | "svg" | "data-uri";
  value: string;
  alt: string;
  source: "provider" | "draft-placeholder";
  model: string;
  providerId: string;
};

export type AdapterContext = {
  providerId: string;
  baseUrl: string;
  apiKey?: string;
  authHeaderName: string;
  authPrefix: string;
  extraHeaders: Record<string, string>;
  timeoutMs: number;
  capabilities: ModelCapability;
};

export type ProviderAdapter = {
  protocol: string;
  complete(ctx: AdapterContext, req: LlmRequest): Promise<LlmResponse>;
  generateImage?(ctx: AdapterContext, req: ImageRequest): Promise<ImageResponse>;
};

export type RoutedCall = {
  role: AgentRole;
  request: LlmRequest;
};
