import { fail, json, readBody } from "@/lib/api";
import { startGeneration } from "@/lib/agents/orchestrator";
import { readState } from "@/lib/store/db";

export const maxDuration = 120;

export async function POST(req: Request) {
  const body = await readBody<{ projectId?: string }>(req);
  if (!body.projectId) return fail("projectId required");
  const state = await readState();
  const interview = state.interviews.find((i) => i.projectId === body.projectId);
  if (!interview) return fail("Interview not found", 404);
  const site = await startGeneration(body.projectId, interview.briefDraft);
  return json({ site });
}
