import Link from "next/link";
import { getAdminProducts } from "@/lib/admin/queries";
import { buttonVariants } from "@/components/ui/button";
import { formatPrice } from "@/lib/products/format";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AdminEmpty,
  AdminPageHeader,
  AdminTable,
  AdminTableElement,
  AdminTd,
  AdminTh,
  AdminThead,
  AdminTr,
} from "@/components/admin/AdminShell";

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
      <AdminPageHeader
        title="Products"
        description={`${total} products in your catalog`}
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

      {products.length === 0 ? (
        <AdminEmpty
          title="No products yet"
          description="Add your first product to start selling."
        />
      ) : (
        <AdminTable>
          <AdminTableElement>
            <AdminThead>
              <tr>
                <AdminTh>Product</AdminTh>
                <AdminTh>Category</AdminTh>
                <AdminTh>Price</AdminTh>
                <AdminTh>Stock</AdminTh>
                <AdminTh>Status</AdminTh>
                <AdminTh>Flags</AdminTh>
              </tr>
            </AdminThead>
            <tbody>
              {products.map((p) => (
                <AdminTr key={p.id}>
                  <AdminTd>
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="font-medium hover:text-primary"
                    >
                      {p.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">{p.slug}</p>
                  </AdminTd>
                  <AdminTd className="text-muted-foreground">
                    {(p.categories as { name: string } | null)?.name ?? "—"}
                  </AdminTd>
                  <AdminTd className="font-medium">{formatPrice(p.price)}</AdminTd>
                  <AdminTd>
                    <span
                      className={
                        p.stock <= 5
                          ? "text-amber-700 font-medium"
                          : "text-foreground"
                      }
                    >
                      {p.stock}
                    </span>
                  </AdminTd>
                  <AdminTd>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-medium capitalize",
                        (p as { status?: string }).status === "draft"
                          ? "bg-slate-100 text-slate-700"
                          : "bg-emerald-100 text-emerald-800"
                      )}
                    >
                      {(p as { status?: string }).status ?? "published"}
                    </span>
                  </AdminTd>
                  <AdminTd>
                    <div className="flex flex-wrap gap-1">
                      {p.is_new && (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-800">
                          New
                        </span>
                      )}
                      {p.is_bestseller && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800">
                          Bestseller
                        </span>
                      )}
                      {p.sold_out && (
                        <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-medium text-rose-800">
                          Sold out
                        </span>
                      )}
                    </div>
                  </AdminTd>
                </AdminTr>
              ))}
            </tbody>
          </AdminTableElement>
        </AdminTable>
      )}

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
