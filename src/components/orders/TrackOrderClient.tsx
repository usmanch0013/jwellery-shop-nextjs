"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trackOrderAction } from "@/actions/orders";
import { formatPrice } from "@/lib/products/format";
import { ORDER_STATUS_LABELS } from "@/lib/constants/commerce";
import type { DbOrder, DbOrderItem } from "@/lib/database.types";
import type { DbOrderEvent } from "@/lib/orders/events";
import OrderTimeline from "@/components/orders/OrderTimeline";
import { OrderStatusBadge } from "@/components/admin/StatusBadge";
import { getCarrierLabel } from "@/lib/orders/carriers";

export default function TrackOrderClient({
  initialOrder,
}: {
  initialOrder?: string;
}) {
  const [orderNumber, setOrderNumber] = useState(initialOrder ?? "");
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState<{
    order: DbOrder;
    items: DbOrderItem[];
    events: DbOrderEvent[];
  } | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleTrack(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const data = await trackOrderAction(orderNumber, phone);
    setLoading(false);
    if (!data) {
      setError("Order not found. Check order number and phone.");
      setResult(null);
      return;
    }
    setResult(data);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <form onSubmit={handleTrack} className="mb-8 space-y-4 rounded-2xl border border-border/60 bg-white/80 p-6">
        <div>
          <Label htmlFor="orderNumber">Order Number</Label>
          <Input
            id="orderNumber"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="LM-XXXXXXXX"
            required
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="03XX XXXXXXX"
            required
            className="mt-1.5"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Tracking..." : "Track Order"}
        </Button>
      </form>

      {result && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-border/60 bg-white/80 p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">Order</p>
                <p className="font-serif text-2xl">{result.order.order_number}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Placed {new Date(result.order.created_at).toLocaleString("en-PK")}
                </p>
              </div>
              <OrderStatusBadge status={result.order.status} />
            </div>

            {result.order.tracking_number && (
              <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50/60 px-4 py-3">
                <p className="text-sm font-medium text-emerald-900">
                  Shipment tracking
                </p>
                <p className="mt-1 text-sm text-emerald-800">
                  {getCarrierLabel(result.order.carrier)} · {result.order.tracking_number}
                </p>
                {result.order.tracking_url && (
                  <Link
                    href={result.order.tracking_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-emerald-700 hover:underline"
                  >
                    Track on carrier website
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
            )}

            <div className="mt-5 divide-y border-t">
              {result.items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between py-3 text-sm"
                >
                  <span>
                    {item.name} × {item.quantity}
                  </span>
                  <span>{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <p className="border-t pt-4 text-right font-medium">
              Total: {formatPrice(result.order.total)}
            </p>
          </div>

          <div className="rounded-2xl border border-border/60 bg-white/80 p-6">
            <h3 className="font-serif text-xl">Order timeline</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Current status: {ORDER_STATUS_LABELS[result.order.status]}
            </p>
            <div className="mt-5">
              <OrderTimeline
                events={result.events}
                currentStatus={result.order.status}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
