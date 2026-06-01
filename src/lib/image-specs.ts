/**
 * Centralized image specifications for all upload slots.
 * Update here, applies everywhere.
 */

export interface ImageSpec {
  label: string;
  recommended: {
    width: number;
    height: number;
  };
  aspectRatio: string;
  maxSizeMB: number;
  acceptedFormats: string[];
  description: string;
  tips: string[];
  required: boolean;
}

export const IMAGE_SPECS = {
  logo: {
    label: 'Brand Logo',
    recommended: { width: 200, height: 60 },
    aspectRatio: '10:3 (horizontal)',
    maxSizeMB: 1,
    acceptedFormats: ['png', 'webp'],
    description: 'Main logo shown in header and footer',
    tips: [
      'Use PNG with transparent background (SVG not accepted by uploader)',
      'Horizontal orientation works best',
      'Keep file size small for fast loading',
    ],
    required: true,
  },

  favicon: {
    label: 'Favicon (Browser Tab Icon)',
    recommended: { width: 512, height: 512 },
    aspectRatio: '1:1 (square)',
    maxSizeMB: 0.5,
    acceptedFormats: ['png', 'webp'],
    description: 'Small icon shown in browser tabs',
    tips: [
      'Must be perfectly square',
      'Upload PNG (512×512) — ICO/SVG are not accepted by the uploader',
      'Simple design works best — details disappear at small sizes',
      'High contrast for visibility on light AND dark browser tabs',
    ],
    required: true,
  },

  ogImage: {
    label: 'Social Share Image (Open Graph)',
    recommended: { width: 1200, height: 630 },
    aspectRatio: '1.91:1 (landscape)',
    maxSizeMB: 2,
    acceptedFormats: ['jpg', 'png', 'webp'],
    description: 'Image shown when site link shared on Facebook, WhatsApp, Twitter',
    tips: [
      'Include brand logo + tagline',
      'High quality, professional design',
      'Avoid text near edges (gets cropped on some platforms)',
      'Bright, eye-catching colors',
    ],
    required: false,
  },

  heroImage: {
    label: 'Hero Banner (Main)',
    recommended: { width: 1920, height: 1080 },
    aspectRatio: '16:9 (landscape)',
    maxSizeMB: 4,
    acceptedFormats: ['jpg', 'png', 'webp'],
    description: 'Large image at the top of homepage',
    tips: [
      'High resolution for sharp display on large screens',
      'Subject (model/product) on left or center — text overlays on right',
      'Avoid important details in corners',
      'Strong, evocative imagery — first impression!',
    ],
    required: true,
  },

  brandStoryMain: {
    label: 'Brand Story - Main Image',
    recommended: { width: 800, height: 1000 },
    aspectRatio: '4:5 (portrait)',
    maxSizeMB: 2,
    acceptedFormats: ['jpg', 'png', 'webp'],
    description: 'Large image in brand story section',
    tips: [
      'Portrait orientation — taller than wide',
      'Editorial/lifestyle style image',
      'Shows quality, premium feel of products',
    ],
    required: false,
  },

  brandStorySmall: {
    label: 'Brand Story - Detail Image',
    recommended: { width: 600, height: 600 },
    aspectRatio: '1:1 (square)',
    maxSizeMB: 2,
    acceptedFormats: ['jpg', 'png', 'webp'],
    description: 'Smaller detail images in brand story section',
    tips: [
      'Square format',
      'Close-up details — fabric texture, finishing',
      'Complements the main image',
    ],
    required: false,
  },

  categoryCard: {
    label: 'Category Card',
    recommended: { width: 800, height: 1000 },
    aspectRatio: '4:5 (portrait)',
    maxSizeMB: 2,
    acceptedFormats: ['jpg', 'png', 'webp'],
    description: 'Image for each category card',
    tips: [
      'Portrait orientation works best',
      'Representative product or styling for that category',
      'Consistent style across all categories',
    ],
    required: false,
  },

  collectionBanner: {
    label: 'Collection Banner',
    recommended: { width: 1920, height: 800 },
    aspectRatio: '12:5 (wide landscape)',
    maxSizeMB: 3,
    acceptedFormats: ['jpg', 'png', 'webp'],
    description: 'Wide banner for special collection (e.g., Eid)',
    tips: [
      'Wide format for impact',
      'Leave space on one side for text overlay',
      'Cinematic, hero-style image',
    ],
    required: false,
  },

  familyMatchingMain: {
    label: 'Family Matching - Main Image',
    recommended: { width: 900, height: 1100 },
    aspectRatio: '9:11 (portrait)',
    maxSizeMB: 3,
    acceptedFormats: ['jpg', 'png', 'webp'],
    description: 'Main family photo wearing matching outfits',
    tips: [
      'Family of 3-4 people in matching outfits',
      'Outdoor/golden hour lighting works beautifully',
      'Show togetherness and emotion',
    ],
    required: false,
  },

  familyMatchingCard: {
    label: 'Family Type Card (Men/Women/Boy/Girl)',
    recommended: { width: 600, height: 600 },
    aspectRatio: '1:1 (square)',
    maxSizeMB: 1.5,
    acceptedFormats: ['jpg', 'png', 'webp'],
    description: 'Individual type card for each family member',
    tips: [
      'Square format',
      'Single person wearing the outfit',
      'Clean background or in-context shot',
    ],
    required: false,
  },

  communityPhoto: {
    label: 'Community Photo',
    recommended: { width: 800, height: 800 },
    aspectRatio: '1:1 (square)',
    maxSizeMB: 2,
    acceptedFormats: ['jpg', 'png', 'webp'],
    description: 'Customer photos for community section',
    tips: [
      'Square format (Instagram-style)',
      'Real customers wearing/using products',
      'Authentic, lifestyle imagery',
    ],
    required: false,
  },

  ourProcessStep: {
    label: 'Process Step Image',
    recommended: { width: 600, height: 600 },
    aspectRatio: '1:1 (square)',
    maxSizeMB: 2,
    acceptedFormats: ['jpg', 'png', 'webp'],
    description: 'Optional image for a process step',
    tips: [
      'Square format works best in the step grid',
      'Clear, simple photo illustrating the step',
    ],
    required: false,
  },

  productPrimary: {
    label: 'Product Main Image',
    recommended: { width: 1200, height: 1500 },
    aspectRatio: '4:5 (portrait)',
    maxSizeMB: 3,
    acceptedFormats: ['jpg', 'png', 'webp'],
    description: 'Primary image shown on product card and detail page',
    tips: [
      'Portrait orientation — taller than wide',
      'Front view, model wearing product',
      'Clean, neutral background',
      'Good lighting — show true colors',
      'Highest quality image — this is the first thing customer sees',
    ],
    required: true,
  },

  productGallery: {
    label: 'Product Gallery Image',
    recommended: { width: 1200, height: 1500 },
    aspectRatio: '4:5 (portrait)',
    maxSizeMB: 3,
    acceptedFormats: ['jpg', 'png', 'webp'],
    description: 'Additional product images (back, side, details, lifestyle)',
    tips: [
      'Same aspect ratio as primary image',
      'Show different angles: front, back, side, detail close-ups',
      'Include lifestyle shots — wearing in real context',
      'Upload 4-6 images per product for best results',
    ],
    required: false,
  },

  productSizeChart: {
    label: 'Size Chart Image',
    recommended: { width: 1000, height: 1200 },
    aspectRatio: '5:6 (portrait)',
    maxSizeMB: 1,
    acceptedFormats: ['jpg', 'png'],
    description: 'Size chart for clothing products',
    tips: [
      'Clear text, readable on mobile',
      'Include measurements in both inches and cm',
      'Bangla and English labels',
    ],
    required: false,
  },

  reviewerAvatar: {
    label: 'Customer Avatar (Reviews)',
    recommended: { width: 200, height: 200 },
    aspectRatio: '1:1 (square)',
    maxSizeMB: 0.5,
    acceptedFormats: ['jpg', 'png', 'webp'],
    description: 'Small avatar for customer review',
    tips: [
      'Square, will be cropped to circle',
      'Center face/subject',
      'High contrast for small display',
    ],
    required: false,
  },

  trustBadge: {
    label: 'Trust Badge Icon',
    recommended: { width: 200, height: 200 },
    aspectRatio: '1:1 (square)',
    maxSizeMB: 0.3,
    acceptedFormats: ['png', 'svg'],
    description: 'Small badge icon (e.g., payment methods, certifications)',
    tips: [
      'Transparent background (PNG/SVG)',
      'Simple, recognizable design',
      'Will be displayed small (~60-80px)',
    ],
    required: false,
  },

  emptyStatePlaceholder: {
    label: 'Empty State Illustration',
    recommended: { width: 600, height: 600 },
    aspectRatio: '1:1 (square)',
    maxSizeMB: 0.5,
    acceptedFormats: ['png', 'svg'],
    description: 'Illustration shown when no data (empty cart, no orders)',
    tips: [
      'Transparent background',
      'Friendly, illustrative style',
      'Subtle, not too colorful',
    ],
    required: false,
  },
} as const satisfies Record<string, ImageSpec>;

export type ImageSpecKey = keyof typeof IMAGE_SPECS;

export function formatImageSpec(specKey: ImageSpecKey): string {
  const spec = IMAGE_SPECS[specKey];
  return `${spec.recommended.width}×${spec.recommended.height}px • ${spec.aspectRatio} • Max ${spec.maxSizeMB}MB`;
}

export function getImageSpec(specKey: ImageSpecKey): ImageSpec {
  return IMAGE_SPECS[specKey];
}

export function getAspectRatioDecimal(spec: ImageSpec): number {
  return spec.recommended.width / spec.recommended.height;
}
