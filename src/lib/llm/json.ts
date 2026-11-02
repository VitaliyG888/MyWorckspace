export function extractJson(text: string): unknown {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1].trim() : trimmed;
  const start = candidate.search(/[\{\[]/);
  if (start < 0) throw new Error("Model did not return JSON");
  const slice = candidate.slice(start);
  try {
    return JSON.parse(slice);
  } catch {
    const endObj = slice.lastIndexOf("}");
    const endArr = slice.lastIndexOf("]");
    const end = Math.max(endObj, endArr);
    if (end > 0) return JSON.parse(slice.slice(0, end + 1));
    throw new Error("Failed to parse JSON from model output");
  }
}
