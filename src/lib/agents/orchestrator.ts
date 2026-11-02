import { createId } from "@/lib/ids";
import { nowIso } from "@/lib/schema/common";
import type { SiteBrief } from "@/lib/schema/site-brief";
import type { PageDocument, SiteDocument } from "@/lib/schema/site-document";
import { mutateState, type GenerationRun, type GenerationStep } from "@/lib/store/db";
import {
  finalizeBrief,
  runArchitect,
  runArticleWriter,
  runBlockBuilder,
  runMotionDesigner,
  runQaAgent,
  runSeoAgent,
  runVisualDirector,
} from "./specialists";

export type ProgressEvent = {
  runId: string;
  stepId: string;
  label: string;
  status: string;
  message?: string;
};

async function updateRun(runId: string, mut: (run: GenerationRun) => void) {
  await mutateState((state) => {
    const run = state.runs.find((r) => r.id === runId);
    if (run) {
      mut(run);
      run.updatedAt = nowIso();
    }
  });
}

async function step(runId: string, label: string, role: string, fn: () => Promise<void>, pageId?: string, sectionId?: string) {
  const stepId = createId("stp");
  const started: GenerationStep = {
    id: stepId,
    runId,
    role,
    label,
    status: "generating",
    pageId,
    sectionId,
    startedAt: nowIso(),
  };
  await updateRun(runId, (run) => {
    run.steps.push(started);
    run.status = "running";
  });
  try {
    await fn();
    await updateRun(runId, (run) => {
      const s = run.steps.find((x) => x.id === stepId);
      if (s) {
        s.status = "ready";
        s.finishedAt = nowIso();
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Step failed";
    await updateRun(runId, (run) => {
      const s = run.steps.find((x) => x.id === stepId);
      if (s) {
        s.status = "failed";
        s.message = message;
        s.finishedAt = nowIso();
      }
      run.status = "failed";
    });
    throw error;
  }
}

export async function startGeneration(projectId: string, briefDraft: Partial<SiteBrief>): Promise<SiteDocument> {
  const runId = createId("run");
  const now = nowIso();
  await mutateState((state) => {
    state.runs.unshift({
      id: runId,
      projectId,
      status: "queued",
      steps: [],
      createdAt: now,
      updatedAt: now,
    });
  });

  const brief = finalizeBrief(briefDraft);
  let tokens = (await import("@/lib/schema/site-document")).DEFAULT_TOKENS;
  let planned: { slug: string; name: string; purpose: string; plannedSections: string[] }[] = [];

  await step(runId, "Visual director: design tokens", "visual-director", async () => {
    tokens = await runVisualDirector(brief);
  });
  await step(runId, "Architect: sitemap", "architect", async () => {
    planned = await runArchitect(brief);
    if (planned.length < 2) throw new Error("Sitemap must contain at least two pages");
  });

  const pages: PageDocument[] = [];
  for (const plan of planned) {
    const pageId = createId("page");
    const seo = await runSeoAgent(brief, plan.name);
    const page: PageDocument = {
      id: pageId,
      slug: plan.slug.replace(/^\//, "") || "home",
      name: plan.name,
      purpose: plan.purpose,
      seo,
      sections: [],
    };
    for (const blockType of plan.plannedSections) {
      await step(
        runId,
        `${plan.name}: ${blockType}`,
        "block-builder",
        async () => {
          const section = await runBlockBuilder(brief, tokens, plan, blockType);
          if (section.status === "ready") {
            section.motion = await runMotionDesigner(brief, section);
          }
          page.sections.push(section);
        },
        pageId,
      );
    }
    pages.push(page);
  }

  const qa = await runQaAgent(pages);
  await step(runId, "QA review", "qa-agent", async () => {
    if (!qa.ok) {
      // Non-blocking for draft sites; keep failed sections visible.
    }
  });

  const article = await runArticleWriter(brief);
  const site: SiteDocument = {
    id: createId("site"),
    version: 1,
    name: brief.brandName,
    siteType: brief.siteType,
    locale: brief.locale,
    brief,
    tokens,
    pages,
    sitemap: planned.map((p) => ({
      pageId: pages.find((pg) => pg.slug === p.slug)?.id ?? createId("page"),
      slug: p.slug,
      name: p.name,
      purpose: p.purpose,
      plannedSections: p.plannedSections,
    })),
    createdAt: now,
    updatedAt: nowIso(),
  };

  await mutateState((state) => {
    state.sites = state.sites.filter((s) => s.id !== site.id);
    state.sites.push(site);
    const project = state.projects.find((p) => p.id === projectId);
    if (project) {
      project.currentSiteId = site.id;
      project.updatedAt = nowIso();
      project.name = brief.brandName;
    }
    state.cms.unshift({
      id: createId("cms"),
      collection: "blog",
      projectId,
      title: article.title,
      slug: "draft-article",
      status: "draft",
      fields: { body: article.body },
      createdAt: nowIso(),
    });
    const run = state.runs.find((r) => r.id === runId);
    if (run) run.status = "completed";
  });

  return site;
}

export async function regenerateSection(siteId: string, pageId: string, sectionId: string) {
  const { readState } = await import("@/lib/store/db");
  const state = await readState();
  const site = state.sites.find((s) => s.id === siteId);
  if (!site) throw new Error("Site not found");
  const page = site.pages.find((p) => p.id === pageId);
  if (!page) throw new Error("Page not found");
  const section = page.sections.find((s) => s.id === sectionId);
  if (!section) throw new Error("Section not found");
  const rebuilt = await runBlockBuilder(site.brief, site.tokens, page, section.type);
  rebuilt.id = sectionId;
  rebuilt.motion = await runMotionDesigner(site.brief, rebuilt);
  await mutateState((s) => {
    const current = s.sites.find((x) => x.id === siteId);
    const pg = current?.pages.find((p) => p.id === pageId);
    if (!pg) return;
    pg.sections = pg.sections.map((sec) => (sec.id === sectionId ? rebuilt : sec));
    if (current) current.updatedAt = nowIso();
  });
  return rebuilt;
}
