import { fail, json, readBody } from "@/lib/api";
import { regenerateSection } from "@/lib/agents/orchestrator";

export async function POST(req: Request, ctx: { params: Promise<{ siteId: string }> }) {
  const { siteId } = await ctx.params;
  const body = await readBody<{ pageId?: string; sectionId?: string }>(req);
  if (!body.pageId || !body.sectionId) return fail("pageId and sectionId required");
  const section = await regenerateSection(siteId, body.pageId, body.sectionId);
  return json(section);
}
