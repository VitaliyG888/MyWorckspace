import { fail, json, readBody } from "@/lib/api";
import { createId } from "@/lib/ids";
import { nowIso } from "@/lib/schema/common";
import { mutateState } from "@/lib/store/db";

export async function POST(req: Request) {
  const body = await readBody<{
    kind?: "webhook" | "crm" | "analytics" | "pixel" | "email";
    name?: string;
    url?: string;
    status?: "connected" | "disconnected" | "requires-setup";
  }>(req);
  if (!body.kind || !body.name) return fail("kind and name required");
  const item = await mutateState((state) => {
    const connection = {
      id: createId("int"),
      kind: body.kind!,
      name: body.name!,
      status: body.url ? "connected" as const : body.status ?? "requires-setup",
      config: (body.url ? { url: body.url } : {}) as Record<string, string>,
      lastCheckedAt: nowIso(),
    };
    state.integrations.push(connection);
    return connection;
  });
  return json(item, 201);
}
