"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FREE_SHIPPING_THRESHOLD,
  PAYMENT_METHOD_LABELS,
  PK_PROVINCES,
  STANDARD_SHIPPING_FEE,
} from "@/lib/constants/commerce";
import { formatPrice } from "@/lib/products/format";
import { placeOrderAction, validateCoupon } from "@/actions/orders";
import { syncFullCartAction } from "@/actions/cart";
import { shippingAddressSchema } from "@/lib/validations/commerce";

const STEPS = ["Shipping", "Payment", "Review"] as const;

type CheckoutFormState = {
  fullName: string;
  phone: string;
  email: string;
  line1: string;
  line2: string;
  city: string;
  province: (typeof PK_PROVINCES)[number];
  postalCode: string;
  paymentMethod: string;
  paymentReference: string;
  notes: string;
};

export default function CheckoutForm() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCart();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);

  const [form, setForm] = useState<CheckoutFormState>({
    fullName: "",
    phone: "",
    email: "",
    line1: "",
    line2: "",
    city: "",
    province: PK_PROVINCES[0],
    postalCode: "",
    paymentMethod: "cod" as string,
    paymentReference: "",
    notes: "",
  });

  const shipping =
    totalPrice >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
  const total = Math.max(0, totalPrice - discount + shipping);

  function validateShipping(): string | null {
    const result = shippingAddressSchema.safeParse({
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      line1: form.line1.trim(),
      line2: form.line2.trim() || undefined,
      city: form.city.trim(),
      province: form.province,
      postalCode: form.postalCode.trim() || undefined,
    });

    if (!result.success) {
      return result.error.issues[0]?.message ?? "Please complete shipping details";
    }

    return null;
  }

  function validatePayment(): string | null {
    if (
      (form.paymentMethod === "bank_transfer" ||
        form.paymentMethod === "jazzcash" ||
        form.paymentMethod === "easypaisa") &&
      !form.paymentReference.trim()
    ) {
      return "Payment reference / transaction ID is required";
    }
    return null;
  }

  function goToPayment() {
    const shippingError = validateShipping();
    if (shippingError) {
      setError(shippingError);
      return;
    }
    setError("");
    setStep(1);
  }

  function goToReview() {
    const paymentError = validatePayment();
    if (paymentError) {
      setError(paymentError);
      return;
    }
    setError("");
    setStep(2);
  }

  async function applyCoupon() {
    const result = await validateCoupon(couponCode, totalPrice);
    if (result.valid) setDiscount(result.discount);
    else setError("Invalid coupon code");
  }

  async function placeOrder() {
    const shippingError = validateShipping();
    if (shippingError) {
      setError(shippingError);
      setStep(0);
      return;
    }

    const paymentError = validatePayment();
    if (paymentError) {
      setError(paymentError);
      setStep(1);
      return;
    }

    setLoading(true);
    setError("");
    const cartPayload = items.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
    }));

    try {
      await syncFullCartAction(cartPayload);
    } catch {
      // non-blocking; order uses validated client items
    }

    const result = await placeOrderAction({
      shipping: {
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        line1: form.line1.trim(),
        line2: form.line2.trim() || undefined,
        city: form.city.trim(),
        province: form.province as (typeof PK_PROVINCES)[number],
        postalCode: form.postalCode.trim() || undefined,
      },
      paymentMethod: form.paymentMethod as "cod",
      couponCode: couponCode || undefined,
      paymentReference: form.paymentReference || undefined,
      notes: form.notes || undefined,
      items: cartPayload,
    });
    setLoading(false);

    if (!result.success) {
      setError(result.error ?? "Order failed");
      return;
    }

    if (result.redirectUrl) {
      window.location.href = result.redirectUrl;
      return;
    }

    clearCart();
    router.push(`/checkout/success?order=${result.orderNumber}`);
  }

  if (!items.length) {
    return (
      <p className="text-center py-20 text-muted-foreground">
        Your cart is empty.{" "}
        <a href="/shop" className="text-primary underline">
          Continue shopping
        </a>
      </p>
    );
  }

  return (
    <div className="grid lg:grid-cols-3 gap-10">
      <div className="lg:col-span-2 space-y-6">
        <div className="flex gap-2 mb-6">
          {STEPS.map((s, i) => (
            <button
              key={s}
              type="button"
              onClick={() => i < step && setStep(i)}
              className={`flex-1 py-2 text-xs uppercase tracking-wider border ${
                i === step
                  ? "bg-primary text-white border-primary"
                  : i < step
                    ? "border-primary text-primary"
                    : "border-border text-muted-foreground"
              }`}
            >
              {i + 1}. {s}
            </button>
          ))}
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 p-3">{error}</p>
        )}

        {step === 0 && (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              goToPayment();
            }}
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Full Name</Label>
                <Input
                  value={form.fullName}
                  onChange={(e) =>
                    setForm({ ...form, fullName: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Address</Label>
              <Input
                value={form.line1}
                onChange={(e) => setForm({ ...form, line1: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Apartment / Landmark (optional)</Label>
              <Input
                value={form.line2}
                onChange={(e) => setForm({ ...form, line2: e.target.value })}
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>City</Label>
                <Input
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Province</Label>
                <select
                  className="w-full h-9 border border-input px-3 text-sm"
                  value={form.province}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      province: e.target.value as (typeof PK_PROVINCES)[number],
                    })
                  }
                >
                  {PK_PROVINCES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <Button type="submit" className="w-full sm:w-auto">
              Continue to Payment
            </Button>
          </form>
        )}

        {step === 1 && (
          <div className="space-y-4">
            {Object.entries(PAYMENT_METHOD_LABELS).map(([key, label]) => (
              <label
                key={key}
                className={`flex items-center gap-3 p-4 border cursor-pointer ${
                  form.paymentMethod === key
                    ? "border-primary bg-primary/5"
                    : "border-border"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value={key}
                  checked={form.paymentMethod === key}
                  onChange={() => setForm({ ...form, paymentMethod: key })}
                />
                <span className="text-sm font-medium">{label}</span>
              </label>
            ))}

            {form.paymentMethod === "bank_transfer" && (
              <div className="bg-muted p-4 text-sm space-y-1">
                <p>
                  <strong>Bank:</strong>{" "}
                  {process.env.NEXT_PUBLIC_BANK_NAME ?? "HBL"}
                </p>
                <p>
                  <strong>Account:</strong>{" "}
                  {process.env.NEXT_PUBLIC_BANK_ACCOUNT_NUMBER ??
                    "12345678901234"}
                </p>
                <p>
                  <strong>IBAN:</strong>{" "}
                  {process.env.NEXT_PUBLIC_BANK_IBAN ?? "PK00HABB0000000000123456"}
                </p>
                <div className="pt-2">
                  <Label>Transaction Reference</Label>
                  <Input
                    value={form.paymentReference}
                    onChange={(e) =>
                      setForm({ ...form, paymentReference: e.target.value })
                    }
                    placeholder="Enter bank transaction ID"
                  />
                </div>
              </div>
            )}

            {(form.paymentMethod === "jazzcash" ||
              form.paymentMethod === "easypaisa") && (
              <div>
                <Label>Transaction ID</Label>
                <Input
                  value={form.paymentReference}
                  onChange={(e) =>
                    setForm({ ...form, paymentReference: e.target.value })
                  }
                  placeholder="Enter JazzCash / EasyPaisa TID"
                />
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(0)}>
                Back
              </Button>
              <Button onClick={goToReview}>Review Order</Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="bg-muted p-4 text-sm space-y-2">
              <p>
                <strong>Ship to:</strong> {form.fullName}, {form.line1},{" "}
                {form.city}, {form.province}
              </p>
              <p>
                <strong>Phone:</strong> {form.phone}
              </p>
              <p>
                <strong>Payment:</strong>{" "}
                {PAYMENT_METHOD_LABELS[form.paymentMethod]}
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={placeOrder} disabled={loading}>
                {loading ? "Placing order..." : "Place Order"}
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="border border-border p-6 h-fit space-y-4">
        <h2 className="font-serif text-lg">Order Summary</h2>
        {items.map((item) => (
          <div key={item.product.id} className="flex justify-between text-sm">
            <span>
              {item.product.name} × {item.quantity}
            </span>
            <span>{formatPrice(item.product.price * item.quantity)}</span>
          </div>
        ))}
        <div className="border-t pt-3 space-y-2 text-sm">
          <div className="flex gap-2">
            <Input
              placeholder="Coupon code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
            />
            <Button type="button" variant="outline" onClick={applyCoupon}>
              Apply
            </Button>
          </div>
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-green-700">
              <span>Discount</span>
              <span>-{formatPrice(discount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>
              {shipping === 0 ? "Free" : formatPrice(shipping)}
            </span>
          </div>
          <div className="flex justify-between font-medium text-base pt-2 border-t">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
