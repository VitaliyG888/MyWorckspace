import { fail, json } from "@/lib/api";
import { createId } from "@/lib/ids";
import { nowIso } from "@/lib/schema/common";
import { mutateState, readState } from "@/lib/store/db";

async function persistLead(formData: FormData) {
  const payload: Record<string, string> = {};
  formData.forEach((value, key) => {
    if (typeof value === "string") payload[key] = value;
  });
  const formId = payload.formId || "contact";
  const state = await readState();
  const webhook = state.integrations.find((i) => i.kind === "webhook" && i.status === "connected" && i.config.url);
  let status: "stored" | "forwarded" | "failed" = "stored";
  let error: string | undefined;
  if (webhook?.config.url) {
    try {
      const res = await fetch(webhook.config.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      status = res.ok ? "forwarded" : "failed";
      if (!res.ok) error = `Webhook ${res.status}`;
    } catch (err) {
      status = "failed";
      error = err instanceof Error ? err.message : "Webhook failed";
    }
  }
  return mutateState((s) => {
    const lead = {
      id: createId("lead"),
      projectId: payload.projectId || s.projects[0]?.id || "unknown",
      formId,
      payload,
      destination: webhook?.config.url ? "webhook" : "studio-leads",
      status,
      createdAt: nowIso(),
      error,
    };
    s.leads.unshift(lead);
    return lead;
  });
}

export async function GET() {
  const state = await readState();
  return json(state.leads);
}

export async function POST(req: Request) {
  const contentType = req.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const body = (await req.json()) as Record<string, string>;
    const form = new FormData();
    Object.entries(body).forEach(([k, v]) => form.set(k, v));
    const lead = await persistLead(form);
    return json(lead, 201);
  }
  const form = await req.formData();
  const lead = await persistLead(form);
  if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
    return new Response(null, { status: 303, headers: { Location: "/leads?ok=1" } });
  }
  if (!lead) return fail("Could not store lead");
  return json(lead, 201);
}
