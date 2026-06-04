/** Premium Alma-branded SVG gradient placeholders (data URIs) — no external stock photos. */

export type PlaceholderTone = 'warm' | 'cool' | 'neutral' | 'sand' | 'process' | 'family';

const PALETTES: Record<PlaceholderTone, { from: string; to: string }> = {
  warm: { from: '#F5EBDD', to: '#C89B3C' },
  cool: { from: '#F5EBDD', to: '#5C6B7A' },
  neutral: { from: '#F5EBDD', to: '#E8E4DF' },
  sand: { from: '#F5EBDD', to: '#D4C4A8' },
  process: { from: '#F5EBDD', to: '#C97D5D' },
  family: { from: '#F5EBDD', to: '#8B7355' },
};

export function createAlmaPlaceholderSvg(
  tone: PlaceholderTone,
  width = 800,
  height = 600
): string {
  const { from, to } = PALETTES[tone];
  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
    `<defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">`,
    `<stop offset="0%" stop-color="${from}"/>`,
    `<stop offset="100%" stop-color="${to}"/>`,
    `</linearGradient></defs>`,
    `<rect width="100%" height="100%" fill="url(#g)"/>`,
    `<circle cx="${width - 36}" cy="${height - 36}" r="10" fill="#C89B3C" opacity="0.5"/>`,
    `</svg>`,
  ].join('');
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
