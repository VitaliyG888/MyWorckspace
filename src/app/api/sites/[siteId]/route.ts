import { fail, json, readBody } from "@/lib/api";
import { nowIso } from "@/lib/schema/common";
import { mutateState, readState } from "@/lib/store/db";
import type { SiteDocument } from "@/lib/schema/site-document";

export async function GET(_: Request, ctx: { params: Promise<{ siteId: string }> }) {
  const { siteId } = await ctx.params;
  const state = await readState();
  const site = state.sites.find((s) => s.id === siteId);
  if (!site) return fail("Site not found", 404);
  return json(site);
}

export async function PATCH(req: Request, ctx: { params: Promise<{ siteId: string }> }) {
  const { siteId } = await ctx.params;
  const patch = await readBody<Partial<SiteDocument>>(req);
  const site = await mutateState((state) => {
    const current = state.sites.find((s) => s.id === siteId);
    if (!current) return null;
    if (patch.pages) current.pages = patch.pages;
    if (patch.tokens) current.tokens = { ...current.tokens, ...patch.tokens };
    if (patch.brief) current.brief = { ...current.brief, ...patch.brief };
    current.updatedAt = nowIso();
    return current;
  });
  if (!site) return fail("Site not found", 404);
  return json(site);
}
