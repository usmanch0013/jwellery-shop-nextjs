import Link from "next/link";
import {
  getAdminCategories,
  getAdminProducts,
  type AdminProductFilters,
} from "@/lib/admin/queries";
import AdminProductsClient from "@/components/admin/AdminProductsClient";
import { buttonVariants } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminEmpty, AdminPageHeader } from "@/components/admin/AdminShell";

function buildPageUrl(page: number, filters: AdminProductFilters) {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  if (filters.q) params.set("q", filters.q);
  if (filters.categoryId) params.set("category", filters.categoryId);
  if (filters.status && filters.status !== "all") params.set("status", filters.status);
  if (filters.flag && filters.flag !== "all") params.set("flag", filters.flag);
  if (filters.sort && filters.sort !== "manual") params.set("sort", filters.sort);
  const qs = params.toString();
  return qs ? `/admin/products?${qs}` : "/admin/products";
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    q?: string;
    category?: string;
    status?: string;
    flag?: string;
    sort?: string;
  }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);

  const filters: AdminProductFilters = {
    page,
    limit: 50,
    q: sp.q,
    categoryId: sp.category,
    status:
      sp.status === "draft" || sp.status === "published" ? sp.status : "all",
    flag:
      sp.flag === "new" ||
      sp.flag === "bestseller" ||
      sp.flag === "sale" ||
      sp.flag === "sold_out" ||
      sp.flag === "low_stock"
        ? sp.flag
        : "all",
    sort:
      sp.sort === "newest" ||
      sp.sort === "price_asc" ||
      sp.sort === "price_desc" ||
      sp.sort === "name"
        ? sp.sort
        : "manual",
  };

  const [{ products, total, limit }, categories] = await Promise.all([
    getAdminProducts(filters),
    getAdminCategories(),
  ]);
  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Products"
        description={`${total} product${total === 1 ? "" : "s"} in your catalog`}
        actions={
          <Link
            href="/admin/products/new"
            className={cn(buttonVariants(), "inline-flex gap-1.5")}
          >
            <Plus className="w-4 h-4" />
            Add product
          </Link>
        }
      />

      {products.length === 0 && !sp.q && !sp.category && filters.status === "all" && filters.flag === "all" ? (
        <AdminEmpty
          title="No products yet"
          description="Add your first product to start selling."
        />
      ) : (
        <AdminProductsClient
          products={products}
          categories={categories}
          total={total}
          page={page}
          totalPages={totalPages}
          filters={filters}
        />
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {page > 1 && (
            <Link
              href={buildPageUrl(page - 1, filters)}
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Previous
            </Link>
          )}
          <span className="self-center text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={buildPageUrl(page + 1, filters)}
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
