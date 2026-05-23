/** True when id is a Postgres/Supabase UUID (not localStorage-style prod_xxx). */
export function isDatabaseUuid(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    id
  );
}

export function isLegacyLocalId(id: string): boolean {
  return /^(prod|cat|col|ord|var|img|rev|trust)_/i.test(id);
}

export function newDatabaseId(): string {
  return crypto.randomUUID();
}
