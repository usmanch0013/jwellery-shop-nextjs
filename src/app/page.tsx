"use client";

import { useState } from "react";
import Link from "next/link";
import { Product } from "@/types";
import ProductShowcase from "@/components/ProductShowcase";
import ProductCard from "@/components/ProductCard";
import QuickViewDialog from "@/components/QuickViewDialog";
import TrustBar from "@/components/TrustBar";
import Testimonials from "@/components/Testimonials";
import StoreLocator from "@/components/StoreLocator";
import BlogSection from "@/components/BlogSection";
import FAQ from "@/components/FAQ";
import CategoryCard from "@/components/CategoryCard";
import { categories, products } from "@/data/products";
import HeroSection from "@/components/HeroSection";
import MarqueeBar from "@/components/MarqueeBar";

export default function HomePage() {
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(
    null
  );

  const necklaceProducts = products.filter(
    (p) => p.category === "necklace-sets"
  );
  const earringProducts = products.filter((p) => p.category === "earrings");
  const braceletProducts = products.filter((p) => p.category === "bracelet");
  const bridalProducts = products.filter((p) => p.category === "bridal-sets");
  const bestSelling = products.filter((p) => p.isBestseller);
  const newArrivals = products.filter((p) => p.isNew);
  const mostLoved = products.filter(
    (p) => p.isBestseller || p.reviews > 20
  );

  return (
    <>
      <HeroSection />
      <MarqueeBar />

      <ProductShowcase
        title="Necklace Sets"
        products={necklaceProducts}
        categorySlug="necklace-sets"
        categoryCount={445}
        onQuickView={setQuickViewProduct}
      />
      <ProductShowcase
        title="Earrings"
        products={earringProducts}
        categorySlug="earrings"
        categoryCount={345}
        onQuickView={setQuickViewProduct}
      />

      <section className="py-8 lg:py-12 bg-background">
        <div className="max-w-[1400px] mx-auto px-4">
          <h2 className="font-serif text-2xl lg:text-[28px] text-center mb-8 text-foreground">
            Our Most Loved Products
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-5">
            {mostLoved.slice(0, 4).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={setQuickViewProduct}
              />
            ))}
          </div>
        </div>
      </section>

      <ProductShowcase
        title="Best selling products"
        products={bestSelling}
        onQuickView={setQuickViewProduct}
      />
      <ProductShowcase
        title="Bracelet"
        products={braceletProducts}
        categorySlug="bracelet"
        categoryCount={292}
        onQuickView={setQuickViewProduct}
      />
      <ProductShowcase
        title="Bridal Jewellery Sets"
        products={bridalProducts}
        categorySlug="bridal-sets"
        categoryCount={167}
        onQuickView={setQuickViewProduct}
      />
      <ProductShowcase
        title="What's New"
        products={newArrivals}
        categorySlug="earrings"
        categoryCount={370}
        onQuickView={setQuickViewProduct}
      />

      <section className="py-14 bg-background">
        <div className="max-w-[800px] mx-auto px-4 text-center">
          <h2 className="font-serif text-2xl lg:text-3xl mb-4 text-foreground">
            Artificial Jewellery in Pakistan
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We as the growing and customer&apos;s favourite Artificial Jewellery
            Brand in Pakistan have a huge collection of precious jewels made from
            highest grade of materials and attention to detail.
          </p>
        </div>
      </section>

      <section className="py-6">
        <div className="max-w-[1400px] mx-auto px-4">
          <div className="grid grid-cols-2 gap-4">
            <Link
              href="/shop?max=1000"
              className="relative aspect-[2.5/1] bg-champagne flex items-center justify-center overflow-hidden group"
            >
              <h3 className="font-serif text-3xl lg:text-4xl text-white uppercase tracking-wider">
                Under 1000
              </h3>
            </Link>
            <Link
              href="/shop?max=2000"
              className="relative aspect-[2.5/1] bg-primary flex items-center justify-center overflow-hidden group"
            >
              <h3 className="font-serif text-3xl lg:text-4xl text-white uppercase tracking-wider">
                Under 2000
              </h3>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-12 bg-background">
        <div className="max-w-[1400px] mx-auto px-4">
          <h2 className="font-serif text-2xl text-center mb-8">Our Collections</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {categories.slice(0, 6).map((cat) => (
              <CategoryCard key={cat.slug} category={cat} />
            ))}
          </div>
        </div>
      </section>

      <div id="reviews">
        <Testimonials />
      </div>
      <StoreLocator />
      <BlogSection />
      <TrustBar />
      <FAQ />

      <QuickViewDialog
        product={quickViewProduct}
        open={!!quickViewProduct}
        onOpenChange={(open) => !open && setQuickViewProduct(null)}
      />
    </>
  );
}
