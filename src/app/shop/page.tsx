"use client";

import { useState } from "react";
import ProductGrid from "@/components/ProductGrid";
import Breadcrumbs from "@/components/Breadcrumbs";
import { products, categories } from "@/data/products";
import { Category } from "@/types";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ShopPage() {
  const [activeCategory, setActiveCategory] = useState<Category | "all">("all");

  const filteredProducts =
    activeCategory === "all"
      ? products
      : products.filter((p) => p.category === activeCategory);

  return (
    <div className="py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: "Shop" }]} />

        <div className="text-center mb-12">
          <p className="text-gold uppercase tracking-[0.3em] text-sm mb-2">
            Our Collection
          </p>
          <h1 className="text-4xl lg:text-5xl font-serif font-semibold mb-4">
            Shop All Jewelry
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Explore our complete collection of handcrafted fine jewelry.
          </p>
        </div>

        <Tabs
          value={activeCategory}
          onValueChange={(v) => setActiveCategory(v as Category | "all")}
          className="mb-12"
        >
          <TabsList className="flex flex-wrap justify-center h-auto gap-2 bg-transparent">
            <TabsTrigger
              value="all"
              className="uppercase tracking-wider text-xs data-[state=active]:bg-gold data-[state=active]:text-white"
            >
              All
            </TabsTrigger>
            {categories.map((cat) => (
              <TabsTrigger
                key={cat.slug}
                value={cat.slug}
                className="uppercase tracking-wider text-xs data-[state=active]:bg-gold data-[state=active]:text-white"
              >
                {cat.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <ProductGrid products={filteredProducts} />
    </div>
  );
}
