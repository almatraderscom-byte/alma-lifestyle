import type { PostgrestError } from '@supabase/supabase-js';

export function assertNoError(
  error: PostgrestError | null,
  context: string
): void {
  if (error) {
    throw new Error(`${context}: ${error.message} (${error.code})`);
  }
}

/** Sanitize user search input for PostgREST `.or()` ilike filters. */
export function toIlikePattern(search: string): string {
  const trimmed = search.trim().replace(/,/g, ' ');
  if (!trimmed) return '';
  return `%${trimmed}%`;
}
