import Image from "next/image";
import Breadcrumbs from "@/components/Breadcrumbs";
import Newsletter from "@/components/Newsletter";

export default function AboutPage() {
  return (
    <div className="py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: "About" }]} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-20">
          <div>
            <p className="text-gold uppercase tracking-[0.3em] text-sm mb-4">
              Our Story
            </p>
            <h1 className="text-4xl lg:text-5xl font-serif font-semibold mb-6">
              Crafting Timeless Beauty Since 1954
            </h1>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Lumière was founded with a singular vision: to create jewelry that
              transcends trends and becomes treasured heirlooms. For over seven
              decades, our master artisans have combined traditional techniques
              with contemporary design.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Every piece in our collection is ethically sourced, meticulously
              crafted, and backed by our lifetime craftsmanship warranty.
            </p>
          </div>
          <div className="relative aspect-[4/5] rounded-lg overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&h=1000&fit=crop"
              alt="Jewelry craftsmanship"
              fill
              className="object-cover"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {[
            {
              title: "Ethical Sourcing",
              desc: "All our diamonds are conflict-free and our metals are responsibly mined.",
            },
            {
              title: "Master Craftsmanship",
              desc: "Each piece is handcrafted by artisans with decades of experience.",
            },
            {
              title: "Lifetime Warranty",
              desc: "We stand behind every piece with our comprehensive craftsmanship guarantee.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="p-8 border border-border rounded-lg text-center"
            >
              <h3 className="font-serif text-xl mb-3">{item.title}</h3>
              <p className="text-muted-foreground text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
      <Newsletter />
    </div>
  );
}
