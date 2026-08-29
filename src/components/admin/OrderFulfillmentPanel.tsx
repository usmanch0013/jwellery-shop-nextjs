"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Save, Truck } from "lucide-react";
import type { DbOrder } from "@/lib/database.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminCard } from "@/components/admin/AdminShell";
import {
  addInternalNoteAction,
  updateShippingAction,
} from "@/actions/admin/orders";
import { SHIPPING_CARRIERS } from "@/lib/orders/carriers";
import { getCarrierLabel } from "@/lib/orders/carriers";

const selectClass =
  "w-full h-10 rounded-xl border border-border/70 bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20";

export default function OrderFulfillmentPanel({
  order,
}: {
  order: DbOrder;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleShipping(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const form = new FormData(e.currentTarget);
    const result = await updateShippingAction(order.id, {
      carrier: String(form.get("carrier") ?? ""),
      trackingNumber: String(form.get("trackingNumber") ?? ""),
      trackingUrl: String(form.get("trackingUrl") ?? ""),
      markShipped: form.get("markShipped") === "on",
    });
    setLoading(false);
    if (result.error) {
      setMessage(result.error);
      return;
    }
    setMessage("Shipping details saved.");
    router.refresh();
  }

  async function handleNote(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const form = new FormData(e.currentTarget);
    const result = await addInternalNoteAction(
      order.id,
      String(form.get("note") ?? "")
    );
    setLoading(false);
    if (result.error) {
      setMessage(result.error);
      return;
    }
    setMessage("Note added.");
    (e.target as HTMLFormElement).reset();
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <AdminCard
        title="Shipping & tracking"
        description="Add carrier tracking and mark as shipped"
      >
        <form onSubmit={handleShipping} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Carrier</Label>
              <select
                name="carrier"
                defaultValue={order.carrier ?? "tcs"}
                className={selectClass}
              >
                {SHIPPING_CARRIERS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Tracking number</Label>
              <Input
                name="trackingNumber"
                defaultValue={order.tracking_number ?? ""}
                placeholder="e.g. 1234567890"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Custom tracking URL (optional)</Label>
            <Input
              name="trackingUrl"
              defaultValue={order.tracking_url ?? ""}
              placeholder="https://..."
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="markShipped"
              defaultChecked={order.status !== "shipped" && order.status !== "delivered"}
              className="rounded border-border"
            />
            Mark order as shipped when saving
          </label>
          {order.tracking_number && (
            <div className="rounded-xl border border-border/60 bg-muted/20 px-4 py-3 text-sm">
              <p className="text-muted-foreground">Current tracking</p>
              <p className="font-medium">
                {getCarrierLabel(order.carrier)} · {order.tracking_number}
              </p>
              {order.tracking_url && (
                <a
                  href={order.tracking_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center gap-1 text-primary hover:underline"
                >
                  Track shipment
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          )}
          <Button type="submit" disabled={loading} className="gap-2">
            <Truck className="h-4 w-4" />
            {loading ? "Saving..." : "Save tracking"}
          </Button>
        </form>
      </AdminCard>

      <AdminCard title="Internal notes" description="Staff-only notes (not visible to customer)">
        {order.internal_notes && (
          <pre className="mb-4 max-h-40 overflow-auto whitespace-pre-wrap rounded-xl border border-border/60 bg-muted/20 p-4 text-xs text-muted-foreground">
            {order.internal_notes}
          </pre>
        )}
        <form onSubmit={handleNote} className="space-y-3">
          <textarea
            name="note"
            rows={3}
            placeholder="Add a note about this order..."
            className="w-full rounded-xl border border-border/70 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <Button type="submit" disabled={loading} variant="outline" className="gap-2">
            <Save className="h-4 w-4" />
            Add note
          </Button>
        </form>
      </AdminCard>

      {message && (
        <p className="text-sm text-muted-foreground">{message}</p>
      )}
    </div>
  );
}
