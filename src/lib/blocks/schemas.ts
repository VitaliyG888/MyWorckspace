import { z } from "zod";

export const ctaSchema = z.object({
  label: z.string().min(2),
  href: z.string().min(1),
});

export const linkSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
});

export const navbarSchema = z.object({
  brand: z.string().min(1),
  links: z.array(linkSchema).min(1),
  cta: ctaSchema,
});

export const heroSchema = z.object({
  eyebrow: z.string().min(1),
  title: z.string().min(8),
  subtitle: z.string().min(20),
  primaryCta: ctaSchema,
  secondaryCta: ctaSchema.optional(),
  imageAlt: z.string().min(8),
  imageSrc: z.string().optional(),
});

export const logoCloudSchema = z.object({
  title: z.string().min(4),
  items: z.array(z.object({ label: z.string().min(1) })).min(2),
});

export const statsSchema = z.object({
  title: z.string().min(4),
  items: z
    .array(
      z.object({
        label: z.string().min(2),
        value: z.string().min(1),
        source: z.enum(["user", "assumption", "draft"]),
      }),
    )
    .min(2),
});

export const featuresSchema = z.object({
  title: z.string().min(4),
  items: z.array(z.object({ title: z.string().min(2), body: z.string().min(12) })).min(3),
});

export const benefitsSchema = featuresSchema;

export const splitContentSchema = z.object({
  title: z.string().min(4),
  body: z.string().min(24),
  cta: ctaSchema,
  imageAlt: z.string().min(8),
  imageSrc: z.string().optional(),
});

export const servicesSchema = z.object({
  title: z.string().min(4),
  items: z
    .array(z.object({ title: z.string().min(2), body: z.string().min(12), href: z.string().min(1) }))
    .min(3),
});

export const productGridSchema = servicesSchema;

export const pricingSchema = z.object({
  title: z.string().min(4),
  note: z.string().min(8),
  plans: z
    .array(
      z.object({
        name: z.string().min(2),
        price: z.string().min(1),
        features: z.array(z.string().min(2)).min(2),
        highlighted: z.boolean().optional(),
        cta: ctaSchema,
      }),
    )
    .min(2),
});

export const testimonialsSchema = z.object({
  title: z.string().min(4),
  disclaimer: z.string().min(8),
  items: z
    .array(
      z.object({
        quote: z.string().min(12),
        author: z.string().min(2),
        role: z.string().min(2),
        draft: z.boolean(),
      }),
    )
    .min(1),
});

export const caseStudiesSchema = z.object({
  title: z.string().min(4),
  items: z
    .array(
      z.object({
        title: z.string().min(2),
        summary: z.string().min(12),
        href: z.string().min(1),
        draft: z.boolean(),
      }),
    )
    .min(1),
});

export const teamSchema = z.object({
  title: z.string().min(4),
  items: z.array(z.object({ name: z.string().min(2), role: z.string().min(2), draft: z.boolean() })).min(1),
});

export const gallerySchema = z.object({
  title: z.string().min(4),
  items: z.array(z.object({ alt: z.string().min(4), src: z.string().optional() })).min(3),
});

export const videoEmbedSchema = z.object({
  title: z.string().min(2),
  caption: z.string().min(8),
  url: z.string(),
  requiresSource: z.boolean(),
});

export const faqSchema = z.object({
  title: z.string().min(4),
  items: z.array(z.object({ q: z.string().min(6), a: z.string().min(12) })).min(2),
});

export const ctaBlockSchema = z.object({
  title: z.string().min(6),
  body: z.string().min(16),
  primaryCta: ctaSchema,
});

export const contactFormSchema = z.object({
  title: z.string().min(4),
  body: z.string().min(12),
  submitLabel: z.string().min(2),
  fields: z.array(z.enum(["name", "email", "phone", "message"])).min(2),
});

export const newsletterFormSchema = z.object({
  title: z.string().min(4),
  body: z.string().min(12),
  submitLabel: z.string().min(2),
});

export const blogGridSchema = z.object({
  title: z.string().min(4),
  items: z
    .array(z.object({ title: z.string().min(4), excerpt: z.string().min(12), href: z.string().min(1) }))
    .min(1),
});

export const mapSchema = z.object({
  title: z.string().min(2),
  address: z.string().min(2),
  note: z.string().min(8),
});

export const announcementBarSchema = z.object({
  text: z.string().min(8),
  href: z.string().min(1),
});

export const footerSchema = z.object({
  brand: z.string().min(1),
  links: z.array(linkSchema).min(1),
  legal: z.string().min(8),
});

export const BLOCK_SCHEMAS: Record<string, z.ZodTypeAny> = {
  navbar: navbarSchema,
  hero: heroSchema,
  logoCloud: logoCloudSchema,
  stats: statsSchema,
  features: featuresSchema,
  benefits: benefitsSchema,
  splitContent: splitContentSchema,
  services: servicesSchema,
  productGrid: productGridSchema,
  pricing: pricingSchema,
  testimonials: testimonialsSchema,
  caseStudies: caseStudiesSchema,
  team: teamSchema,
  gallery: gallerySchema,
  videoEmbed: videoEmbedSchema,
  faq: faqSchema,
  cta: ctaBlockSchema,
  contactForm: contactFormSchema,
  newsletterForm: newsletterFormSchema,
  blogGrid: blogGridSchema,
  map: mapSchema,
  announcementBar: announcementBarSchema,
  footer: footerSchema,
};
