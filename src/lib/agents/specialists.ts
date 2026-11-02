import { completeForRole, generateImageForRole } from "@/lib/llm/gateway";
import { compilePrompt } from "./prompt-compiler";
import type { SiteBrief } from "@/lib/schema/site-brief";
import { siteBriefSchema } from "@/lib/schema/site-brief";
import { designTokensSchema, type DesignTokens, type PageDocument, type SectionDocument } from "@/lib/schema/site-document";
import { motionConfigSchema, type MotionConfig } from "@/lib/schema/motion";
import { seoMetaSchema, type SeoMeta } from "@/lib/schema/site-document";
import { validateBlock } from "@/lib/blocks/validate";
import { createId } from "@/lib/ids";
import { demoComplete } from "./demo-brain";
import { extractJson } from "@/lib/llm/json";
import type { LlmRequest } from "@/lib/llm/types";

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

async function structured(role: Parameters<typeof completeForRole>[0], prompt: ReturnType<typeof compilePrompt>, schema: Record<string, unknown>) {
  const req: LlmRequest = {
    model: "assigned",
    messages: [
      { role: "system", content: prompt.system },
      { role: "user", content: prompt.user },
    ],
    jsonSchemaName: role,
    jsonSchema: schema,
  };
  try {
    const res = await completeForRole(role, req);
    return asRecord(res.json ?? extractJson(res.text));
  } catch {
    return asRecord(extractJson(demoComplete(req)));
  }
}

export async function runInterviewer(history: { role: "user" | "assistant"; content: string }[], brief: Partial<SiteBrief>) {
  const prompt = compilePrompt({
    role: "interviewer",
    brief,
    extra: `Conversation:\n${history.map((m) => `${m.role}: ${m.content}`).join("\n")}\nReturn JSON {assistantMessage, briefPatch, done}.`,
  });
  const json = await structured("interviewer", prompt, {
    type: "object",
    properties: {
      assistantMessage: { type: "string" },
      briefPatch: { type: "object" },
      done: { type: "boolean" },
    },
    required: ["assistantMessage", "done"],
  });
  return {
    assistantMessage: String(json.assistantMessage ?? "Продолжим интервью."),
    briefPatch: asRecord(json.briefPatch),
    done: Boolean(json.done),
  };
}

export function mergeBrief(current: Partial<SiteBrief>, patch: Record<string, unknown>): Partial<SiteBrief> {
  const next = { ...current, ...patch } as Partial<SiteBrief>;
  if (Array.isArray(patch.confirmedFacts) && Array.isArray(current.confirmedFacts)) {
    next.confirmedFacts = [...current.confirmedFacts, ...(patch.confirmedFacts as SiteBrief["confirmedFacts"])];
  }
  if (Array.isArray(patch.openQuestions) && Array.isArray(current.openQuestions)) {
    next.openQuestions = [...current.openQuestions, ...(patch.openQuestions as SiteBrief["openQuestions"])];
  }
  return next;
}

export function finalizeBrief(draft: Partial<SiteBrief>): SiteBrief {
  const fallback: SiteBrief = {
    version: 1,
    siteType: draft.siteType ?? "corporate",
    locale: draft.locale ?? "ru",
    brandName: draft.brandName || "Untitled brand",
    tagline: draft.tagline,
    description: draft.description || "Описание будет уточнено. Это черновик, а не выдуманный факт.",
    industry: draft.industry || "general",
    businessModel: draft.businessModel,
    primaryCta: draft.primaryCta || "Оставить заявку",
    secondaryCtas: draft.secondaryCtas ?? ["Смотреть услуги"],
    confirmedFacts: draft.confirmedFacts ?? [],
    assumptions: draft.assumptions ?? [
      {
        id: "asm_generic",
        text: "Часть формулировок создана как нейтральный черновик",
        reason: "Пользователь не дал полный бриф",
        confidence: "low",
        field: "copy",
      },
    ],
    openQuestions: draft.openQuestions ?? [],
    constraints: draft.constraints ?? [],
    goals: draft.goals ?? [{ id: "goal_lead", text: "Собрать заявку", primary: true }],
    audiences: draft.audiences ?? [{ id: "aud_main", name: "Целевые клиенты", description: "Уточняется" }],
    offers: draft.offers ?? [],
    pagesRequested: draft.pagesRequested ?? ["home", "services", "about", "contact"],
    brandPreferences: draft.brandPreferences ?? { colors: [], fonts: [], visualRefs: [], hasLogo: false },
    integrationsRequested: draft.integrationsRequested ?? ["local-leads"],
    seoContext: draft.seoContext ?? { topics: [] },
    language: draft.language ?? "ru",
    domainIntent: draft.domainIntent,
    legalNotes: draft.legalNotes ?? [],
    approvedByUser: Boolean(draft.approvedByUser),
  };
  return siteBriefSchema.parse(fallback);
}

export async function runArchitect(brief: SiteBrief) {
  const prompt = compilePrompt({
    role: "architect",
    brief,
    extra: "Return sitemap JSON {pages:[{slug,name,purpose,plannedSections}]}.",
  });
  const json = await structured("architect", prompt, { type: "object" });
  const pages = Array.isArray(json.pages) ? json.pages : [];
  return pages.map((page) => {
    const p = asRecord(page);
    return {
      slug: String(p.slug ?? "page"),
      name: String(p.name ?? "Page"),
      purpose: String(p.purpose ?? "Page purpose"),
      plannedSections: Array.isArray(p.plannedSections) ? p.plannedSections.map(String) : ["navbar", "hero", "footer"],
    };
  });
}

