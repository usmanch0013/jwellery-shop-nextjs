import {
  FREE_SHIPPING_THRESHOLD,
  PAYMENT_METHOD_LABELS,
  STANDARD_SHIPPING_FEE,
} from "@/lib/constants/commerce";
import { STORE_INFO } from "@/lib/orders/invoice";
import { formatPrice } from "@/lib/products/format";
import {
  AdminCard,
  AdminInfoRow,
  AdminPageHeader,
} from "@/components/admin/AdminShell";

export default function AdminSettingsPage() {
  const adminEmails = (process.env.ADMIN_EMAILS ?? "Not configured")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);

  return (
    <div className="mx-auto max-w-[800px] space-y-5">
      <AdminPageHeader
        title="Settings"
        description="Store configuration and preferences"
      />

      <AdminCard title="Store details">
        <AdminInfoRow label="Store name" value={STORE_INFO.name} />
        <AdminInfoRow label="Email" value={STORE_INFO.email} />
        <AdminInfoRow label="Phone" value={STORE_INFO.phone} />
        <AdminInfoRow label="Address" value={STORE_INFO.address} />
        <AdminInfoRow label="Website" value={STORE_INFO.website} />
      </AdminCard>

      <AdminCard title="Shipping">
        <AdminInfoRow
          label="Standard shipping fee"
          value={formatPrice(STANDARD_SHIPPING_FEE)}
        />
        <AdminInfoRow
          label="Free shipping above"
          value={formatPrice(FREE_SHIPPING_THRESHOLD)}
        />
      </AdminCard>

      <AdminCard title="Payment methods">
        {Object.entries(PAYMENT_METHOD_LABELS).map(([key, label]) => (
          <AdminInfoRow key={key} label={label} value="Enabled" />
        ))}
      </AdminCard>

      <AdminCard title="Admin access">
        {adminEmails.map((email) => (
          <AdminInfoRow key={email} label="Admin email" value={email} />
        ))}
        <p className="mt-3 text-[12px] text-[var(--admin-text-subdued)]">
          Add more admins via <code>ADMIN_EMAILS</code> environment variable in
          Netlify, comma-separated.
        </p>
      </AdminCard>

      <AdminCard title="Database migrations">
        <p className="text-[13px] text-[var(--admin-text-subdued)]">
          Run pending SQL migrations in Supabase for invoices, order tracking,
          and timeline features. File:{" "}
          <code className="text-xs">008_order_commerce_advanced.sql</code>
        </p>
      </AdminCard>
    </div>
  );
}
