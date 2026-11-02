import { z } from "zod";

export const motionPresetIdSchema = z.enum([
  "none",
  "fade-in",
  "slide-up",
  "slide-left",
  "stagger-children",
  "hover-lift",
  "card-reveal",
  "image-reveal",
  "counter",
  "parallax-subtle",
  "nav-sticky",
  "tilt-restrained",
]);

export type MotionPresetId = z.infer<typeof motionPresetIdSchema>;

export const motionConfigSchema = z.object({
  preset: motionPresetIdSchema.default("none"),
  delayMs: z.number().min(0).max(2000).default(0),
  durationMs: z.number().min(80).max(800).default(280),
  staggerMs: z.number().min(0).max(120).default(40),
  intensity: z.enum(["subtle", "standard", "expressive"]).default("subtle"),
  respectReducedMotion: z.boolean().default(true),
  disabled: z.boolean().default(false),
});

export type MotionConfig = z.infer<typeof motionConfigSchema>;

export const MOTION_PRESETS: Record<
  MotionPresetId,
  { label: string; description: string; cssClass: string }
> = {
  none: { label: "None", description: "No animation", cssClass: "" },
  "fade-in": { label: "Fade in", description: "Opacity entrance", cssClass: "motion-fade-in" },
  "slide-up": { label: "Slide up", description: "Translate Y entrance", cssClass: "motion-slide-up" },
  "slide-left": { label: "Slide left", description: "Translate X entrance", cssClass: "motion-slide-left" },
  "stagger-children": { label: "Stagger", description: "Children reveal in sequence", cssClass: "motion-stagger" },
  "hover-lift": { label: "Hover lift", description: "Subtle lift on hover", cssClass: "motion-hover-lift" },
  "card-reveal": { label: "Card reveal", description: "Card fade and lift", cssClass: "motion-card-reveal" },
  "image-reveal": { label: "Image reveal", description: "Image clip reveal", cssClass: "motion-image-reveal" },
  counter: { label: "Counter", description: "Number count-up for confirmed stats", cssClass: "motion-counter" },
  "parallax-subtle": { label: "Parallax", description: "Very subtle background shift", cssClass: "motion-parallax" },
  "nav-sticky": { label: "Sticky nav", description: "Header compact on scroll", cssClass: "motion-nav-sticky" },
  "tilt-restrained": { label: "Tilt", description: "Restrained 3D tilt on hover", cssClass: "motion-tilt" },
};
