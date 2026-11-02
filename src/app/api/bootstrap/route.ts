import { json } from "@/lib/api";
import { readState } from "@/lib/store/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const state = await readState();
  return json({
    workspace: state.workspace,
    projects: state.projects,
    providers: state.providers.map((p) => ({ ...p })),
    assignments: state.assignments,
    integrations: state.integrations,
    leads: state.leads,
    cms: state.cms,
    usage: state.usage.slice(0, 50),
    runs: state.runs.slice(0, 20),
    sites: state.sites,
    interviews: state.interviews.map((i) => ({
      id: i.id,
      projectId: i.projectId,
      messages: i.messages,
      briefDraft: i.briefDraft,
      complete: i.complete,
    })),
  });
}
