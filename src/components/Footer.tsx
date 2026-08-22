import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { categories } from "@/data/products";
import { Separator } from "@/components/ui/separator";

export default function Footer() {
  return (
    <footer className="bg-charcoal text-cream mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <h3 className="text-2xl font-serif font-semibold mb-4">Lumière</h3>
            <p className="text-cream/70 text-sm leading-relaxed mb-6">
              Handcrafted fine jewelry for life&apos;s most precious moments.
              Ethically sourced materials, timeless designs since 1954.
            </p>
            <div className="space-y-3 text-sm text-cream/70">
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gold flex-shrink-0" />
                123 Fifth Avenue, New York, NY
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gold flex-shrink-0" />
                +1 (800) 555-LUME
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gold flex-shrink-0" />
                hello@lumiere.com
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-sm uppercase tracking-widest text-gold mb-4">
              Shop
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/shop"
                  className="text-cream/70 hover:text-gold text-sm transition-colors"
                >
                  All Products
                </Link>
              </li>
              {categories.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/categories/${cat.slug}`}
                    className="text-cream/70 hover:text-gold text-sm transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm uppercase tracking-widest text-gold mb-4">
              Customer Care
            </h4>
            <ul className="space-y-3">
              {[
                { label: "Contact Us", href: "/contact" },
                { label: "Shipping & Returns", href: "#" },
                { label: "Size Guide", href: "#" },
                { label: "Care Guide", href: "#" },
                { label: "FAQ", href: "#" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-cream/70 hover:text-gold text-sm transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm uppercase tracking-widest text-gold mb-4">
              About
            </h4>
            <ul className="space-y-3">
              {[
                { label: "Our Story", href: "/about" },
                { label: "Craftsmanship", href: "/about" },
                { label: "Sustainability", href: "/about" },
                { label: "Careers", href: "#" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-cream/70 hover:text-gold text-sm transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-10 bg-cream/10" />

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-cream/50 text-sm">
            © {new Date().getFullYear()} Lumière Jewelry. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-cream/50">
            <a href="#" className="hover:text-gold transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-gold transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
