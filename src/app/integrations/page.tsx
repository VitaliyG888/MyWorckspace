"use client";

import { useEffect, useState } from "react";
import { StatusPill } from "@/components/StatusPill";

type Integration = {
  id: string;
  kind: string;
  name: string;
  status: string;
  config: Record<string, string>;
};

const CATALOG = [
  { kind: "crm", name: "HubSpot", status: "requires-setup" },
  { kind: "crm", name: "Bitrix24", status: "requires-setup" },
  { kind: "analytics", name: "Google Analytics 4", status: "requires-setup" },
  { kind: "pixel", name: "Meta Pixel", status: "requires-setup" },
];

export default function IntegrationsPage() {
  const [items, setItems] = useState<Integration[]>([]);
  const [url, setUrl] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    const res = await fetch("/api/bootstrap");
    const data = await res.json();
    setItems(data.integrations);
  }

  useEffect(() => {
    load().catch(() => setMessage("Failed to load integrations"));
  }, []);

  async function addWebhook(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/integrations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "webhook", name: "Custom webhook", url }),
    });
    const data = await res.json();
    if (!res.ok) setMessage(data.error);
    else {
      setUrl("");
      setMessage("Webhook connected. Leads will be forwarded after they are stored.");
      load();
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-3xl font-semibold">Integrations</h1>
      <p className="text-sm text-slate-400">
        Only real connections are marked connected. Catalog items without credentials stay <code>requires-setup</code>.
      </p>
      <form onSubmit={addWebhook} className="flex flex-col gap-3 rounded-3xl border border-white/10 p-5 md:flex-row">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/webhook"
          required
          className="min-h-11 flex-1 rounded-2xl border border-white/10 bg-black/20 px-4"
        />
        <button className="min-h-11 rounded-2xl bg-[var(--color-primary)] px-5 text-sm">Connect webhook</button>
      </form>
      {message ? <p className="text-sm text-cyan-200">{message}</p> : null}
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between rounded-2xl border border-white/10 px-4 py-3">
            <div>
              <div className="text-sm font-medium">{item.name}</div>
              <div className="text-xs text-slate-500">{item.kind}</div>
            </div>
            <StatusPill status={item.status} />
          </div>
        ))}
        {CATALOG.map((item) => (
          <div key={item.name} className="flex items-center justify-between rounded-2xl border border-dashed border-white/10 px-4 py-3 opacity-80">
            <div>
              <div className="text-sm font-medium">{item.name}</div>
              <div className="text-xs text-slate-500">{item.kind} · adapter exists, credentials not connected</div>
            </div>
            <StatusPill status={item.status} />
          </div>
        ))}
      </div>
    </div>
  );
}
