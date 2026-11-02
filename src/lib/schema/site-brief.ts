import { z } from "zod";
import { localeSchema, siteTypeSchema } from "./common";

export const factSchema = z.object({
  id: z.string(),
  text: z.string().min(1),
  field: z.string(),
  confirmed: z.boolean(),
});

export const assumptionSchema = z.object({
  id: z.string(),
  text: z.string().min(1),
  reason: z.string().min(1),
  confidence: z.enum(["low", "medium", "high"]),
  field: z.string(),
});

export const openQuestionSchema = z.object({
  id: z.string(),
  question: z.string().min(1),
  field: z.string(),
});

export const audienceSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string().min(1),
  geography: z.string().optional(),
});

export const offerSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.string().optional(),
  source: z.enum(["user", "draft"]),
});

export const goalSchema = z.object({
  id: z.string(),
  text: z.string().min(1),
  kpi: z.string().optional(),
  primary: z.boolean(),
});

export const siteBriefSchema = z.object({
  version: z.literal(1),
  siteType: siteTypeSchema,
  locale: localeSchema,
  brandName: z.string().min(1),
  tagline: z.string().optional(),
  description: z.string().min(1),
  industry: z.string().min(1),
  businessModel: z.string().optional(),
  primaryCta: z.string().min(1),
  secondaryCtas: z.array(z.string()).default([]),
  confirmedFacts: z.array(factSchema).default([]),
  assumptions: z.array(assumptionSchema).default([]),
  openQuestions: z.array(openQuestionSchema).default([]),
  constraints: z.array(z.string()).default([]),
  goals: z.array(goalSchema).default([]),
  audiences: z.array(audienceSchema).default([]),
  offers: z.array(offerSchema).default([]),
  pagesRequested: z.array(z.string()).default([]),
  brandPreferences: z.object({
    tone: z.string().optional(),
    colors: z.array(z.string()).default([]),
    fonts: z.array(z.string()).default([]),
    visualRefs: z.array(z.string()).default([]),
    hasLogo: z.boolean().default(false),
  }),
  integrationsRequested: z.array(z.string()).default([]),
  seoContext: z.object({
    topics: z.array(z.string()).default([]),
    geography: z.string().optional(),
    intent: z.string().optional(),
  }),
  language: z.string().default("ru"),
  domainIntent: z.string().optional(),
  legalNotes: z.array(z.string()).default([]),
  approvedByUser: z.boolean().default(false),
});

export type SiteBrief = z.infer<typeof siteBriefSchema>;
export type Fact = z.infer<typeof factSchema>;
export type Assumption = z.infer<typeof assumptionSchema>;
