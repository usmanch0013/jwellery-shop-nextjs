import { getAdminCoupons } from "@/lib/admin/queries";
import { saveCouponAction, deleteCouponFormAction } from "@/actions/admin/coupons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPrice } from "@/lib/products/format";

export default async function AdminCouponsPage() {
  const coupons = await getAdminCoupons();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl">Coupons</h1>
        <p className="text-sm text-muted-foreground">Manage discount codes</p>
      </div>

      <form
        action={saveCouponAction}
        className="border border-border rounded-lg p-5 bg-background grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <h2 className="sm:col-span-2 lg:col-span-3 font-medium">Create coupon</h2>
        <div>
          <Label>Code</Label>
          <Input name="code" placeholder="WELCOME10" required />
        </div>
        <div>
          <Label>Type</Label>
          <select
            name="type"
            className="w-full h-9 border border-input px-3 text-sm rounded-md"
            defaultValue="percent"
          >
            <option value="percent">Percent</option>
            <option value="fixed">Fixed amount</option>
          </select>
        </div>
        <div>
          <Label>Value</Label>
          <Input name="value" type="number" required />
        </div>
        <div>
          <Label>Min order (Rs.)</Label>
          <Input name="minOrder" type="number" defaultValue={0} />
        </div>
        <div>
          <Label>Usage limit</Label>
          <Input name="usageLimit" type="number" placeholder="Unlimited" />
        </div>
        <div>
          <Label>Expires at</Label>
          <Input name="expiresAt" type="datetime-local" />
        </div>
        <label className="flex items-center gap-2 text-sm self-end pb-2">
          <input type="checkbox" name="isActive" defaultChecked />
          Active
        </label>
        <Button type="submit" className="self-end">
          Create
        </Button>
      </form>

      <div className="rounded-lg border border-border bg-background overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Discount</th>
              <th className="px-4 py-3">Usage</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.id} className="border-t border-border">
                <td className="px-4 py-3 font-medium">{c.code}</td>
                <td className="px-4 py-3">
                  {c.type === "percent"
                    ? `${c.value}%`
                    : formatPrice(c.value)}
                  <span className="text-muted-foreground">
                    {" "}
                    · min {formatPrice(c.min_order)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {c.usage_count}
                  {c.usage_limit ? ` / ${c.usage_limit}` : ""}
                </td>
                <td className="px-4 py-3">
                  {c.is_active ? "Active" : "Inactive"}
                </td>
                <td className="px-4 py-3">
                  <form action={deleteCouponFormAction}>
                    <input type="hidden" name="id" value={c.id} />
                    <Button type="submit" variant="outline" size="sm">
                      Delete
                    </Button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
