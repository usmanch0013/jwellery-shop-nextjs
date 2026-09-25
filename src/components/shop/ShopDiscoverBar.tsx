"use client";

import { useState, type ReactNode } from "react";
import {
  ArrowUpDown,
  Grid3x3,
  Layers,
  Loader2,
  Send,
  Sparkles,
  Star,
  Tag,
  TrendingUp,
  Wand2,
  X,
} from "lucide-react";
import type { ProductSearchIntent, ShopAssistantResponse } from "@/lib/shop-assistant/types";
import type { CategoryInfo } from "@/types";
import { cn } from "@/lib/utils";
import ShopPriceRangeSlider, {
  SHOP_PRICE_CAP,
} from "@/components/shop/ShopPriceRangeSlider";
import { SHOP_FILTER_AI_PLACEHOLDERS } from "@/lib/shop-assistant/copy";

const MOOD_FILTERS = [
  { id: "all", label: "Everything", icon: Grid3x3 },
  { id: "new", label: "New in", icon: Sparkles },
  { id: "bestseller", label: "Best loved", icon: TrendingUp },
  { id: "featured", label: "Editorial", icon: Star },
  { id: "sale", label: "On sale", icon: Tag },
] as const;

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "popular", label: "Most loved" },
  { value: "price_asc", label: "Price · low to high" },
  { value: "price_desc", label: "Price · high to low" },
] as const;

type ShopDiscoverBarProps = {
  categories: CategoryInfo[];
  activeCategory: string;
  activeFilter: string;
  activeSort: string;
  priceMin: number;
  priceMax: number;
  onCategory: (slug: string) => void;
  onFilter: (filter: string) => void;
  onSort: (sort: string) => void;
  onPriceRange: (min: number, max: number) => void;
  onClearAll: () => void;
  onAssistantIntent: (intent: ProductSearchIntent) => void;
};

function ShopFilterSelect({
  id,
  label,
  icon: Icon,
  value,
  onChange,
  children,
  variant = "dark",
}: {
  id: string;
  label: string;
  icon: typeof Layers;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  variant?: "dark" | "light";
}) {
  const dark = variant === "dark";
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-[5px] border px-2 py-0.5",
        dark
          ? "border-white/10 bg-white/5"
          : "border-border-warm bg-white"
      )}
    >
      <Icon
        className={cn("size-3 shrink-0", dark ? "text-champagne/80" : "text-emerald/80")}
      />
      <label className="sr-only" htmlFor={id}>{label}</label>
      <select
        id={id}
        className={cn(
          "max-w-[10.5rem] cursor-pointer bg-transparent py-1 text-[11px] font-medium outline-none sm:max-w-[11.5rem]",
          dark ? "text-white" : "text-ink"
        )}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {children}
      </select>
    </div>
  );
}

