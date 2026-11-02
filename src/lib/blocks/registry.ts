import type { ComponentType } from "react";
import { BLOCK_SCHEMAS } from "./schemas";
import {
  AnnouncementBarRender,
  BlogGridRender,
  CaseStudiesRender,
  ContactFormRender,
  CtaRender,
  FaqRender,
  FeaturesRender,
  FooterRender,
  GalleryRender,
  HeroRender,
  LogoCloudRender,
  MapRender,
  NavbarRender,
  NewsletterFormRender,
  PricingRender,
  ServicesRender,
  SplitContentRender,
  StatsRender,
  TeamRender,
  TestimonialsRender,
  VideoEmbedRender,
} from "./renders";
import type { BlockDefinition } from "./types";

function def(
  type: string,
  label: string,
  Render: ComponentType<{ props: Record<string, unknown>; variant?: string }>,
  variants: string[] = ["default"],
): BlockDefinition {
  return {
    type,
    label,
    variants,
    schema: BLOCK_SCHEMAS[type],
    defaults: () => ({}),
    Render,
    minContentScore: 1,
  };
}

export const BLOCK_REGISTRY: Record<string, BlockDefinition> = {
  announcementBar: def("announcementBar", "Announcement bar", AnnouncementBarRender),
  navbar: def("navbar", "Navbar", NavbarRender, ["default", "minimal"]),
  hero: def("hero", "Hero", HeroRender, ["default", "split", "centered"]),
  logoCloud: def("logoCloud", "Logo cloud", LogoCloudRender),
  stats: def("stats", "Stats", StatsRender),
  features: def("features", "Features", FeaturesRender, ["default", "grid"]),
  benefits: def("benefits", "Benefits", FeaturesRender),
  splitContent: def("splitContent", "Split content", SplitContentRender),
  services: def("services", "Services", ServicesRender),
  productGrid: def("productGrid", "Product grid", ServicesRender),
  pricing: def("pricing", "Pricing", PricingRender),
  testimonials: def("testimonials", "Testimonials", TestimonialsRender),
  caseStudies: def("caseStudies", "Case studies", CaseStudiesRender),
  team: def("team", "Team", TeamRender),
  gallery: def("gallery", "Gallery", GalleryRender),
  videoEmbed: def("videoEmbed", "Video", VideoEmbedRender),
  faq: def("faq", "FAQ", FaqRender),
  cta: def("cta", "CTA", CtaRender),
  contactForm: def("contactForm", "Contact form", ContactFormRender),
  newsletterForm: def("newsletterForm", "Newsletter", NewsletterFormRender),
  blogGrid: def("blogGrid", "Blog grid", BlogGridRender),
  map: def("map", "Map / location", MapRender),
  footer: def("footer", "Footer", FooterRender),
};

export const BLOCK_TYPES = Object.keys(BLOCK_REGISTRY);

export function getBlock(type: string): BlockDefinition {
  const block = BLOCK_REGISTRY[type];
  if (!block) throw new Error(`Unknown block type: ${type}`);
  return block;
}
