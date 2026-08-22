import Link from "next/link";
import CategoryCard from "@/components/CategoryCard";
import ProductGrid from "@/components/ProductGrid";
import HeroSlider from "@/components/HeroSlider";
import TrustBar from "@/components/TrustBar";
import Testimonials from "@/components/Testimonials";
import Newsletter from "@/components/Newsletter";
import { products } from "@/data/products";

const categoryImages = {
  rings: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&h=800&fit=crop",
  necklaces:
    "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=800&fit=crop",
  earrings:
    "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&h=800&fit=crop",
  bracelets:
    "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=600&h=800&fit=crop",
};

export default function Home() {
  const featuredProducts = products
    .filter((p) => p.isBestseller || p.isNew)
    .slice(0, 8);

  return (
    <>
      <HeroSlider />
      <TrustBar />

      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-gold uppercase tracking-[0.3em] text-sm mb-2">
              Collections
            </p>
            <h2 className="text-3xl lg:text-4xl font-serif font-semibold">
              Shop by Category
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <CategoryCard
              slug="rings"
              name="Rings"
              description="Timeless bands & statement rings"
              image={categoryImages.rings}
            />
            <CategoryCard
              slug="necklaces"
              name="Necklaces"
              description="Elegant chains & pendants"
              image={categoryImages.necklaces}
            />
            <CategoryCard
              slug="earrings"
              name="Earrings"
              description="Studs, hoops & drops"
              image={categoryImages.earrings}
            />
            <CategoryCard
              slug="bracelets"
              name="Bracelets"
              description="Delicate cuffs & bangles"
              image={categoryImages.bracelets}
            />
          </div>
        </div>
      </section>

      <ProductGrid
        products={featuredProducts}
        subtitle="Curated for You"
        title="Featured Pieces"
      />

      <section className="py-16 lg:py-24 bg-charcoal text-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-gold uppercase tracking-[0.3em] text-sm mb-4">
                Our Heritage
              </p>
              <h2 className="text-3xl lg:text-4xl font-serif font-semibold mb-6">
                70+ Years of Golden Craftsmanship
              </h2>
              <p className="text-cream/70 leading-relaxed mb-8">
                Since 1954, Lumière has been creating exceptional jewelry that
                celebrates life&apos;s most meaningful moments. Each piece is
                handcrafted by master artisans using ethically sourced
                materials.
              </p>
              <Link
                href="/about"
                className="inline-flex items-center justify-center bg-gold hover:bg-gold-dark text-white h-9 px-4 rounded-lg text-sm font-medium uppercase tracking-widest"
              >
                Discover Our Story
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { number: "70+", label: "Years of Excellence" },
                { number: "50K+", label: "Happy Customers" },
                { number: "100%", label: "Ethically Sourced" },
                { number: "24/7", label: "Expert Support" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="p-6 border border-cream/10 text-center"
                >
                  <p className="text-3xl font-serif text-gold mb-1">
                    {stat.number}
                  </p>
                  <p className="text-cream/60 text-sm">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Testimonials />
      <Newsletter />
    </>
  );
}
