"use client";

import Link from "next/link";
import { ArrowRight, Tag } from "lucide-react";
import type { CategoryInfo, Product } from "@/types";
import ProductCard from "@/components/ProductCard";
import { discountPercent } from "@/lib/products/sale";

interface SaleDealsSectionProps {
  saleProducts: Product[];
  activeCategories: CategoryInfo[];
  onQuickView?: (product: Product) => void;
}

const priceDeals = [
  { label: "Under Rs. 2,000", href: "/shop?max=2000" },
  { label: "Under Rs. 5,000", href: "/shop?max=5000" },
  { label: "All Sale Items", href: "/shop?filter=sale" },
];

export default function SaleDealsSection({
  saleProducts,
  activeCategories,
  onQuickView,
}: SaleDealsSectionProps) {
  if (saleProducts.length === 0) return null;

  const topDiscount = [...saleProducts].sort(
    (a, b) => discountPercent(b) - discountPercent(a)
  )[0];
  const heroDiscount = topDiscount ? discountPercent(topDiscount) : 0;

  return (
    <section className="relative py-16 lg:py-20 overflow-hidden bg-emerald-dark">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(201,169,110,0.15),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(255,255,255,0.06),transparent_50%)]" />

      <div className="relative max-w-[1400px] mx-auto px-4">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8">
          <div className="max-w-xl">
            <p className="text-champagne text-[10px] sm:text-xs font-medium uppercase tracking-[0.35em] mb-3">
              Special Offers
            </p>
            <h2 className="font-serif text-3xl lg:text-[2.75rem] leading-tight text-white mb-3">
              Discounted Jewellery
            </h2>
            <p className="text-sm text-white/65 leading-relaxed">
              Handpicked pieces on sale — up to{" "}
              <span className="text-champagne font-medium">{heroDiscount}% off</span>{" "}
              on selected necklace sets, earrings, bridal &amp; more.
            </p>
          </div>
          <Link
            href="/shop?filter=sale"
            className="inline-flex items-center gap-2 self-start lg:self-auto border border-champagne/50 text-champagne px-6 py-3 text-sm font-medium hover:bg-champagne hover:text-emerald-dark transition-colors"
          >
            Shop all deals
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="flex flex-wrap gap-2 mb-10">
          {priceDeals.map((deal) => (
            <Link
              key={deal.href}
              href={deal.href}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-[11px] uppercase tracking-wider border border-white/20 text-white/90 hover:border-champagne hover:text-champagne transition-colors"
            >
              <Tag className="w-3 h-3" />
              {deal.label}
            </Link>
          ))}
          {activeCategories.slice(0, 4).map((cat) => (
            <Link
              key={cat.slug}
              href={`/categories/${cat.slug}`}
              className="inline-flex items-center px-4 py-2 text-[11px] uppercase tracking-wider border border-white/10 text-white/70 hover:border-white/30 hover:text-white transition-colors"
            >
              {cat.name}
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-3">
          {saleProducts.slice(0, 8).map((product) => (
            <div
              key={product.id}
              className="rounded-md bg-white/[0.03] p-1.5 ring-1 ring-white/10 hover:ring-champagne/40 transition-shadow"
            >
              <ProductCard product={product} onQuickView={onQuickView} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
