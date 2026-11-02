import { readState } from "@/lib/store/db";
import { SiteRenderer } from "@/lib/blocks/SiteRenderer";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function PreviewPage({ params }: { params: Promise<{ siteId: string; slug: string }> }) {
  const { siteId, slug } = await params;
  const state = await readState();
  const site = state.sites.find((s) => s.id === siteId);
  const page = site?.pages.find((p) => p.slug === slug);
  if (!site || !page) notFound();
  return (
    <div className="min-h-dvh bg-black">
      <SiteRenderer site={site} page={page} />
    </div>
  );
}
