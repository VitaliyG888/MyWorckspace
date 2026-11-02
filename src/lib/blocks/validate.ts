import { BLOCK_SCHEMAS } from "./schemas";

const EMPTYISH = /^(lorem|ipsum|todo|tbd|placeholder|xxx|\.{3}|n\/a)?$/i;

export type ValidationResult = {
  ok: boolean;
  errors: string[];
};

export function validateBlock(type: string, props: unknown): ValidationResult {
  const schema = BLOCK_SCHEMAS[type];
  if (!schema) return { ok: false, errors: [`Unknown block type ${type}`] };
  const parsed = schema.safeParse(props);
  if (!parsed.success) {
    return {
      ok: false,
      errors: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`),
    };
  }
  const extra = contentChecks(type, parsed.data as Record<string, unknown>);
  return { ok: extra.length === 0, errors: extra };
}

function contentChecks(type: string, data: Record<string, unknown>): string[] {
  const errors: string[] = [];
  walk(data, (value, path) => {
    if (typeof value === "string") {
      if (value.trim().length < 2) errors.push(`${path} is too short`);
      if (EMPTYISH.test(value.trim())) errors.push(`${path} looks like a placeholder`);
    }
    if (Array.isArray(value) && value.length === 0) {
      errors.push(`${path} must not be empty`);
    }
  });
  if ((type === "hero" || type === "cta" || type === "navbar") && !hasCta(data)) {
    errors.push("Interactive block requires a CTA with href");
  }
  if (type === "contactForm" && !Array.isArray(data.fields)) {
    errors.push("Contact form needs fields");
  }
  return errors;
}

function hasCta(data: Record<string, unknown>): boolean {
  const candidates = [data.cta, data.primaryCta];
  return candidates.some((c) => {
    if (!c || typeof c !== "object") return false;
    const href = (c as { href?: string }).href;
    return typeof href === "string" && href.length > 0;
  });
}

function walk(value: unknown, visit: (v: unknown, path: string) => void, path = "props") {
  visit(value, path);
  if (value && typeof value === "object") {
    if (Array.isArray(value)) {
      value.forEach((item, i) => walk(item, visit, `${path}[${i}]`));
    } else {
      Object.entries(value as Record<string, unknown>).forEach(([k, v]) => walk(v, visit, `${path}.${k}`));
    }
  }
}
