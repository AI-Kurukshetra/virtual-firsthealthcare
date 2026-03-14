export const roles = ["admin", "provider", "patient"] as const;
export type Role = (typeof roles)[number];

export function extractRoleName(relation: unknown): string | null {
  if (!relation) return null;

  if (Array.isArray(relation)) {
    const first = relation[0];
    if (first && typeof first === "object" && "name" in first) {
      const name = (first as { name?: unknown }).name;
      return typeof name === "string" ? name : null;
    }
    return null;
  }

  if (typeof relation === "object" && "name" in relation) {
    const name = (relation as { name?: unknown }).name;
    return typeof name === "string" ? name : null;
  }

  return null;
}