export default function ShopDiscoverBar({
  categories,
  activeCategory,
  activeFilter,
  activeSort,
  priceMin,
  priceMax,
  onCategory,
  onFilter,
  onSort,
  onPriceRange,
  onClearAll,
  onAssistantIntent,
}: ShopDiscoverBarProps) {
  const [aiQuery, setAiQuery] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiReply, setAiReply] = useState<string | null>(null);
  const [placeholder] = useState(
    () =>
      SHOP_FILTER_AI_PLACEHOLDERS[
        Math.floor(Math.random() * SHOP_FILTER_AI_PLACEHOLDERS.length)
      ]
  );

  const sortedCategories = [...categories].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  const priceFiltered = priceMin > 0 || priceMax < SHOP_PRICE_CAP;
  const hasActive =
    activeCategory !== "all" ||
    activeFilter !== "all" ||
    priceFiltered ||
    activeSort !== "newest";

  async function askStyleAssistant() {
    const text = aiQuery.trim();
    if (!text || aiLoading) return;

    setAiLoading(true);
    setAiReply(null);

    try {
      const res = await fetch("/api/shop-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: [] }),
      });
      const data = (await res.json()) as ShopAssistantResponse & {
        error?: string;
      };
      if (!res.ok) throw new Error(data.error ?? "Request failed");

      setAiReply(data.message);
      if (data.intent) {
        onAssistantIntent(data.intent);
      }
    } catch {
      setAiReply(
        "AI is busy — try mood chips below or use the SHE AI chat button."
      );
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <div className="shop-ai-filter mb-6 overflow-hidden rounded-[5px] shadow-[0_12px_36px_rgba(11,61,53,0.1)]">
      <div className="relative bg-charcoal px-3 py-3 sm:px-5 sm:py-3.5">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.3]"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 100% 0%, rgba(201,169,110,0.22), transparent 55%)",
          }}
        />
        <div className="relative flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-[5px] bg-gradient-to-br from-emerald to-charcoal ring-1 ring-champagne/30">
              <Wand2 className="size-4 text-champagne" strokeWidth={1.75} />
            </span>
            <div className="min-w-0">
              <p className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-champagne/90">
                <Sparkles className="size-3" />
                SHE style assistant
              </p>
              <p className="font-serif text-base leading-tight text-white sm:text-lg">
                Refine your perfect piece
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <ShopFilterSelect
              id="shop-category"
              label="Category"
              icon={Layers}
              value={activeCategory}
              onChange={onCategory}
            >
              <option value="all" className="text-charcoal">All categories</option>
              {sortedCategories.map((cat) => (
                <option key={cat.slug} value={cat.slug} className="text-charcoal">
                  {cat.name}
                </option>
              ))}
            </ShopFilterSelect>
            <ShopFilterSelect
              id="shop-sort"
              label="Sort"
              icon={ArrowUpDown}
              value={activeSort}
              onChange={onSort}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value} className="text-charcoal">
                  {o.label}
                </option>
              ))}
            </ShopFilterSelect>
            {hasActive && (
              <button
                type="button"
                onClick={onClearAll}
                className="inline-flex items-center gap-1 rounded-[5px] border border-champagne/35 bg-champagne/10 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-champagne transition-colors hover:bg-champagne/20"
              >
                <X className="size-3" />
                Reset
              </button>
            )}
          </div>
        </div>

        <form
          className="relative mt-2.5"
          onSubmit={(e) => {
            e.preventDefault();
            void askStyleAssistant();
          }}
        >
          <div className="flex items-center gap-2 rounded-[5px] border border-white/12 bg-white/6 px-2.5 py-1.5 ring-1 ring-champagne/15 focus-within:border-champagne/35">
            <input
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              placeholder={placeholder}
              maxLength={500}
              disabled={aiLoading}
              className="min-w-0 flex-1 bg-transparent text-[12px] text-white placeholder:text-white/40 outline-none sm:text-[13px]"
              aria-label="Describe what you are looking for"
            />
            <button
              type="submit"
              disabled={aiLoading || !aiQuery.trim()}
              className="inline-flex shrink-0 items-center gap-1 rounded-[5px] bg-champagne px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-charcoal disabled:opacity-40"
            >
              {aiLoading ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Send className="size-3.5" />
              )}
              Ask AI
            </button>
          </div>
          <p className="mt-1.5 text-[10px] leading-snug text-white/45">
            Examples:{" "}
            <span className="text-white/55">
              “2000 se kam”, “best sellers”, “bridal under 5000”
            </span>
            — mood &amp; price slider update automatically.
          </p>
          {aiReply && (
            <p className="mt-1 text-[11px] leading-snug text-champagne/90" role="status">
              {aiReply}
            </p>
          )}
        </form>
      </div>

      <div className="border-t border-border-warm/80 bg-surface-warm px-3 py-2.5 sm:px-4">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
          <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-emerald">
            Mood
          </span>
          {MOOD_FILTERS.map((f) => {
              const Icon = f.icon;
              const active = activeFilter === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => onFilter(f.id)}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-[5px] border px-2 py-1 text-[10px] font-medium transition-colors sm:text-[11px]",
                    active
                      ? "border-champagne/45 bg-emerald text-white"
                      : "border-border-warm bg-white text-ink hover:border-emerald/30"
                  )}
                >
                  <Icon
                    className={cn(
                      "size-3 shrink-0",
                      active ? "text-champagne" : "text-emerald/75"
                    )}
                    strokeWidth={1.75}
                  />
                  {f.label}
                </button>
              );
            })}

          <div
            className="mx-0.5 hidden h-7 w-px shrink-0 bg-border-warm md:block"
            aria-hidden
          />

          <div className="w-full min-w-[min(100%,17rem)] flex-1 basis-full rounded-[5px] border border-emerald/12 bg-gradient-to-r from-charcoal to-emerald/90 px-2.5 py-1.5 sm:basis-[min(100%,20rem)] sm:py-2 md:basis-auto md:min-w-[14rem]">
            <span className="mb-0.5 block text-[9px] font-semibold uppercase tracking-[0.16em] text-champagne/90">
              Price
            </span>
            <ShopPriceRangeSlider
              min={priceMin}
              max={priceMax}
              onCommit={onPriceRange}
              variant="dark"
              compact
            />
          </div>
        </div>
      </div>
    </div>
  );
}
