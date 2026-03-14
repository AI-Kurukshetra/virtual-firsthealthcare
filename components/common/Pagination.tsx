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
    <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-card/60 px-4 py-3 text-xs text-foreground/70">
      <span>
        Page {page} of {totalPages}
      </span>
      <div className="flex items-center gap-2">
        <Link
          href={`${basePath}${buildSearchParams(searchParams, { page: prevPage })}`}
          className={`rounded-full border px-3 py-1 transition ${
            page === 1
              ? "pointer-events-none border-border/60 text-foreground/30"
              : "border-border/80 text-foreground hover:bg-card/70"
          }`}
        >
          Prev
        </Link>
        <Link
          href={`${basePath}${buildSearchParams(searchParams, { page: nextPage })}`}
          className={`rounded-full border px-3 py-1 transition ${
            page === totalPages
              ? "pointer-events-none border-border/60 text-foreground/30"
              : "border-border/80 text-foreground hover:bg-card/70"
          }`}
        >
          Next
        </Link>
      </div>
    </div>
  );
}
