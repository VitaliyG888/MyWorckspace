import { z } from "zod";
import { generationStatusSchema, localeSchema, siteTypeSchema } from "./common";
import { motionConfigSchema } from "./motion";
import { siteBriefSchema } from "./site-brief";

export const designTokensSchema = z.object({
  primary: z.string().default("#7C3AED"),
  secondary: z.string().default("#6366F1"),
  accent: z.string().default("#0891B2"),
  background: z.string().default("#0F172A"),
  surface: z.string().default("#111827"),
  foreground: z.string().default("#F8FAFC"),
  muted: z.string().default("#94A3B8"),
  headingFont: z.string().default("Inter"),
  bodyFont: z.string().default("Inter"),
  radius: z.enum(["sm", "md", "lg", "xl"]).default("lg"),
  density: z.enum(["compact", "regular", "spacious"]).default("regular"),
});
export type DesignTokens = z.infer<typeof designTokensSchema>;

export const seoMetaSchema = z.object({
  title: z.string().min(8).max(70),
  description: z.string().min(40).max(180),
  canonical: z.string().optional(),
  ogTitle: z.string().optional(),
  ogDescription: z.string().optional(),
  noindex: z.boolean().default(false),
  jsonLdType: z.enum(["WebSite", "Organization", "LocalBusiness", "FAQPage", "Article"]).optional(),
});
export type SeoMeta = z.infer<typeof seoMetaSchema>;

export const generationMetaSchema = z.object({
  agentRole: z.string(),
  providerId: z.string().optional(),
  modelId: z.string().optional(),
  promptVersion: z.string().optional(),
  attempts: z.number().int().min(0).default(0),
  usage: z
    .object({
      inputTokens: z.number().default(0),
      outputTokens: z.number().default(0),
      durationMs: z.number().default(0),
    })
    .optional(),
  error: z.string().optional(),
});

export const sectionDocumentSchema = z.object({
  id: z.string(),
  type: z.string(),
  variant: z.string().default("default"),
  props: z.record(z.unknown()),
  responsive: z
    .object({
      hideOnMobile: z.boolean().default(false),
      hideOnTablet: z.boolean().default(false),
      hideOnDesktop: z.boolean().default(false),
    })
    .default({}),
  motion: motionConfigSchema.default({}),
  status: generationStatusSchema.default("planned"),
  generationMetadata: generationMetaSchema.optional(),
});
export type SectionDocument = z.infer<typeof sectionDocumentSchema>;

export const pageDocumentSchema = z.object({
  id: z.string(),
  slug: z.string().min(1),
  name: z.string().min(1),
  purpose: z.string().min(1),
  seo: seoMetaSchema,
  sections: z.array(sectionDocumentSchema).default([]),
});
export type PageDocument = z.infer<typeof pageDocumentSchema>;

export const sitemapNodeSchema = z.object({
  pageId: z.string(),
  slug: z.string(),
  name: z.string(),
  purpose: z.string(),
  plannedSections: z.array(z.string()).default([]),
});

export const siteDocumentSchema = z.object({
  id: z.string(),
  version: z.literal(1),
  name: z.string().min(1),
  siteType: siteTypeSchema,
  locale: localeSchema,
  brief: siteBriefSchema,
  tokens: designTokensSchema,
  pages: z.array(pageDocumentSchema).min(1),
  sitemap: z.array(sitemapNodeSchema).default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type SiteDocument = z.infer<typeof siteDocumentSchema>;

export const DEFAULT_TOKENS: DesignTokens = designTokensSchema.parse({});
