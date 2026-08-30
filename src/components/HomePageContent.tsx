"use client";

import { useState } from "react";
import { CategoryInfo, Product } from "@/types";
import type { BlogPostCard } from "@/lib/blog/types";
import ProductShowcase from "@/components/ProductShowcase";
import QuickViewDialog from "@/components/QuickViewDialog";
import TrustBar from "@/components/TrustBar";
import VideoSection from "@/components/VideoSection";
import Testimonials from "@/components/Testimonials";
import BlogSection from "@/components/BlogSection";
import FAQ from "@/components/FAQ";
import CollectionsSection from "@/components/CollectionsSection";
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
  bestSellingCount: number;
  newArrivals: Product[];
  newArrivalsCount: number;
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
  bestSellingCount,
  newArrivals,
  newArrivalsCount,
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
        title={homepage.showcaseTitles["bridal-sets"] ?? "Bridal"}
        products={bridalProducts}
        categorySlug="bridal-sets"
        categoryCount={categoryCount(categories, "bridal-sets")}
        onQuickView={setQuickViewProduct}
      />
      <ProductShowcase
        title={homepage.showcaseTitles["necklace-sets"] ?? "Necklace"}
        products={necklaceProducts}
        categorySlug="necklace-sets"
        categoryCount={categoryCount(categories, "necklace-sets")}
        onQuickView={setQuickViewProduct}
      />
      <ProductShowcase
        title={homepage.showcaseTitles.bracelet ?? "Bracelets"}
        products={braceletProducts}
        categorySlug="bracelet"
        categoryCount={categoryCount(categories, "bracelet")}
        onQuickView={setQuickViewProduct}
      />
      <ProductShowcase
        title={homepage.showcaseTitles["new-arrivals"] ?? "New Arrivals"}
        products={newArrivals}
        variant="alt"
        ctaHref="/shop?filter=new"
        ctaName="New Arrivals"
        ctaCount={newArrivalsCount}
        ctaImage={newArrivals[0]?.image}
        onQuickView={setQuickViewProduct}
      />
      <ProductShowcase
        title={homepage.showcaseTitles.earrings ?? "Earrings"}
        products={earringProducts}
        categorySlug="earrings"
        categoryCount={categoryCount(categories, "earrings")}
        onQuickView={setQuickViewProduct}
      />
      <ProductShowcase
        title={homepage.showcaseTitles["best-selling"] ?? "Best Selling Products"}
        products={bestSelling}
        ctaHref="/shop?filter=bestseller"
        ctaName="Best Selling"
        ctaCount={bestSellingCount}
        ctaImage={bestSelling[0]?.image}
        onQuickView={setQuickViewProduct}
      />

      <VideoSection video={video} />

      <CollectionsSection
        title={homepage.collectionsTitle}
        categories={categories}
      />

      <div id="reviews">
        <Testimonials
          testimonials={testimonials}
          badge={homepage.testimonials.badge}
          title={homepage.testimonials.title}
          backgroundImage={homepage.testimonials.backgroundImage}
        />
      </div>
      <BlogSection posts={blogPosts} />
      <FAQ
        faqs={faqs}
        title={homepage.faq.title}
        subtitle={homepage.faq.subtitle}
      />
      <TrustBar features={trustFeatures} />

      <QuickViewDialog
        product={quickViewProduct}
        open={!!quickViewProduct}
        onOpenChange={(open) => !open && setQuickViewProduct(null)}
      />
    </>
  );
}