export async function runVisualDirector(brief: SiteBrief): Promise<DesignTokens> {
  const prompt = compilePrompt({
    role: "visual-director",
    brief,
    extra: "Return design tokens JSON.",
  });
  const json = await structured("visual-director", prompt, { type: "object" });
  return designTokensSchema.parse(json);
}

export async function runCopywriter(brief: SiteBrief, pageName: string, blockType: string) {
  const prompt = compilePrompt({
    role: "copywriter",
    brief,
    pageObjective: pageName,
    extra: `Write content props for blockType=${blockType}. Return JSON props only.`,
  });
  return structured("copywriter", prompt, { type: "object" });
}

export async function runBlockBuilder(
  brief: SiteBrief,
  tokens: DesignTokens,
  page: { name: string; purpose: string },
  blockType: string,
): Promise<SectionDocument> {
  const prompt = compilePrompt({
    role: "block-builder",
    brief,
    tokens,
    pageObjective: `${page.name}: ${page.purpose}`,
    extra: `Generate section JSON for blockType=${blockType}. Include type, variant, props.`,
  });
  let json = await structured("block-builder", prompt, { type: "object" });
  let type = String(json.type ?? blockType);
  let props = asRecord(json.props ?? json);
  let check = validateBlock(type, props);
  let attempts = 1;
  while (!check.ok && attempts < 3) {
    const repair = compilePrompt({
      role: "block-builder",
      brief,
      extra: `Repair block ${type}. Validator errors: ${check.errors.join("; ")}. Previous JSON: ${JSON.stringify(props)}`,
    });
    json = await structured("block-builder", repair, { type: "object" });
    type = String(json.type ?? type);
    props = asRecord(json.props ?? json);
    check = validateBlock(type, props);
    attempts += 1;
  }
  const image = await maybeImage(brief, type, props);
  if (image) props = { ...props, ...image };
  return {
    id: createId("sec"),
    type,
    variant: String(json.variant ?? "default"),
    props,
    responsive: { hideOnMobile: false, hideOnTablet: false, hideOnDesktop: false },
    motion: motionConfigSchema.parse({}),
    status: check.ok ? "ready" : "failed",
    generationMetadata: {
      agentRole: "block-builder",
      attempts,
      error: check.ok ? undefined : check.errors.join("; "),
    },
  };
}

async function maybeImage(brief: SiteBrief, type: string, props: Record<string, unknown>) {
  if (!["hero", "splitContent", "gallery"].includes(type)) return null;
  try {
    const img = await generateImageForRole("image-generator", {
      prompt: `Abstract branded gradient for ${brief.brandName}, no people, no fake photos. ${String(props.title ?? "")}`,
      model: "assigned",
      alt: String(props.imageAlt ?? `${brief.brandName} draft visual`),
    });
    if (type === "gallery") return null;
    return { imageSrc: img.value, imageAlt: img.alt };
  } catch {
    return null;
  }
}

export async function runMotionDesigner(brief: SiteBrief, section: SectionDocument): Promise<MotionConfig> {
  const prompt = compilePrompt({
    role: "motion-designer",
    brief,
    section,
    extra: `Choose a preset for ${section.type}. Return MotionConfig JSON only.`,
  });
  const json = await structured("motion-designer", prompt, { type: "object" });
  return motionConfigSchema.parse(json);
}

export async function runSeoAgent(brief: SiteBrief, pageName: string): Promise<SeoMeta> {
  const prompt = compilePrompt({
    role: "seo-agent",
    brief,
    pageObjective: pageName,
    extra: "Return SEO metadata JSON {title, description, jsonLdType, recommendations?}.",
  });
  const json = await structured("seo-agent", prompt, { type: "object" });
  const title = String(json.title ?? `${brief.brandName} — ${pageName}`).slice(0, 70);
  const description = String(json.description ?? `${brief.description} ${pageName}`.repeat(1)).padEnd(40, ".");
  return seoMetaSchema.parse({
    title: title.length >= 8 ? title : `${brief.brandName} page`,
    description: description.slice(0, 180).padEnd(40, "."),
    jsonLdType: json.jsonLdType ?? "Organization",
  });
}

export async function runArticleWriter(brief: SiteBrief) {
  const prompt = compilePrompt({
    role: "article-writer",
    brief,
    extra: "Write a draft article JSON {title, body, status:'draft'}. Do not invent case metrics.",
  });
  const json = await structured("article-writer", prompt, { type: "object" });
  return {
    title: String(json.title ?? `Заметки о ${brief.brandName}`),
    body: String(json.body ?? "Черновик статьи. Подтвердите факты перед публикацией."),
    status: "draft" as const,
  };
}

export async function runQaAgent(pages: PageDocument[]) {
  const issues: string[] = [];
  for (const page of pages) {
    if (!page.seo.title || page.seo.title.length < 8) issues.push(`${page.slug}: weak title`);
    if (page.sections.some((s) => s.status === "failed")) issues.push(`${page.slug}: has failed sections`);
    for (const section of page.sections) {
      if (section.status !== "ready") continue;
      const check = validateBlock(section.type, section.props);
      if (!check.ok) issues.push(`${page.slug}/${section.type}: ${check.errors.join(", ")}`);
    }
  }
  return { ok: issues.length === 0, issues };
}
