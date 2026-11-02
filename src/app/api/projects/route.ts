import { fail, json, readBody } from "@/lib/api";
import { createId } from "@/lib/ids";
import { nowIso } from "@/lib/schema/common";
import { siteTypeSchema } from "@/lib/schema/common";
import { mutateState } from "@/lib/store/db";

export async function POST(req: Request) {
  const body = await readBody<{ name?: string; siteType?: string }>(req);
  const parsedType = siteTypeSchema.safeParse(body.siteType ?? "corporate");
  if (!parsedType.success) return fail("Unknown site type");
  const project = await mutateState((state) => {
    const item = {
      id: createId("prj"),
      workspaceId: state.workspace.id,
      name: body.name?.trim() || "New site",
      siteType: parsedType.data,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    state.projects.unshift(item);
    state.interviews.push({
      id: createId("int"),
      projectId: item.id,
      messages: [],
      briefDraft: { siteType: parsedType.data, locale: "ru", brandPreferences: { colors: [], fonts: [], visualRefs: [], hasLogo: false } },
      complete: false,
      updatedAt: nowIso(),
    });
    return item;
  });
  return json(project, 201);
}
