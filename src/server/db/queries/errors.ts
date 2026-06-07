import type { PostgrestError } from '@supabase/supabase-js';

export function assertNoError(
  error: PostgrestError | null,
  context: string
): void {
  if (error) {
    if (error.code === '23505') {
      throw new Error(
        'এই SKU আগে থেকে আছে। অন্য SKU ব্যবহার করুন অথবা পুনরায় সেভ করুন।'
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
