import Link from "next/link";
import { buildSearchParams } from "@/lib/utils/pagination";

export function Pagination({
  basePath,
  page,
  pageSize,
  total,
  searchParams
}: {
  basePath: string;
  page: number;
  pageSize: number;
  total: number;
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const totalPages = Math.max(Math.ceil(total / pageSize), 1);
  if (totalPages <= 1) return null;

  const prevPage = Math.max(page - 1, 1);
  const nextPage = Math.min(page + 1, totalPages);

  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/70">
      <span>
        Page {page} of {totalPages}
      </span>
      <div className="flex items-center gap-2">
        <Link
          href={`${basePath}${buildSearchParams(searchParams, { page: prevPage })}`}
          className={`rounded-full border px-3 py-1 transition ${
            page === 1
              ? "pointer-events-none border-white/10 text-white/30"
              : "border-white/20 text-white hover:bg-white/10"
          }`}
        >
          Prev
        </Link>
        <Link
          href={`${basePath}${buildSearchParams(searchParams, { page: nextPage })}`}
          className={`rounded-full border px-3 py-1 transition ${
            page === totalPages
              ? "pointer-events-none border-white/10 text-white/30"
              : "border-white/20 text-white hover:bg-white/10"
          }`}
        >
          Next
        </Link>
      </div>
    </div>
  );
}
