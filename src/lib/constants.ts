export const SITE_TYPES = [
  { id: "landing", label: "Landing page" },
  { id: "corporate", label: "Corporate" },
  { id: "service", label: "Service" },
  { id: "portfolio", label: "Portfolio" },
  { id: "blog", label: "Blog" },
  { id: "catalog", label: "Catalog" },
  { id: "event", label: "Event" },
  { id: "saas", label: "SaaS marketing" },
  { id: "local-business", label: "Local business" },
];

export const ROLE_LABELS: Record<string, string> = {
  orchestrator: "Orchestrator",
  interviewer: "Interviewer",
  researcher: "Research",
  architect: "Site architect",
  "visual-director": "Brand / visual director",
  copywriter: "Copywriter",
  "block-builder": "Block builder",
  "motion-designer": "Motion designer",
  "seo-agent": "SEO / AEO",
  "integrations-agent": "Integrations",
  "qa-agent": "QA",
  "image-generator": "Image generator",
  "article-writer": "Article writer",
};

export const PROTOCOLS = [
  { id: "openai-chat-completions", label: "OpenAI Chat Completions" },
  { id: "openai-responses", label: "OpenAI Responses" },
  { id: "anthropic-messages", label: "Anthropic Messages" },
  { id: "google-generative", label: "Google Generative" },
  { id: "ollama", label: "Ollama" },
  { id: "image-openai", label: "OpenAI Images" },
  { id: "image-openai-compatible", label: "OpenAI-compatible images" },
  { id: "demo", label: "Built-in demo" },
  { id: "custom", label: "Custom (Chat Completions fallback)" },
];
