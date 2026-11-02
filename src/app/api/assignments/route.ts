import { fail, json, readBody } from "@/lib/api";
import { agentRoleSchema, type RoleAssignment } from "@/lib/schema/llm";
import { mutateState } from "@/lib/store/db";

export async function POST(req: Request) {
  const body = await readBody<RoleAssignment>(req);
  const role = agentRoleSchema.safeParse(body.role);
  if (!role.success) return fail("Unknown role");
  if (!body.providerId || !body.modelId) return fail("providerId and modelId required");
  const assignments = await mutateState((state) => {
    const rest = state.assignments.filter((a) => a.role !== role.data);
    rest.push({
      role: role.data,
      providerId: body.providerId,
      modelId: body.modelId,
      fallbackProviderId: body.fallbackProviderId,
      fallbackModelId: body.fallbackModelId,
    });
    state.assignments = rest;
    return state.assignments;
  });
  return json(assignments);
}
