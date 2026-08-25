import Link from "next/link";
import { getAdminProducts } from "@/lib/admin/queries";
import { Button, buttonVariants } from "@/components/ui/button";
import { formatPrice } from "@/lib/products/format";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const { products, total, limit } = await getAdminProducts(page);
  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl">Products</h1>
          <p className="text-sm text-muted-foreground">{total} total</p>
        </div>
        <Link
          href="/admin/products/new"
          className={cn(buttonVariants(), "inline-flex gap-1")}
        >
          <Plus className="w-4 h-4" />
          Add product
        </Link>
      </div>

      <div className="rounded-lg border border-border bg-background overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Flags</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-border">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/products/${p.id}`}
                    className="font-medium hover:text-primary"
                  >
                    {p.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">{p.slug}</p>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {(p.categories as { name: string } | null)?.name ?? "—"}
                </td>
                <td className="px-4 py-3">{formatPrice(p.price)}</td>
                <td className="px-4 py-3">{p.stock}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {p.is_new && "New "}
                  {p.is_bestseller && "Bestseller "}
                  {p.sold_out && "Sold out"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex gap-2 justify-center">
          {page > 1 && (
            <Link
              href={`/admin/products?page=${page - 1}`}
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Previous
            </Link>
          )}
          <span className="text-sm text-muted-foreground self-center">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`/admin/products?page=${page + 1}`}
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
