/** Bengali Unicode block (U+0980–U+09FF). */
export function containsBengali(text: string): boolean {
  return /[\u0980-\u09FF]/.test(text);
}

/** Pick display/body font class based on script in the string. */
export function getTextFontClass(text: string, type: 'display' | 'body' = 'body'): string {
  if (containsBengali(text)) {
    return type === 'display' ? 'font-bn-display' : 'font-bn-body';
  }
  return type === 'display' ? 'font-brand' : 'font-bn-body';
}

/**
 * Split text for per-unit reveal animations without breaking Bengali conjuncts.
 * Uses grapheme segmentation for Bengali; code units for Latin-only strings.
 */
export function splitTextForAnimation(text: string): string[] {
  if (!text) return [];

  if (containsBengali(text)) {
    if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
      const segmenter = new Intl.Segmenter('bn', { granularity: 'grapheme' });
      return Array.from(segmenter.segment(text), (seg) => seg.segment);
    }
    return [text];
  }

  return Array.from(text);
}
