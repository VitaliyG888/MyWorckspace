import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import type { LlmProvider, RoleAssignment } from "@/lib/schema/llm";
import type { SiteDocument } from "@/lib/schema/site-document";
import type { SiteBrief } from "@/lib/schema/site-brief";
import type { GenerationStatus } from "@/lib/schema/common";

export type Workspace = {
  id: string;
  name: string;
  locale: "ru" | "en";
  createdAt: string;
};

export type Project = {
  id: string;
  workspaceId: string;
  name: string;
  siteType: string;
  createdAt: string;
  updatedAt: string;
  currentSiteId?: string;
};

export type InterviewMessage = {
  id: string;
  role: "assistant" | "user" | "system";
  content: string;
  createdAt: string;
};

export type InterviewSession = {
  id: string;
  projectId: string;
  messages: InterviewMessage[];
  briefDraft: Partial<SiteBrief>;
  complete: boolean;
  updatedAt: string;
};

export type GenerationStep = {
  id: string;
  runId: string;
  role: string;
  label: string;
  status: GenerationStatus;
  pageId?: string;
  sectionId?: string;
  message?: string;
  startedAt?: string;
  finishedAt?: string;
};

export type GenerationRun = {
  id: string;
  projectId: string;
  status: "queued" | "running" | "paused" | "completed" | "failed" | "cancelled";
  steps: GenerationStep[];
  createdAt: string;
  updatedAt: string;
};

export type Lead = {
  id: string;
  projectId: string;
  formId: string;
  payload: Record<string, string>;
  destination: string;
  status: "stored" | "forwarded" | "failed";
  createdAt: string;
  error?: string;
};

export type IntegrationConnection = {
  id: string;
  kind: "webhook" | "crm" | "analytics" | "pixel" | "email";
  name: string;
  status: "connected" | "disconnected" | "error" | "requires-setup";
  config: Record<string, string>;
  lastCheckedAt?: string;
  lastError?: string;
};

export type CmsItem = {
  id: string;
  collection: string;
  projectId: string;
  title: string;
  slug: string;
  status: "draft" | "published";
  fields: Record<string, string>;
  createdAt: string;
};

export type UsageRecord = {
  id: string;
  at: string;
  role: string;
  providerId: string;
  modelId: string;
  inputTokens: number;
  outputTokens: number;
  durationMs: number;
  estimatedCost?: number;
};

export type SecretRecord = {
  providerId: string;
  ciphertext: string;
};

export type StudioState = {
  workspace: Workspace;
  projects: Project[];
  sites: SiteDocument[];
  interviews: InterviewSession[];
  providers: LlmProvider[];
  assignments: RoleAssignment[];
  secrets: SecretRecord[];
  runs: GenerationRun[];
  leads: Lead[];
  integrations: IntegrationConnection[];
  cms: CmsItem[];
  usage: UsageRecord[];
};

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "studio.json");

let memory: StudioState | null = null;
let writeQueue: Promise<void> = Promise.resolve();

function seed(): StudioState {
  const now = new Date().toISOString();
  return {
    workspace: {
      id: "ws_default",
      name: "Studio",
      locale: "ru",
      createdAt: now,
    },
    projects: [],
    sites: [],
    interviews: [],
    providers: [
      {
        id: "prov_demo",
        displayName: "Built-in demo (offline)",
        protocol: "demo",
        baseUrl: "https://demo.local/v1",
        authHeaderName: "Authorization",
        authPrefix: "Bearer ",
        extraHeaders: {},
        models: [
          {
            id: "demo-orchestrator",
            displayName: "Demo Orchestrator",
            contextLimit: 32000,
            maxOutput: 4096,
            capabilities: {
              text: true,
              vision: false,
              imageInput: false,
              imageGeneration: false,
              structuredOutput: true,
              toolCalling: false,
              streaming: true,
              reasoning: false,
            },
          },
          {
            id: "demo-image",
            displayName: "Demo Image (SVG placeholders)",
            contextLimit: 8000,
            maxOutput: 1024,
            capabilities: {
              text: false,
              vision: false,
              imageInput: false,
              imageGeneration: true,
              structuredOutput: false,
              toolCalling: false,
              streaming: false,
              reasoning: false,
            },
          },
        ],
        timeoutMs: 15000,
        status: "ok",
        hasSecret: false,
        allowLocal: true,
        kind: "llm",
        createdAt: now,
        updatedAt: now,
        lastTestedAt: now,
      },
    ],
    assignments: [
      { role: "orchestrator", providerId: "prov_demo", modelId: "demo-orchestrator" },
      { role: "interviewer", providerId: "prov_demo", modelId: "demo-orchestrator" },
      { role: "researcher", providerId: "prov_demo", modelId: "demo-orchestrator" },
      { role: "architect", providerId: "prov_demo", modelId: "demo-orchestrator" },
      { role: "visual-director", providerId: "prov_demo", modelId: "demo-orchestrator" },
      { role: "copywriter", providerId: "prov_demo", modelId: "demo-orchestrator" },
      { role: "block-builder", providerId: "prov_demo", modelId: "demo-orchestrator" },
      { role: "motion-designer", providerId: "prov_demo", modelId: "demo-orchestrator" },
      { role: "seo-agent", providerId: "prov_demo", modelId: "demo-orchestrator" },
      { role: "integrations-agent", providerId: "prov_demo", modelId: "demo-orchestrator" },
      { role: "qa-agent", providerId: "prov_demo", modelId: "demo-orchestrator" },
      { role: "image-generator", providerId: "prov_demo", modelId: "demo-image" },
      { role: "article-writer", providerId: "prov_demo", modelId: "demo-orchestrator" },
    ],
    secrets: [],
    runs: [],
    leads: [],
    integrations: [
      {
        id: "int_local_leads",
        kind: "webhook",
        name: "Local lead store",
        status: "connected",
        config: { destination: "studio-leads" },
        lastCheckedAt: now,
      },
    ],
    cms: [],
    usage: [],
  };
}

async function persist(state: StudioState): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  const clone = structuredClone(state);
  await writeFile(DATA_FILE, JSON.stringify(clone, null, 2), "utf8");
}

export async function loadState(): Promise<StudioState> {
  if (memory) return memory;
  try {
    const raw = await readFile(DATA_FILE, "utf8");
    memory = JSON.parse(raw) as StudioState;
    return memory;
  } catch {
    memory = seed();
    await persist(memory);
    return memory;
  }
}

export async function mutateState<T>(fn: (state: StudioState) => T | Promise<T>): Promise<T> {
  const run = writeQueue.then(async () => {
    const state = await loadState();
    const result = await fn(state);
    await persist(state);
    return result;
  });
  writeQueue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

export async function readState(): Promise<StudioState> {
  return loadState();
}
