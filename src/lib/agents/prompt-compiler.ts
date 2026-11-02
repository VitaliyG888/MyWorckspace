import type { AgentRole } from "@/lib/schema/llm";
import type { SiteBrief } from "@/lib/schema/site-brief";
import type { DesignTokens, SectionDocument } from "@/lib/schema/site-document";

const POLICY = `You are a specialized agent in AI Website Studio.
Never invent reviews, client names, awards, statistics, licenses, partnerships, phones, addresses or prices.
If a fact is missing, mark it as assumption or draft. Return JSON only when asked.
Do not emit executable JavaScript. Do not rewrite neighboring sections.`;

export const PROMPT_VERSION = "2026-11-02.1";

export function compilePrompt(input: {
  role: AgentRole;
  brief?: Partial<SiteBrief> | SiteBrief;
  tokens?: DesignTokens;
  pageObjective?: string;
  section?: Partial<SectionDocument>;
  extra?: string;
}): { system: string; user: string } {
  const parts = [
    POLICY,
    `Role: ${input.role}`,
    `Prompt version: ${PROMPT_VERSION}`,
  ];
  if (input.role === "motion-designer") {
    parts.push("Return only MotionConfig JSON. Never change copy, structure, hrefs or integrations.");
  }
  if (input.brief) {
    parts.push(`SiteBrief JSON:\n${JSON.stringify(summarizeBrief(input.brief))}`);
  }
  if (input.tokens) {
    parts.push(`Design tokens: ${JSON.stringify(input.tokens)}`);
  }
  if (input.pageObjective) {
    parts.push(`Page objective: ${input.pageObjective}`);
  }
  if (input.section) {
    parts.push(`Section spec: ${JSON.stringify({ type: input.section.type, variant: input.section.variant, id: input.section.id })}`);
  }
  return {
    system: parts.join("\n\n"),
    user: input.extra || "Produce the required JSON.",
  };
}

function summarizeBrief(brief: Partial<SiteBrief>): Record<string, unknown> {
  return {
    brandName: brief.brandName,
    description: brief.description,
    industry: brief.industry,
    siteType: brief.siteType,
    primaryCta: brief.primaryCta,
    locale: brief.locale,
    goals: brief.goals,
    offers: brief.offers,
    audiences: brief.audiences,
    confirmedFacts: brief.confirmedFacts,
    assumptions: brief.assumptions,
    pagesRequested: brief.pagesRequested,
    seoContext: brief.seoContext,
    constraints: brief.constraints,
  };
}
