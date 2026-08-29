"use client";

import { useState } from "react";
import Link from "next/link";
import { CategoryInfo, Product } from "@/types";
import type { BlogPostCard } from "@/lib/blog/types";
import ProductShowcase from "@/components/ProductShowcase";
import ProductCard from "@/components/ProductCard";
import QuickViewDialog from "@/components/QuickViewDialog";
import TrustBar from "@/components/TrustBar";
import VideoSection from "@/components/VideoSection";
import Testimonials from "@/components/Testimonials";
import BlogSection from "@/components/BlogSection";
import FAQ from "@/components/FAQ";
import CategoryCard from "@/components/CategoryCard";
import HeroSection from "@/components/hero/HeroSection";
import type {
  CmsFaq,
  CmsHomepageSections,
  CmsHeroSettings,
  CmsSiteSettings,
  CmsTestimonial,
  CmsTrustFeature,
  CmsVideoSettings,
} from "@/lib/cms/types";

interface HomePageContentProps {
  categories: CategoryInfo[];
  necklaceProducts: Product[];
  earringProducts: Product[];
  braceletProducts: Product[];
  bridalProducts: Product[];
  bestSelling: Product[];
  newArrivals: Product[];
  mostLoved: Product[];
  blogPosts: BlogPostCard[];
  hero: CmsHeroSettings;
  homepage: CmsHomepageSections;
  site: CmsSiteSettings;
  testimonials: CmsTestimonial[];
  faqs: CmsFaq[];
  trustFeatures: CmsTrustFeature[];
  video: CmsVideoSettings;
}

function categoryCount(categories: CategoryInfo[], slug: string) {
  return categories.find((c) => c.slug === slug)?.productCount ?? 0;
}

export default function HomePageContent({
  categories,
  necklaceProducts,
  earringProducts,
  braceletProducts,
  bridalProducts,
  bestSelling,
  newArrivals,
  mostLoved,
  blogPosts,
  hero,
  homepage,
  site,
  testimonials,
  faqs,
  trustFeatures,
  video,
}: HomePageContentProps) {
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(
    null
  );

  return (
    <>
      <HeroSection hero={hero} marqueeText={site.marqueeText} />

      <ProductShowcase
        title={homepage.showcaseTitles["necklace-sets"] ?? "Necklace Sets"}
        products={necklaceProducts}
        categorySlug="necklace-sets"
        categoryCount={categoryCount(categories, "necklace-sets")}
        onQuickView={setQuickViewProduct}
      />
      <ProductShowcase
        title={homepage.showcaseTitles.earrings ?? "Earrings"}
        products={earringProducts}
        categorySlug="earrings"
        categoryCount={categoryCount(categories, "earrings")}
        onQuickView={setQuickViewProduct}
      />

      <section className="py-8 lg:py-12 bg-background">
        <div className="max-w-[1400px] mx-auto px-4">
          <h2 className="font-serif text-2xl lg:text-[28px] text-center mb-8 text-foreground">
            {homepage.showcaseTitles["most-loved"] ?? "Our Most Loved Products"}
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5 lg:gap-2">
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

      <VideoSection video={video} />

      <ProductShowcase
        title={homepage.showcaseTitles["best-selling"] ?? "Best selling products"}
        products={bestSelling}
        onQuickView={setQuickViewProduct}
      />
      <ProductShowcase
        title={homepage.showcaseTitles.bracelet ?? "Bracelet"}
        products={braceletProducts}
        categorySlug="bracelet"
        categoryCount={categoryCount(categories, "bracelet")}
        onQuickView={setQuickViewProduct}
      />
      <ProductShowcase
        title={homepage.showcaseTitles["bridal-sets"] ?? "Bridal Jewellery Sets"}
        products={bridalProducts}
        categorySlug="bridal-sets"
        categoryCount={categoryCount(categories, "bridal-sets")}
        onQuickView={setQuickViewProduct}
      />
      <ProductShowcase
        title={homepage.showcaseTitles["new-arrivals"] ?? "What's New"}
        products={newArrivals}
        categorySlug="earrings"
        categoryCount={categoryCount(categories, "earrings")}
        onQuickView={setQuickViewProduct}
      />

      <section className="py-14 bg-background">
        <div className="max-w-[800px] mx-auto px-4 text-center">
          <h2 className="font-serif text-2xl lg:text-3xl mb-4 text-foreground">
            {homepage.seoBlock.title}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {homepage.seoBlock.body}
          </p>
        </div>
      </section>

      <section className="py-6">
        <div className="max-w-[1400px] mx-auto px-4">
          <div className="grid grid-cols-2 gap-4">
            {homepage.promoBanners.map((banner) => (
            <Link
              key={banner.href}
              href={banner.href}
              className={`relative aspect-[2.5/1] flex items-center justify-center overflow-hidden group ${
                banner.bgColor === "primary" ? "bg-primary" : "bg-champagne"
              }`}
            >
              <h3 className="font-serif text-3xl lg:text-4xl text-white uppercase tracking-wider">
                {banner.label}
              </h3>
            </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-background">
        <div className="max-w-[1400px] mx-auto px-4">
          <h2 className="font-serif text-2xl text-center mb-8">{homepage.collectionsTitle}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-1.5 lg:gap-2">
            {categories.slice(0, 6).map((cat) => (
              <CategoryCard key={cat.slug} category={cat} />
            ))}
          </div>
        </div>
      </section>

      <div id="reviews">
        <Testimonials
          testimonials={testimonials}
          badge={homepage.testimonials.badge}
          title={homepage.testimonials.title}
          backgroundImage={homepage.testimonials.backgroundImage}
        />
      </div>
      <BlogSection posts={blogPosts} />
      <TrustBar features={trustFeatures} />
      <FAQ
        faqs={faqs}
        title={homepage.faq.title}
        subtitle={homepage.faq.subtitle}
      />

      <QuickViewDialog
        product={quickViewProduct}
        open={!!quickViewProduct}
        onOpenChange={(open) => !open && setQuickViewProduct(null)}
      />
    </>
  );
}
