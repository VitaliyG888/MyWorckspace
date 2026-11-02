import type { ProviderAdapter } from "@/lib/llm/types";
import { openaiChatAdapter } from "./adapters/openai-chat";
import { openaiResponsesAdapter } from "./adapters/openai-responses";
import { anthropicAdapter } from "./adapters/anthropic";
import { googleAdapter } from "./adapters/google";
import { ollamaAdapter } from "./adapters/ollama";
import { imageOpenAiAdapter, imageOpenAiCompatibleAdapter } from "./adapters/image";
import { demoAdapter } from "./adapters/demo";
export { BUILTIN_PROVIDER_PRESETS } from "./presets";

const adapters: Record<string, ProviderAdapter> = {
  "openai-chat-completions": openaiChatAdapter,
  "openai-responses": openaiResponsesAdapter,
  "anthropic-messages": anthropicAdapter,
  "google-generative": googleAdapter,
  ollama: ollamaAdapter,
  "image-openai": imageOpenAiAdapter,
  "image-openai-compatible": imageOpenAiCompatibleAdapter,
  demo: demoAdapter,
  custom: openaiChatAdapter,
};

export function getAdapter(protocol: string): ProviderAdapter {
  const adapter = adapters[protocol];
  if (!adapter) throw new Error(`No adapter for protocol ${protocol}`);
  return adapter;
}
