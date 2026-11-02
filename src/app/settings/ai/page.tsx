"use client";

import { useEffect, useState } from "react";
import { PROTOCOLS, ROLE_LABELS } from "@/lib/constants";
import { StatusPill } from "@/components/StatusPill";
import { BUILTIN_PROVIDER_PRESETS } from "@/lib/llm/presets";

type Provider = {
  id: string;
  displayName: string;
  protocol: string;
  baseUrl: string;
  status: string;
  hasSecret: boolean;
  kind: string;
  lastError?: string;
  models: { id: string; displayName: string }[];
};

type Assignment = { role: string; providerId: string; modelId: string };

export default function AiSettingsPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [usage, setUsage] = useState<{ id: string; role: string; modelId: string; inputTokens: number; outputTokens: number }[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    displayName: "Custom OpenAI-compatible",
    protocol: "openai-chat-completions",
    baseUrl: "https://api.openai.com/v1",
    apiKey: "",
    models: "gpt-4o-mini",
    kind: "llm",
    allowLocal: false,
  });

  async function load() {
    const res = await fetch("/api/bootstrap");
    const data = await res.json();
    setProviders(data.providers);
    setAssignments(data.assignments);
    setUsage(data.usage ?? []);
  }

  useEffect(() => {
    load().catch(() => setMessage("Failed to load providers"));
  }, []);

  async function addProvider(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch("/api/providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save provider");
      setForm({ ...form, apiKey: "" });
      await load();
      setMessage("Provider saved. API key is encrypted on the server and never returned.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not save provider");
    } finally {
      setBusy(false);
    }
  }

  async function test(id: string) {
    setMessage("Testing connection…");
    const res = await fetch(`/api/providers/${id}/test`, { method: "POST" });
    const data = await res.json();
    setMessage(data.message || (data.ok ? "OK" : "Failed"));
    await load();
  }

  async function assign(role: string, providerId: string) {
    const provider = providers.find((p) => p.id === providerId);
    const modelId = provider?.models[0]?.id;
    if (!modelId) return;
    await fetch("/api/assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, providerId, modelId }),
    });
    await load();
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold">AI connections</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-400">
          Custom LLM, image and article providers are first-class. Each agent role is routed independently by the orchestrator.
        </p>
      </div>

      <form onSubmit={addProvider} className="grid gap-4 rounded-3xl border border-white/10 p-6 md:grid-cols-2">
        <label className="text-sm">
          Display name
          <input className="mt-2 min-h-11 w-full rounded-2xl border border-white/10 bg-black/20 px-4" value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} />
        </label>
        <label className="text-sm">
          Protocol
          <select className="mt-2 min-h-11 w-full rounded-2xl border border-white/10 bg-black/20 px-4" value={form.protocol} onChange={(e) => setForm({ ...form, protocol: e.target.value })}>
            {PROTOCOLS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm md:col-span-2">
          API base URL
          <input className="mt-2 min-h-11 w-full rounded-2xl border border-white/10 bg-black/20 px-4" value={form.baseUrl} onChange={(e) => setForm({ ...form, baseUrl: e.target.value })} />
        </label>
        <label className="text-sm">
          API key (stored encrypted, never shown again)
          <input type="password" className="mt-2 min-h-11 w-full rounded-2xl border border-white/10 bg-black/20 px-4" value={form.apiKey} onChange={(e) => setForm({ ...form, apiKey: e.target.value })} />
        </label>
        <label className="text-sm">
          Model IDs (comma-separated)
          <input className="mt-2 min-h-11 w-full rounded-2xl border border-white/10 bg-black/20 px-4" value={form.models} onChange={(e) => setForm({ ...form, models: e.target.value })} />
        </label>
        <label className="text-sm">
          Kind
          <select className="mt-2 min-h-11 w-full rounded-2xl border border-white/10 bg-black/20 px-4" value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })}>
            <option value="llm">LLM</option>
            <option value="image">Image</option>
            <option value="content">Content</option>
          </select>
        </label>
        <label className="flex items-center gap-3 text-sm">
          <input type="checkbox" checked={form.allowLocal} onChange={(e) => setForm({ ...form, allowLocal: e.target.checked })} />
          Allow local/private URL (Ollama / LM Studio)
        </label>
        <div className="md:col-span-2">
          <button disabled={busy} className="min-h-11 rounded-2xl bg-[var(--color-primary)] px-5 text-sm disabled:opacity-50">
            {busy ? "Saving…" : "Add provider"}
          </button>
        </div>
      </form>

      <div className="flex flex-wrap gap-2 text-xs">
        {BUILTIN_PROVIDER_PRESETS.map((preset) => (
          <button
            key={preset.displayName}
            type="button"
            className="rounded-full border border-white/10 px-3 py-2"
            onClick={() =>
              setForm({
                ...form,
                displayName: preset.displayName,
                protocol: preset.protocol,
                baseUrl: preset.baseUrl,
                kind: preset.kind,
                models: preset.models.join(","),
                allowLocal: preset.baseUrl.includes("127.0.0.1"),
              })
            }
          >
            {preset.displayName}
          </button>
        ))}
      </div>

      {message ? <p className="text-sm text-cyan-200">{message}</p> : null}

      <section className="grid gap-4 md:grid-cols-2">
        {providers.map((provider) => (
          <article key={provider.id} className="rounded-3xl border border-white/10 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-medium">{provider.displayName}</h2>
                <p className="text-xs text-slate-500">{provider.protocol}</p>
                <p className="mt-1 break-all text-xs text-slate-400">{provider.baseUrl}</p>
              </div>
              <StatusPill status={provider.status} />
            </div>
            <p className="mt-3 text-xs text-slate-500">Secret: {provider.hasSecret ? "saved (masked)" : "none"}</p>
            {provider.lastError ? <p className="mt-2 text-xs text-red-300">{provider.lastError}</p> : null}
            <button onClick={() => test(provider.id)} className="mt-4 min-h-11 rounded-full border border-white/10 px-4 text-sm">
              Test connection
            </button>
          </article>
        ))}
      </section>

      <section className="rounded-3xl border border-white/10 p-6">
        <h2 className="text-xl font-medium">Agent role routing</h2>
        <div className="mt-4 grid gap-3">
          {Object.keys(ROLE_LABELS).map((role) => {
            const current = assignments.find((a) => a.role === role);
            return (
              <div key={role} className="grid gap-3 rounded-2xl bg-white/5 p-3 md:grid-cols-[200px_1fr_1fr] md:items-center">
                <div className="text-sm">{ROLE_LABELS[role]}</div>
                <select
                  className="min-h-11 rounded-2xl border border-white/10 bg-black/20 px-3 text-sm"
                  value={current?.providerId ?? ""}
                  onChange={(e) => assign(role, e.target.value)}
                >
                  {providers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.displayName}
                    </option>
                  ))}
                </select>
                <div className="text-xs text-slate-500">{current?.modelId}</div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 p-6">
        <h2 className="text-xl font-medium">Usage</h2>
        {usage.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No calls yet.</p>
        ) : (
          <table className="mt-4 w-full text-left text-sm">
            <thead className="text-slate-500">
              <tr>
                <th className="pb-2">Role</th>
                <th className="pb-2">Model</th>
                <th className="pb-2">In</th>
                <th className="pb-2">Out</th>
              </tr>
            </thead>
            <tbody>
              {usage.slice(0, 12).map((row) => (
                <tr key={row.id} className="border-t border-white/5">
                  <td className="py-2">{row.role}</td>
                  <td>{row.modelId}</td>
                  <td>{row.inputTokens}</td>
                  <td>{row.outputTokens}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
