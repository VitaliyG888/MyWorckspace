"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { StatusPill } from "@/components/StatusPill";
import { Suspense } from "react";

type Lead = {
  id: string;
  formId: string;
  payload: Record<string, string>;
  destination: string;
  status: string;
  createdAt: string;
  error?: string;
};

function LeadsInner() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const params = useSearchParams();

  useEffect(() => {
    fetch("/api/leads")
      .then((r) => r.json())
      .then(setLeads)
      .catch(() => undefined);
  }, []);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-3xl font-semibold">Leads</h1>
      {params.get("ok") ? <p className="rounded-2xl bg-emerald-500/15 px-4 py-3 text-sm text-emerald-200">Form stored successfully.</p> : null}
      {leads.length === 0 ? (
        <p className="text-sm text-slate-400">No submissions yet. Submit a contact form from a generated site.</p>
      ) : (
        <div className="space-y-3">
          {leads.map((lead) => (
            <article key={lead.id} className="rounded-2xl border border-white/10 p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">{lead.formId}</div>
                <StatusPill status={lead.status} />
              </div>
              <pre className="mt-3 overflow-auto text-xs text-slate-300">{JSON.stringify(lead.payload, null, 2)}</pre>
              <p className="mt-2 text-xs text-slate-500">
                {lead.destination} · {new Date(lead.createdAt).toLocaleString()}
              </p>
              {lead.error ? <p className="text-xs text-red-300">{lead.error}</p> : null}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default function LeadsPage() {
  return (
    <Suspense fallback={<p className="text-sm text-slate-400">Loading leads…</p>}>
      <LeadsInner />
    </Suspense>
  );
}
