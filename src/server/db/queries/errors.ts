import type { PostgrestError } from '@supabase/supabase-js';

export function assertNoError(
  error: PostgrestError | null,
  context: string
): void {
  if (error) {
    if (error.code === '23505') {
      // Unique violation. Could be SKU, URL slug, a duplicate variant
      // (size/color), or a duplicate image — name what actually conflicted so
      // the message isn't misleading.
      const detail = `${error.message} ${error.details ?? ''}`.toLowerCase();
      const field = detail.includes('slug')
        ? 'পণ্যের URL (slug)'
        : detail.includes('sku')
          ? 'SKU'
          : detail.includes('size')
            ? 'সাইজ/কালার ভ্যারিয়েন্ট'
            : detail.includes('url')
              ? 'ছবির URL'
              : 'একটি ফিল্ড';
      throw new Error(
        `এই ${field} আগে থেকে অন্য পণ্যে আছে। মান পরিবর্তন করে আবার সেভ করুন।`
      );
    }
    throw new Error(`${context}: ${error.message} (${error.code})`);
  }
}

/** Sanitize user search input for PostgREST `.or()` ilike filters. */
export function toIlikePattern(search: string): string {
  const trimmed = search.trim().replace(/,/g, ' ');
  if (!trimmed) return '';
  return `%${trimmed}%`;
}
