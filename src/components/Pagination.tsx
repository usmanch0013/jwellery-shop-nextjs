import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PaginatedProducts } from "@/lib/products/types";

interface PaginationProps {
  basePath: string;
  pagination: Pick<PaginatedProducts, "page" | "totalPages">;
  searchParams?: Record<string, string | undefined>;
}

export default function Pagination({
  basePath,
  pagination,
  searchParams = {},
}: PaginationProps) {
  const { page, totalPages } = pagination;
  if (totalPages <= 1) return null;

  function buildUrl(p: number) {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    params.set("page", String(p));
    const qs = params.toString();
    return `${basePath}${qs ? `?${qs}` : ""}`;
  }

  return (
    <nav
      className="flex items-center justify-center gap-4 py-10"
      aria-label="Pagination"
    >
      {page > 1 ? (
        <Link
          href={buildUrl(page - 1)}
          className="flex h-10 w-10 items-center justify-center border border-border hover:bg-muted"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
      ) : (
        <span className="flex h-10 w-10 items-center justify-center border border-border opacity-40">
          <ChevronLeft className="h-4 w-4" />
        </span>
      )}
      <span className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </span>
      {page < totalPages ? (
        <Link
          href={buildUrl(page + 1)}
          className="flex h-10 w-10 items-center justify-center border border-border hover:bg-muted"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <span className="flex h-10 w-10 items-center justify-center border border-border opacity-40">
          <ChevronRight className="h-4 w-4" />
        </span>
      )}
    </nav>
  );
}
