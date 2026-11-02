import type { ComponentType } from "react";
import type { ZodTypeAny } from "zod";

export type BlockDefinition = {
  type: string;
  label: string;
  variants: string[];
  schema: ZodTypeAny;
  defaults: (brand: string) => Record<string, unknown>;
  Render: ComponentType<{ props: Record<string, unknown>; variant?: string }>;
  minContentScore: number;
};

export function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

export function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

export function asCta(value: unknown): { label: string; href: string } {
  const obj = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  return {
    label: asString(obj.label, "Подробнее"),
    href: asString(obj.href, "/contact"),
  };
}
