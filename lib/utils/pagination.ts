export type PaginationParams = {
  page: number;
  pageSize: number;
  query: string;
  from: number;
  to: number;
};

export function getPaginationParams(
  searchParams: Record<string, string | string[] | undefined>,
  pageSize = 10
): PaginationParams {
  const rawPage = Array.isArray(searchParams.page)
    ? searchParams.page[0]
    : searchParams.page;
  const rawQuery = Array.isArray(searchParams.q) ? searchParams.q[0] : searchParams.q;
  const page = Math.max(Number(rawPage ?? 1) || 1, 1);
  const query = (rawQuery ?? "").trim();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  return { page, pageSize, query, from, to };
}

export function buildSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
  updates: Record<string, string | number | null>
) {
  const params = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value === undefined) return;
    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, item));
      return;
    }
    params.set(key, value);
  });

  Object.entries(updates).forEach(([key, value]) => {
    if (value === null || value === "") {
      params.delete(key);
      return;
    }
    params.set(key, String(value));
  });

  const next = params.toString();
  return next ? `?${next}` : "";
}
