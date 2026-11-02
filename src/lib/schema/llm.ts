import { z } from "zod";

export const llmProtocolSchema = z.enum([
  "openai-chat-completions",
  "openai-responses",
  "anthropic-messages",
  "google-generative",
  "ollama",
  "image-openai",
  "image-openai-compatible",
  "image-stability",
  "demo",
  "custom",
]);
export type LlmProtocol = z.infer<typeof llmProtocolSchema>;

export const modelCapabilitySchema = z.object({
  text: z.boolean().default(true),
  vision: z.boolean().default(false),
  imageInput: z.boolean().default(false),
  imageGeneration: z.boolean().default(false),
  structuredOutput: z.boolean().default(false),
  toolCalling: z.boolean().default(false),
  streaming: z.boolean().default(true),
  reasoning: z.boolean().default(false),
});
export type ModelCapability = z.infer<typeof modelCapabilitySchema>;

export const agentRoleSchema = z.enum([
  "orchestrator",
  "interviewer",
  "researcher",
  "architect",
  "visual-director",
  "copywriter",
  "block-builder",
  "motion-designer",
  "seo-agent",
  "integrations-agent",
  "qa-agent",
  "image-generator",
  "article-writer",
]);
export type AgentRole = z.infer<typeof agentRoleSchema>;

export const llmModelSchema = z.object({
  id: z.string().min(1),
  displayName: z.string().min(1),
  contextLimit: z.number().int().positive().default(128000),
  maxOutput: z.number().int().positive().default(4096),
  capabilities: modelCapabilitySchema,
  inputCostPer1k: z.number().min(0).optional(),
  outputCostPer1k: z.number().min(0).optional(),
});
export type LlmModel = z.infer<typeof llmModelSchema>;

export const connectionStatusSchema = z.enum([
  "untested",
  "ok",
  "error",
  "requires-setup",
]);

export const llmProviderSchema = z.object({
  id: z.string().min(1),
  displayName: z.string().min(1),
  protocol: llmProtocolSchema,
  baseUrl: z.string().url(),
  authHeaderName: z.string().default("Authorization"),
  authPrefix: z.string().default("Bearer "),
  extraHeaders: z.record(z.string()).default({}),
  models: z.array(llmModelSchema).default([]),
  timeoutMs: z.number().int().positive().default(60000),
  status: connectionStatusSchema.default("untested"),
  lastError: z.string().optional(),
  lastTestedAt: z.string().optional(),
  hasSecret: z.boolean().default(false),
  allowLocal: z.boolean().default(false),
  kind: z.enum(["llm", "image", "content"]).default("llm"),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type LlmProvider = z.infer<typeof llmProviderSchema>;

export const roleAssignmentSchema = z.object({
  role: agentRoleSchema,
  providerId: z.string().min(1),
  modelId: z.string().min(1),
  fallbackProviderId: z.string().optional(),
  fallbackModelId: z.string().optional(),
});
export type RoleAssignment = z.infer<typeof roleAssignmentSchema>;

export const ALL_AGENT_ROLES: AgentRole[] = [
  "orchestrator",
  "interviewer",
  "researcher",
  "architect",
  "visual-director",
  "copywriter",
  "block-builder",
  "motion-designer",
  "seo-agent",
  "integrations-agent",
  "qa-agent",
  "image-generator",
  "article-writer",
];
