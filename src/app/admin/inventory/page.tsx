import Link from "next/link";
import Image from "next/image";
import { getLowStockProducts, LOW_STOCK_THRESHOLD } from "@/lib/admin/queries";
import { formatPrice } from "@/lib/products/format";
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

export default async function AdminInventoryPage() {
  const products = await getLowStockProducts();

  return (
    <div className="mx-auto max-w-[1400px] space-y-4">
      <AdminPageHeader
        title="Inventory"
        description={`Low stock (${LOW_STOCK_THRESHOLD} or fewer units left) and out-of-stock products · ${products.length} item${products.length === 1 ? "" : "s"}`}
        actions={
          <Link
            href="/admin/products"
            className="admin-btn-primary inline-flex items-center"
          >
            Manage products
          </Link>
        }
      />

      {products.length === 0 ? (
        <AdminEmpty
          title="Stock levels look good"
          description="No products are below the low-stock threshold."
        />
      ) : (
        <AdminTable>
          <AdminTableElement>
            <AdminThead>
              <tr>
                <AdminTh>Product</AdminTh>
                <AdminTh>SKU</AdminTh>
                <AdminTh>Price</AdminTh>
                <AdminTh>Stock</AdminTh>
                <AdminTh>Status</AdminTh>
              </tr>
            </AdminThead>
            <tbody>
              {products.map((product) => (
                <AdminTr key={product.id}>
                  <AdminTd>
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="flex items-center gap-3"
                    >
                      {product.image && (
                        <Image
                          src={product.image}
                          alt=""
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                      )}
                      <span className="font-medium text-[#008060] hover:underline">
                        {product.name}
                      </span>
                    </Link>
                  </AdminTd>
                  <AdminTd className="text-[var(--admin-text-subdued)]">
                    {product.sku ?? "—"}
                  </AdminTd>
                  <AdminTd>{formatPrice(product.price)}</AdminTd>
                  <AdminTd>
                    <span
                      className={
                        product.stock === 0 || product.sold_out
                          ? "font-semibold text-rose-600"
                          : "font-medium text-amber-700"
                      }
                    >
                      {product.sold_out ? 0 : product.stock}
                    </span>
                  </AdminTd>
                  <AdminTd>
                    {product.sold_out || product.stock === 0 ? (
                      <span className="rounded-md bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-700">
                        Out of stock
                      </span>
                    ) : (
                      <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-800">
                        Low stock
                      </span>
                    )}
                  </AdminTd>
                </AdminTr>
              ))}
            </tbody>
          </AdminTableElement>
        </AdminTable>
      )}
    </div>
  );
}
