// ─── Shared job slug utilities ────────────────────────────────────────────────
// Kept in a separate file so both the server page.tsx and the "use client"
// PublicJobDetail.tsx can import without crossing the server/client boundary.

export const UUID_RE =
  /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;

/** Build a human-readable URL slug that embeds the full UUID at the end. */
export function toJobSlug(title: string, id: string): string {
  const titlePart = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return `${titlePart}-${id}`;
}

/** Extract the UUID from the end of a slug. Returns null if not found. */
export function extractUuid(slug: string): string | null {
  return slug.match(UUID_RE)?.[1] ?? null;
}
