import { json } from "@/lib/api";
import { testProvider } from "@/lib/llm/gateway";

export async function POST(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const result = await testProvider(id);
  return json(result, result.ok ? 200 : 400);
}
