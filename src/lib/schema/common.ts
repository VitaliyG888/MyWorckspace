import { z } from "zod";

export const idSchema = z.string().min(8).max(64);
export const isoDateSchema = z.string().datetime({ offset: true }).or(z.string().min(10));

export const localeSchema = z.enum(["ru", "en"]);
export type Locale = z.infer<typeof localeSchema>;

export const siteTypeSchema = z.enum([
  "landing",
  "corporate",
  "service",
  "portfolio",
  "blog",
  "catalog",
  "event",
  "saas",
  "local-business",
]);
export type SiteType = z.infer<typeof siteTypeSchema>;

export const generationStatusSchema = z.enum([
  "planned",
  "queued",
  "generating",
  "validating",
  "ready",
  "failed",
  "skipped",
]);
export type GenerationStatus = z.infer<typeof generationStatusSchema>;

export const claimSourceSchema = z.enum(["user", "assumption", "unknown"]);
export type ClaimSource = z.infer<typeof claimSourceSchema>;

export function nowIso(): string {
  return new Date().toISOString();
}
