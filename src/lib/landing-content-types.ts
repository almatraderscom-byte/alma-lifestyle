import { z } from 'zod';

export const heroSchema = z.object({
  eyebrow: z.string(),
  heading: z.string(),
  subheading: z.string(),
  primaryCta: z.string(),
  whatsappCta: z.string(),
  whatsappNumber: z.string(),
  whatsappPrefill: z.string(),
  trustItems: z.array(z.string()),
  heroImage: z.string().optional(),
});

export const narrativeSchema = z.object({
  eyebrow: z.string(),
  scenes: z.array(z.string()).min(2).max(6),
});

export const problemSchema = z.object({
  heading: z.string(),
  intro: z.string(),
  points: z.array(z.string()),
  outro: z.string(),
});

export const solutionSchema = z.object({
  eyebrow: z.string(),
  heading: z.string(),
  body: z.string(),
  tags: z.array(z.string()),
  image: z.string().optional(),
});

export const featureItemSchema = z.object({
  title: z.string(),
  desc: z.string(),
});

export const featuresSchema = z.object({
  heading: z.string(),
  subheading: z.string(),
  items: z.array(featureItemSchema),
});

export const specMeasurementSchema = z.object({
  value: z.string(),
  unit: z.string(),
  label: z.string(),
});

export const specsSchema = z.object({
  length: specMeasurementSchema,
  width: specMeasurementSchema,
  height: specMeasurementSchema,
});

export const storySchema = z.object({
  eyebrow: z.string(),
  heading: z.string(),
  body: z.string(),
  attribution: z.string(),
});

export const donationSchema = z.object({
  eyebrow: z.string(),
  heading: z.string(),
  body: z.string(),
  cta: z.string(),
});

export const pricingSchema = z.object({
  leadLine: z.string(),
  originalLabel: z.string(),
  originalPrice: z.number(),
  offerLabel: z.string(),
  offerPrice: z.number(),
  savingsLabel: z.string(),
  urgency: z.string(),
  cta: z.string(),
  toastAdded: z.string(),
  reassurance: z.string(),
});

export const reviewsSchema = z.object({
  heading: z.string(),
  subheading: z.string(),
  verifiedLabel: z.string(),
  images: z.array(z.string()),
});

export const trustFooterSchema = z.object({
  whatsappEyebrow: z.string(),
  whatsappTitle: z.string(),
  whatsappSubtitle: z.string(),
  whatsappCta: z.string(),
  whatsappNumber: z.string(),
  closing: z.string(),
});

export const overlaySchema = z.object({
  brand: z.string(),
  tagline: z.string(),
});

export const murdaMoshariContentSchema = z.object({
  hero: heroSchema,
  narrative: narrativeSchema,
  problem: problemSchema,
  solution: solutionSchema,
  features: featuresSchema,
  specs: specsSchema,
  story: storySchema,
  donation: donationSchema,
  pricing: pricingSchema,
  reviews: reviewsSchema,
  trustFooter: trustFooterSchema,
  overlay: overlaySchema,
});

export type MurdaMoshariContent = z.infer<typeof murdaMoshariContentSchema>;

export const MURDA_MOSHARI_LAYOUT_KEY = 'murda-moshari-landing';
export const MURDA_MOSHARI_SLUG = 'smart-murda-moshari';
