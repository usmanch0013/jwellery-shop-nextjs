import Link from "next/link";
import { getAdminCoupons } from "@/lib/admin/queries";
import {
  saveCouponAction,
  updateCouponAction,
  deleteCouponFormAction,
} from "@/actions/admin/coupons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPrice } from "@/lib/products/format";
import {
  AdminCard,
  AdminPageHeader,
  AdminTable,
  AdminTableElement,
  AdminTd,
  AdminTh,
  AdminThead,
  AdminTr,
} from "@/components/admin/AdminShell";

const selectClass =
  "w-full h-10 rounded-xl border border-border/70 bg-background px-3 text-sm";

export default async function AdminCouponsPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const coupons = await getAdminCoupons();
  const { edit } = await searchParams;
  const editing = edit ? coupons.find((c) => c.id === edit) : undefined;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Coupons"
        description="Create and manage discount codes"
      />

      <AdminCard
        title={editing ? `Edit coupon — ${editing.code}` : "Create coupon"}
        description={
          editing
            ? "Update this promotional code"
            : "Add a new promotional code"
        }
      >
        <form
          key={editing?.id ?? "create"}
          action={editing ? updateCouponAction : saveCouponAction}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {editing && <input type="hidden" name="id" value={editing.id} />}
          <div className="space-y-2">
            <Label>Code</Label>
            <Input
              name="code"
              placeholder="WELCOME10"
              required
              defaultValue={editing?.code ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label>Type</Label>
            <select
              name="type"
              className={selectClass}
              defaultValue={editing?.type ?? "percent"}
            >
              <option value="percent">Percent</option>
              <option value="fixed">Fixed amount</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Value</Label>
            <Input
              name="value"
              type="number"
              required
              defaultValue={editing?.value ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label>Min order (Rs.)</Label>
            <Input
              name="minOrder"
              type="number"
              defaultValue={editing?.min_order ?? 0}
            />
          </div>
          <div className="space-y-2">
            <Label>Usage limit</Label>
            <Input
              name="usageLimit"
              type="number"
              placeholder="Unlimited"
              defaultValue={editing?.usage_limit ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label>Expires at</Label>
            <Input
              name="expiresAt"
              type="datetime-local"
              defaultValue={editing?.expires_at?.slice(0, 16) ?? ""}
            />
          </div>
          <label className="flex items-center gap-2 text-sm self-end pb-2">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={editing ? editing.is_active : true}
            />
            Active
          </label>
          <div className="flex items-end gap-2">
            <Button type="submit" className="self-end">
              {editing ? "Save changes" : "Create coupon"}
            </Button>
            {editing && (
              <Link
                href="/admin/coupons"
                className="inline-flex h-10 items-center rounded-xl border border-border/70 px-4 text-sm hover:bg-muted/40"
              >
                Cancel
              </Link>
            )}
          </div>
        </form>
      </AdminCard>

      <AdminTable>
        <AdminTableElement>
          <AdminThead>
            <tr>
              <AdminTh>Code</AdminTh>
              <AdminTh>Discount</AdminTh>
              <AdminTh>Usage</AdminTh>
              <AdminTh>Status</AdminTh>
              <AdminTh></AdminTh>
            </tr>
          </AdminThead>
          <tbody>
            {coupons.map((c) => (
              <AdminTr key={c.id}>
                <AdminTd className="font-semibold">{c.code}</AdminTd>
                <AdminTd>
                  {c.type === "percent"
                    ? `${c.value}%`
                    : formatPrice(c.value)}
                  <span className="text-muted-foreground text-xs block">
                    Min {formatPrice(c.min_order)}
                  </span>
                </AdminTd>
                <AdminTd>
                  {c.usage_count}
                  {c.usage_limit ? ` / ${c.usage_limit}` : ""}
                </AdminTd>
                <AdminTd>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                      c.is_active
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {c.is_active ? "Active" : "Inactive"}
                  </span>
                </AdminTd>
                <AdminTd>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/coupons?edit=${c.id}`}
                      className="inline-flex h-9 items-center rounded-xl border border-border/70 px-3 text-sm hover:bg-muted/40"
                    >
                      Edit
                    </Link>
                    <form action={deleteCouponFormAction}>
                      <input type="hidden" name="id" value={c.id} />
                      <Button type="submit" variant="outline" size="sm">
                        Delete
                      </Button>
                    </form>
                  </div>
                </AdminTd>
              </AdminTr>
            ))}
          </tbody>
        </AdminTableElement>
      </AdminTable>
    </div>
  );
}
