"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { SiteRenderer } from "@/lib/blocks/SiteRenderer";
import type { PageDocument, SiteDocument } from "@/lib/schema/site-document";
import { StatusPill } from "@/components/StatusPill";
import Link from "next/link";

export default function BuilderPage() {
  const params = useParams<{ id: string }>();
  const [site, setSite] = useState<SiteDocument | null>(null);
  const [pageId, setPageId] = useState<string>();
  const [selectedId, setSelectedId] = useState<string>();
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [chat, setChat] = useState("");

  async function load() {
    const res = await fetch("/api/bootstrap");
    const data = await res.json();
    const project = data.projects.find((p: { id: string }) => p.id === params.id);
    const found = data.sites.find((s: SiteDocument) => s.id === project?.currentSiteId);
    if (!found) {
      setError("Site is not generated yet. Finish the interview first.");
      return;
    }
    setSite(found);
    setPageId(found.pages[0]?.id);
  }

  useEffect(() => {
    load().catch(() => setError("Failed to load site"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const page: PageDocument | undefined = useMemo(
    () => site?.pages.find((p) => p.id === pageId) ?? site?.pages[0],
    [site, pageId],
  );
  const selected = page?.sections.find((s) => s.id === selectedId);

  async function patchSite(next: SiteDocument) {
    setSite(next);
    await fetch(`/api/sites/${next.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pages: next.pages, tokens: next.tokens }),
    });
  }

  async function move(dir: -1 | 1) {
    if (!site || !page || !selected) return;
    const list = [...page.sections];
    const index = list.findIndex((s) => s.id === selected.id);
    const nextIndex = index + dir;
    if (nextIndex < 0 || nextIndex >= list.length) return;
    const [item] = list.splice(index, 1);
    list.splice(nextIndex, 0, item);
    const pages = site.pages.map((p) => (p.id === page.id ? { ...p, sections: list } : p));
    await patchSite({ ...site, pages });
  }

  async function removeSection() {
    if (!site || !page || !selected) return;
    if (!window.confirm("Delete this section?")) return;
    const pages = site.pages.map((p) =>
      p.id === page.id ? { ...p, sections: p.sections.filter((s) => s.id !== selected.id) } : p,
    );
    setSelectedId(undefined);
    await patchSite({ ...site, pages });
  }

  async function updateProp(key: string, value: string) {
    if (!site || !page || !selected) return;
    const pages = site.pages.map((p) =>
      p.id === page.id
        ? {
            ...p,
            sections: p.sections.map((s) =>
              s.id === selected.id ? { ...s, props: { ...s.props, [key]: value } } : s,
            ),
          }
        : p,
    );
    await patchSite({ ...site, pages });
  }

  async function regenerate() {
    if (!site || !page || !selected) return;
    setBusy(true);
    try {
      await fetch(`/api/sites/${site.id}/regenerate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageId: page.id, sectionId: selected.id }),
      });
      await load();
    } finally {
      setBusy(false);
    }
  }

  const width = device === "desktop" ? 1100 : device === "tablet" ? 768 : 390;

  if (!site || !page) {
    return <p className="text-sm text-slate-400">{error || "Loading builder…"}</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{site.name}</h1>
          <p className="text-sm text-slate-400">{page.purpose}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(["desktop", "tablet", "mobile"] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDevice(d)}
              className={`min-h-11 rounded-full px-4 text-sm capitalize ${device === d ? "bg-white/15" : "border border-white/10"}`}
            >
              {d}
            </button>
          ))}
          <Link href={`/preview/${site.id}/${page.slug}`} className="min-h-11 rounded-full border border-white/10 px-4 text-sm leading-[44px]">
            Isolated preview
          </Link>
          <a href={`/api/export/${site.id}`} className="min-h-11 rounded-full bg-[var(--color-primary)] px-4 text-sm leading-[44px]">
            Export JSON
          </a>
        </div>
      </div>
      <div className="grid gap-4 xl:grid-cols-[240px_1fr_300px]">
        <aside className="rounded-3xl border border-white/10 p-4">
          <h2 className="text-sm font-medium">Pages</h2>
          <div className="mt-3 space-y-2">
            {site.pages.map((p) => (
              <button
                key={p.id}
                onClick={() => setPageId(p.id)}
                className={`block w-full rounded-2xl px-3 py-2 text-left text-sm ${p.id === page.id ? "bg-white/10" : "hover:bg-white/5"}`}
              >
                {p.name}
              </button>
            ))}
          </div>
          <h2 className="mt-6 text-sm font-medium">Sections</h2>
          <div className="mt-3 space-y-2">
            {page.sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedId(s.id)}
                className={`flex w-full items-center justify-between rounded-2xl px-3 py-2 text-left text-sm ${s.id === selectedId ? "bg-white/10" : "hover:bg-white/5"}`}
              >
                <span>{s.type}</span>
                <StatusPill status={s.status} />
              </button>
            ))}
          </div>
        </aside>
        <div className="overflow-auto rounded-3xl border border-white/10 bg-black/30 p-4">
          <div className="mx-auto" style={{ maxWidth: width }}>
            <SiteRenderer site={site} page={page} selectedId={selectedId} onSelect={setSelectedId} previewWidth={width} />
          </div>
        </div>
        <aside className="space-y-4 rounded-3xl border border-white/10 p-4">
          <h2 className="text-sm font-medium">Inspector</h2>
          {selected ? (
            <>
              <div className="text-xs text-slate-500">
                {selected.type} · {selected.variant} · motion {selected.motion.preset}
              </div>
              {"title" in selected.props ? (
                <label className="block text-sm">
                  Title
                  <input
                    className="mt-2 min-h-11 w-full rounded-2xl border border-white/10 bg-black/20 px-3"
                    defaultValue={String(selected.props.title ?? "")}
                    onBlur={(e) => updateProp("title", e.target.value)}
                  />
                </label>
              ) : null}
              {"subtitle" in selected.props ? (
                <label className="block text-sm">
                  Subtitle
                  <textarea
                    className="mt-2 min-h-24 w-full rounded-2xl border border-white/10 bg-black/20 px-3 py-2"
                    defaultValue={String(selected.props.subtitle ?? "")}
                    onBlur={(e) => updateProp("subtitle", e.target.value)}
                  />
                </label>
              ) : null}
              <div className="flex flex-wrap gap-2">
                <button onClick={() => move(-1)} className="min-h-11 rounded-full border border-white/10 px-3 text-sm">
                  Up
                </button>
                <button onClick={() => move(1)} className="min-h-11 rounded-full border border-white/10 px-3 text-sm">
                  Down
                </button>
                <button onClick={removeSection} className="min-h-11 rounded-full border border-red-400/30 px-3 text-sm text-red-200">
                  Delete
                </button>
                <button onClick={regenerate} disabled={busy} className="min-h-11 rounded-full bg-white/10 px-3 text-sm disabled:opacity-50">
                  {busy ? "Regenerating…" : "Regenerate block"}
                </button>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (chat.toLowerCase().includes("regenerate")) regenerate();
                  setChat("");
                }}
                className="space-y-2"
              >
                <label className="block text-sm">
                  Block chat
                  <input
                    value={chat}
                    onChange={(e) => setChat(e.target.value)}
                    placeholder="regenerate this block"
                    className="mt-2 min-h-11 w-full rounded-2xl border border-white/10 bg-black/20 px-3"
                  />
                </label>
              </form>
            </>
          ) : (
            <p className="text-sm text-slate-500">Select a section to edit without regenerating the whole site.</p>
          )}
          <div className="text-xs text-slate-500">
            SEO title: {page.seo.title}
            <br />
            JSON-LD: {page.seo.jsonLdType}
          </div>
        </aside>
      </div>
    </div>
  );
}
