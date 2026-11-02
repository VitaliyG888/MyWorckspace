"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Plus, ArrowRight } from "lucide-react";
import { SITE_TYPES } from "@/lib/constants";

type Project = {
  id: string;
  name: string;
  siteType: string;
  updatedAt: string;
  currentSiteId?: string;
};

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState("");
  const [siteType, setSiteType] = useState("corporate");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch("/api/bootstrap");
    const data = await res.json();
    setProjects(data.projects ?? []);
  }

  useEffect(() => {
    load().catch(() => setError("Failed to load workspace"));
  }, []);

  async function createProject(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name || "New site", siteType }),
      });
      const project = await res.json();
      if (!res.ok) throw new Error(project.error || "Could not create project");
      window.location.href = `/projects/${project.id}/interview`;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create project");
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold">Projects</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">
          Interview first, then specialized agents produce sitemap, brand, copy, blocks, motion and SEO. Empty ready-sections are rejected.
        </p>
      </div>

      <form onSubmit={createProject} className="grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 md:grid-cols-[1fr_220px_auto]">
        <label className="block text-sm">
          <span className="mb-2 block text-slate-300">Project name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Aurora Labs"
            className="min-h-11 w-full rounded-2xl border border-white/10 bg-black/20 px-4"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-2 block text-slate-300">Site type</span>
          <select
            value={siteType}
            onChange={(e) => setSiteType(e.target.value)}
            className="min-h-11 w-full rounded-2xl border border-white/10 bg-black/20 px-4"
          >
            {SITE_TYPES.map((type) => (
              <option key={type.id} value={type.id}>
                {type.label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          disabled={busy}
          className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-[var(--color-primary)] px-5 text-sm font-medium disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          {busy ? "Creating…" : "Create project"}
        </button>
      </form>
      {error ? <p className="text-sm text-red-300">{error}</p> : null}

      {projects.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/15 p-10 text-sm text-slate-400">
          No projects yet. Create the first site and connect your own LLM if you do not want the offline demo agent.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {projects.map((project) => (
            <article key={project.id} className="rounded-3xl border border-white/10 p-5">
              <div className="text-xs uppercase tracking-wide text-slate-500">{project.siteType}</div>
              <h2 className="mt-2 text-xl font-medium">{project.name}</h2>
              <p className="mt-1 text-xs text-slate-500">Updated {new Date(project.updatedAt).toLocaleString()}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link href={`/projects/${project.id}/interview`} className="inline-flex min-h-11 items-center rounded-full border border-white/10 px-4 text-sm">
                  Interview
                </Link>
                {project.currentSiteId ? (
                  <Link
                    href={`/projects/${project.id}/builder`}
                    className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white/10 px-4 text-sm"
                  >
                    Open builder <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
