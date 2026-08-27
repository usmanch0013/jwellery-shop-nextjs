import { getAdminCoupons } from "@/lib/admin/queries";
import { saveCouponAction, deleteCouponFormAction } from "@/actions/admin/coupons";
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

export default async function AdminCouponsPage() {
  const coupons = await getAdminCoupons();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Coupons"
        description="Create and manage discount codes"
      />

      <AdminCard title="Create coupon" description="Add a new promotional code">
        <form
          action={saveCouponAction}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          <div className="space-y-2">
            <Label>Code</Label>
            <Input name="code" placeholder="WELCOME10" required />
          </div>
          <div className="space-y-2">
            <Label>Type</Label>
            <select name="type" className={selectClass} defaultValue="percent">
              <option value="percent">Percent</option>
              <option value="fixed">Fixed amount</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Value</Label>
            <Input name="value" type="number" required />
          </div>
          <div className="space-y-2">
            <Label>Min order (Rs.)</Label>
            <Input name="minOrder" type="number" defaultValue={0} />
          </div>
          <div className="space-y-2">
            <Label>Usage limit</Label>
            <Input name="usageLimit" type="number" placeholder="Unlimited" />
          </div>
          <div className="space-y-2">
            <Label>Expires at</Label>
            <Input name="expiresAt" type="datetime-local" />
          </div>
          <label className="flex items-center gap-2 text-sm self-end pb-2">
            <input type="checkbox" name="isActive" defaultChecked />
            Active
          </label>
          <Button type="submit" className="self-end">
            Create coupon
          </Button>
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
                  <form action={deleteCouponFormAction}>
                    <input type="hidden" name="id" value={c.id} />
                    <Button type="submit" variant="outline" size="sm">
                      Delete
                    </Button>
                  </form>
                </AdminTd>
              </AdminTr>
            ))}
          </tbody>
        </AdminTableElement>
      </AdminTable>
    </div>
  );
}
