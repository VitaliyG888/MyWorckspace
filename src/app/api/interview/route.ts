import { fail, json, readBody } from "@/lib/api";
import { createId } from "@/lib/ids";
import { nowIso } from "@/lib/schema/common";
import { mergeBrief, runInterviewer } from "@/lib/agents/specialists";
import { mutateState, readState } from "@/lib/store/db";

export async function POST(req: Request) {
  const body = await readBody<{ projectId?: string; message?: string; start?: boolean }>(req);
  if (!body.projectId) return fail("projectId required");
  const state = await readState();
  const session = state.interviews.find((i) => i.projectId === body.projectId);
  if (!session) return fail("Interview not found", 404);
  const history = session.messages.map((m) => ({ role: m.role === "system" ? "assistant" : m.role, content: m.content })) as {
    role: "user" | "assistant";
    content: string;
  }[];
  if (body.message) history.push({ role: "user", content: body.message });
  const result = await runInterviewer(history, session.briefDraft);
  const updated = await mutateState((s) => {
    const current = s.interviews.find((i) => i.projectId === body.projectId);
    if (!current) return null;
    if (body.message) {
      current.messages.push({
        id: createId("msg"),
        role: "user",
        content: body.message,
        createdAt: nowIso(),
      });
    }
    current.messages.push({
      id: createId("msg"),
      role: "assistant",
      content: result.assistantMessage,
      createdAt: nowIso(),
    });
    current.briefDraft = mergeBrief(current.briefDraft, result.briefPatch);
    current.complete = result.done;
    current.updatedAt = nowIso();
    return current;
  });
  return json({ session: updated, result });
}
