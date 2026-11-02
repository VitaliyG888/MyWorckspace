"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Message = { id: string; role: string; content: string };

export default function InterviewPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [brief, setBrief] = useState<Record<string, unknown>>({});
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState("");
  const [generating, setGenerating] = useState(false);

  async function send(message?: string, start = false) {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: params.id, message, start }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Interview failed");
      setMessages(data.session.messages);
      setBrief(data.session.briefDraft ?? {});
      setComplete(Boolean(data.session.complete));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Interview failed");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/bootstrap");
      const data = await res.json();
      const session = (data.interviews ?? []).find((i: { projectId: string }) => i.projectId === params.id);
      if (cancelled) return;
      if (session?.messages?.length) {
        setMessages(session.messages);
        setBrief(session.briefDraft ?? {});
        setComplete(Boolean(session.complete));
        return;
      }
      await send(undefined, true);
    })().catch(() => undefined);
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  async function generate() {
    setGenerating(true);
    setError("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: params.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      router.push(`/projects/${params.id}/builder`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
      setGenerating(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-2xl font-semibold">Adaptive interview</h1>
        <p className="mt-2 text-sm text-slate-400">
          The interviewer agent asks only questions that change architecture, content or conversion. Use «не знаю», «предложи сам» or «готово».
        </p>
        <div className="mt-6 max-h-[520px] space-y-3 overflow-y-auto">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`rounded-2xl px-4 py-3 text-sm leading-6 ${m.role === "user" ? "ml-10 bg-[var(--color-primary)]/30" : "mr-10 bg-black/20"}`}
            >
              {m.content}
            </div>
          ))}
        </div>
        <form
          className="mt-4 flex gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!input.trim()) return;
            const value = input;
            setInput("");
            send(value);
          }}
        >
          <label className="sr-only" htmlFor="answer">
            Answer
          </label>
          <input
            id="answer"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ответ или «готово»"
            className="min-h-11 flex-1 rounded-2xl border border-white/10 bg-black/20 px-4"
          />
          <button disabled={busy} className="min-h-11 rounded-2xl bg-[var(--color-primary)] px-5 text-sm disabled:opacity-50">
            {busy ? "…" : "Send"}
          </button>
        </form>
      </section>
      <aside className="space-y-4">
        <div className="rounded-3xl border border-white/10 p-5 text-sm">
          <h2 className="font-medium">SiteBrief draft</h2>
          <dl className="mt-4 space-y-2 text-slate-300">
            <div>Brand: {String(brief.brandName ?? "—")}</div>
            <div>Industry: {String(brief.industry ?? "—")}</div>
            <div>CTA: {String(brief.primaryCta ?? "—")}</div>
            <div>Facts: {Array.isArray(brief.confirmedFacts) ? brief.confirmedFacts.length : 0}</div>
            <div>Assumptions: {Array.isArray(brief.assumptions) ? brief.assumptions.length : 0}</div>
          </dl>
        </div>
        <button
          onClick={generate}
          disabled={generating}
          className="flex min-h-11 w-full items-center justify-center rounded-2xl bg-cyan-600 px-4 text-sm font-medium disabled:opacity-50"
        >
          {generating ? "Agents are building the site…" : complete ? "Approve brief and generate" : "Generate from current draft"}
        </button>
        <p className="text-xs text-slate-500">
          Generation is incremental: architect, visual director, copy, block builder, motion, SEO and QA run as separate roles.
        </p>
        {error ? <p className="text-sm text-red-300">{error}</p> : null}
      </aside>
    </div>
  );
}
