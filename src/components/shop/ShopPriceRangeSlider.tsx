"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/products/format";
import { cn } from "@/lib/utils";

export const SHOP_PRICE_CAP = 15000;
export const SHOP_PRICE_STEP = 50;

type ShopPriceRangeSliderProps = {
  min: number;
  max: number;
  onCommit: (min: number, max: number) => void;
  variant?: "light" | "dark";
};

function clamp(value: number, low: number, high: number) {
  return Math.min(Math.max(value, low), high);
}

function normalizeRange(min: number, max: number) {
  const lo = clamp(min, 0, SHOP_PRICE_CAP - SHOP_PRICE_STEP);
  const hi = clamp(
    Math.max(max, lo + SHOP_PRICE_STEP),
    lo + SHOP_PRICE_STEP,
    SHOP_PRICE_CAP
  );
  return { lo, hi };
}

export default function ShopPriceRangeSlider({
  min,
  max,
  onCommit,
  variant = "light",
}: ShopPriceRangeSliderProps) {
  const [low, setLow] = useState(min);
  const [high, setHigh] = useState(max);
  const dark = variant === "dark";

  useEffect(() => {
    setLow(min);
    setHigh(max);
  }, [min, max]);

  const apply = (nextMin: number, nextMax: number) => {
    const { lo, hi } = normalizeRange(nextMin, nextMax);
    setLow(lo);
    setHigh(hi);
    onCommit(lo, hi);
  };

  const lowPct = (low / SHOP_PRICE_CAP) * 100;
  const highPct = (high / SHOP_PRICE_CAP) * 100;

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "flex items-center justify-between gap-2 text-[13px]",
          dark ? "text-champagne" : "text-ink"
        )}
      >
        <span className="font-semibold tracking-wide">
          {formatPrice(low)} – {formatPrice(high)}
        </span>
        <span className={cn("text-[10px]", dark ? "text-white/45" : "text-ink-soft")}>
          Drag to refine
        </span>
      </div>

      <div className="shop-price-range-rail relative py-5">
        <div className="pointer-events-none absolute top-1/2 right-0 left-0 h-2 -translate-y-1/2">
          <div
            className={cn(
              "absolute inset-0 rounded-full",
              dark
                ? "bg-white/[0.14] shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)]"
                : "bg-border-warm"
            )}
          />
          <div
            className={cn(
              "absolute top-0 bottom-0 rounded-full",
              dark
                ? "bg-champagne shadow-[0_0_14px_rgba(201,169,110,0.5)]"
                : "bg-emerald"
            )}
            style={{
              left: `${lowPct}%`,
              width: `${Math.max(0, highPct - lowPct)}%`,
            }}
          />
        </div>
        <input
          type="range"
          min={0}
          max={SHOP_PRICE_CAP}
          step={SHOP_PRICE_STEP}
          value={low}
          onChange={(e) => {
            const v = Number(e.target.value);
            setLow(Math.min(v, high - SHOP_PRICE_STEP));
          }}
          onPointerUp={(e) => {
            const v = Number((e.target as HTMLInputElement).value);
            apply(v, high);
          }}
          className={cn(
            "shop-price-range-thumb absolute inset-x-0 top-0 z-[2] h-10 w-full cursor-grab appearance-none bg-transparent active:cursor-grabbing",
            dark ? "shop-price-range-thumb--dark" : "shop-price-range-thumb--light"
          )}
          aria-label="Minimum price"
        />
        <input
          type="range"
          min={0}
          max={SHOP_PRICE_CAP}
          step={SHOP_PRICE_STEP}
          value={high}
          onChange={(e) => {
            const v = Number(e.target.value);
            setHigh(Math.max(v, low + SHOP_PRICE_STEP));
          }}
          onPointerUp={(e) => {
            const v = Number((e.target as HTMLInputElement).value);
            apply(low, v);
          }}
          className={cn(
            "shop-price-range-thumb absolute inset-x-0 top-0 z-[3] h-10 w-full cursor-grab appearance-none bg-transparent active:cursor-grabbing",
            dark ? "shop-price-range-thumb--dark" : "shop-price-range-thumb--light"
          )}
          aria-label="Maximum price"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span
            className={cn(
              "mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em]",
              dark ? "text-white/50" : "text-ink-soft"
            )}
          >
            Min
          </span>
          <input
            type="number"
            min={0}
            max={high - SHOP_PRICE_STEP}
            step={SHOP_PRICE_STEP}
            value={low}
            onChange={(e) => setLow(Number(e.target.value) || 0)}
            onBlur={() => apply(low, high)}
            className={cn(
              "w-full rounded-[5px] border px-3 py-2.5 text-[13px] outline-none transition-colors",
              dark
                ? "border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-champagne/50"
                : "border-border-warm bg-white text-ink focus:border-emerald/50"
            )}
          />
        </label>
        <label className="block">
          <span
            className={cn(
              "mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em]",
              dark ? "text-white/50" : "text-ink-soft"
            )}
          >
            Max
          </span>
          <input
            type="number"
            min={low + SHOP_PRICE_STEP}
            max={SHOP_PRICE_CAP}
            step={SHOP_PRICE_STEP}
            value={high}
            onChange={(e) =>
              setHigh(Number(e.target.value) || SHOP_PRICE_CAP)
            }
            onBlur={() => apply(low, high)}
            className={cn(
              "w-full rounded-[5px] border px-3 py-2.5 text-[13px] outline-none transition-colors",
              dark
                ? "border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-champagne/50"
                : "border-border-warm bg-white text-ink focus:border-emerald/50"
            )}
          />
        </label>
      </div>
    </div>
  );
}
