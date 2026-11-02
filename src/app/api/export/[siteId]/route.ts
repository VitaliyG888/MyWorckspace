import { fail } from "@/lib/api";
import { readState } from "@/lib/store/db";
import { buildExportHtml } from "@/lib/export/html";

export async function GET(_: Request, ctx: { params: Promise<{ siteId: string }> }) {
  const { siteId } = await ctx.params;
  const state = await readState();
  const site = state.sites.find((s) => s.id === siteId);
  if (!site) return fail("Site not found", 404);
  const html = buildExportHtml(site);
  return new Response(JSON.stringify({ siteDocument: site, html }, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${site.name.replace(/\s+/g, "-").toLowerCase()}-export.json"`,
    },
  });
}
