import { Suspense } from "react";
import { getAdminOrders } from "@/lib/admin/queries";
import AdminOrdersClient from "@/components/admin/AdminOrdersClient";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const params = await searchParams;
  const orders = await getAdminOrders(500, {
    status: params.status,
    search: params.q,
  });

  return (
    <Suspense fallback={<div className="p-6 text-sm text-[var(--admin-text-subdued)]">Loading orders…</div>}>
      <AdminOrdersClient orders={orders} />
    </Suspense>
  );
}
