"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trackOrderAction } from "@/actions/orders";
import { formatPrice } from "@/lib/products/format";
import { ORDER_STATUS_LABELS } from "@/lib/constants/commerce";
import type { DbOrder, DbOrderItem } from "@/lib/database.types";

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
    <div className="max-w-lg mx-auto">
      <form onSubmit={handleTrack} className="space-y-4 mb-8">
        <div>
          <Label htmlFor="orderNumber">Order Number</Label>
          <Input
            id="orderNumber"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="LM-XXXXXXXX"
            required
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Tracking..." : "Track Order"}
        </Button>
      </form>

      {result && (
        <div className="border p-6 space-y-4">
          <div className="flex justify-between">
            <span className="font-medium">{result.order.order_number}</span>
            <span className="text-sm uppercase">
              {ORDER_STATUS_LABELS[result.order.status]}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {new Date(result.order.created_at).toLocaleString()}
          </p>
          <div className="divide-y border-t">
            {result.items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between py-2 text-sm"
              >
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <p className="text-right font-medium">
            Total: {formatPrice(result.order.total)}
          </p>
        </div>
      )}
    </div>
  );
}
