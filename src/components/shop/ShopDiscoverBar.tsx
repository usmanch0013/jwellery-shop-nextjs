"use client";

import { useState } from "react";
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

const MOOD_FILTERS = [
  {
    id: "all",
    label: "Everything",
    hint: "Full catalogue",
    icon: Grid3x3,
  },
  {
    id: "new",
    label: "New in",
    hint: "Latest drops",
    icon: Sparkles,
  },
  {
    id: "bestseller",
    label: "Best loved",
    hint: "Top picks",
    icon: TrendingUp,
  },
  {
    id: "featured",
    label: "Editorial",
    hint: "Curated",
    icon: Star,
  },
  {
    id: "sale",
    label: "On sale",
    hint: "Special prices",
    icon: Tag,
  },
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

const AI_PLACEHOLDERS = [
  "Bridal necklace under 5000 PKR",
  "Best selling earrings for party",
  "New arrivals — gold tone bangles",
];

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
    () => AI_PLACEHOLDERS[Math.floor(Math.random() * AI_PLACEHOLDERS.length)]
  );

  const priceFiltered = priceMin > 0 || priceMax < SHOP_PRICE_CAP;
  const hasActive =
    activeCategory !== "all" ||
    activeFilter !== "all" ||
    priceFiltered ||
    activeSort !== "newest";

  const sortedCategories = [...categories].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

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
        "AI is busy — try mood cards below or use the SHE AI chat button."
      );
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <div className="shop-ai-filter mb-10 overflow-hidden rounded-[5px] shadow-[0_16px_48px_rgba(11,61,53,0.12)]">
      <div className="relative bg-charcoal px-4 py-4 sm:px-6 sm:py-5">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 100% 0%, rgba(201,169,110,0.25), transparent 55%), radial-gradient(ellipse 60% 50% at 0% 100%, rgba(11,61,53,0.5), transparent 50%)",
          }}
        />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-[5px] bg-gradient-to-br from-emerald to-charcoal ring-1 ring-champagne/30">
              <Wand2 className="size-5 text-champagne" strokeWidth={1.75} />
            </span>
            <div>
              <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-champagne/90">
                <Sparkles className="size-3" />
                SHE style assistant
              </p>
              <p className="mt-1 font-serif text-lg text-white sm:text-xl">
                Refine your perfect piece
              </p>
              <p className="mt-0.5 text-[12px] text-white/55">
                Smart filters — same intelligence as SHE AI
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 rounded-[5px] border border-white/10 bg-white/5 px-2 py-1">
              <ArrowUpDown className="size-3.5 text-champagne/80" />
              <label className="sr-only" htmlFor="shop-sort">Sort</label>
              <select
                id="shop-sort"
                className="max-w-[10rem] cursor-pointer bg-transparent py-1.5 text-[11px] font-medium text-white outline-none"
                value={activeSort}
                onChange={(e) => onSort(e.target.value)}
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value} className="text-charcoal">
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            {hasActive && (
              <button
                type="button"
                onClick={onClearAll}
                className="inline-flex items-center gap-1.5 rounded-[5px] border border-champagne/35 bg-champagne/10 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-champagne transition-colors hover:bg-champagne/20"
              >
                <X className="size-3.5" />
                Reset
              </button>
            )}
          </div>
        </div>

        <form
          className="relative mt-4"
          onSubmit={(e) => {
            e.preventDefault();
            void askStyleAssistant();
          }}
        >
          <div
            className="flex items-center gap-2 rounded-[5px] border border-white/12 bg-white/6 px-3 py-2 ring-1 ring-champagne/15 backdrop-blur-sm focus-within:border-champagne/35 focus-within:ring-champagne/30"
          >
            <Sparkles
              className="size-4 shrink-0 text-champagne/80"
              strokeWidth={1.75}
            />
            <input
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              placeholder={placeholder}
              maxLength={500}
              disabled={aiLoading}
              className="min-w-0 flex-1 bg-transparent text-[13px] text-white placeholder:text-white/40 outline-none"
              aria-label="Describe what you are looking for"
            />
            <button
              type="submit"
              disabled={aiLoading || !aiQuery.trim()}
              className="inline-flex shrink-0 items-center gap-1 rounded-[5px] bg-champagne px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-charcoal transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              {aiLoading ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Send className="size-3.5" />
              )}
              Ask AI
            </button>
          </div>
          {aiReply && (
            <p
              className="mt-2 text-[12px] leading-relaxed text-champagne/90"
              role="status"
            >
              {aiReply}
            </p>
          )}
        </form>
      </div>

      <div className="border-t border-border-warm/80 bg-surface-warm p-4 sm:p-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-8">
          <div>
            <p className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald">
              <Sparkles className="size-3.5" />
              Curated for you
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5 lg:gap-2.5">
              {MOOD_FILTERS.map((f) => {
                const Icon = f.icon;
                const active = activeFilter === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => onFilter(f.id)}
                    className={cn(
                      "group flex min-h-[4.5rem] flex-col justify-between rounded-[5px] border p-3 text-left transition-all duration-300",
                      active
                        ? "border-champagne/50 bg-gradient-to-br from-emerald via-emerald-dark to-charcoal text-white shadow-[0_8px_24px_rgba(11,61,53,0.35)]"
                        : "border-border-warm bg-white text-ink hover:border-emerald/25 hover:shadow-md"
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-4 transition-colors",
                        active ? "text-champagne" : "text-emerald/70"
                      )}
                      strokeWidth={1.75}
                    />
                    <div>
                      <p className="text-[11px] font-semibold leading-tight">
                        {f.label}
                      </p>
                      <p
                        className={cn(
                          "mt-0.5 text-[9px] leading-tight",
                          active ? "text-white/55" : "text-ink-soft"
                        )}
                      >
                        {f.hint}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-[5px] border border-emerald/15 bg-gradient-to-br from-charcoal via-charcoal to-emerald p-4 shadow-inner sm:p-5">
            <p className="mb-4 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-champagne/90">
              <Layers className="size-3.5" />
              Price intelligence
            </p>
            <ShopPriceRangeSlider
              min={priceMin}
              max={priceMax}
              onCommit={onPriceRange}
              variant="dark"
            />
          </div>
        </div>

        <div className="mt-6 border-t border-border-warm pt-6">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-soft">
            Categories
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onCategory("all")}
              className={cn(
                "rounded-[5px] px-3.5 py-2 text-[11px] font-medium transition-all",
                activeCategory === "all"
                  ? "bg-emerald text-white shadow-sm ring-1 ring-champagne/30"
                  : "bg-white text-ink-muted ring-1 ring-[#e5dfd0] hover:ring-emerald/30"
              )}
            >
              All
            </button>
            {sortedCategories.map((cat) => {
              const active = activeCategory === cat.slug;
              return (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => onCategory(cat.slug)}
                  className={cn(
                    "rounded-[5px] px-3.5 py-2 text-[11px] font-medium transition-all",
                    active
                      ? "bg-emerald text-white shadow-sm ring-1 ring-champagne/30"
                      : "bg-white text-ink-muted ring-1 ring-[#e5dfd0] hover:ring-emerald/30"
                  )}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
