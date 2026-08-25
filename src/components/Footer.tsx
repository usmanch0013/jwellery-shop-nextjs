import Link from "next/link";
import { categories } from "@/data/products";

const footerLinks = [
  { label: "Track Your Order", href: "/track-order" },
  { label: "How To Order?", href: "/shipping-policy" },
  { label: "Shipping Rates", href: "/shipping-policy" },
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
  { label: "FAQs", href: "/#faq" },
];

export default function Footer() {
  return (
    <footer className="bg-background border-t border-border mt-auto">
      <div className="max-w-[1400px] mx-auto px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <h3 className="text-lg font-semibold mb-4">Lumière.pk</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Pakistan&apos;s award winning artificial jewellery brand. Premium
              quality pieces for every occasion since 2009.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium uppercase tracking-wider mb-4">
              Useful Links
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-medium uppercase tracking-wider mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {categories.slice(0, 7).map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/categories/${cat.slug}`}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors uppercase"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-medium uppercase tracking-wider mb-4">
              Policies
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="text-sm text-muted-foreground hover:text-primary">
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/shipping-policy" className="text-sm text-muted-foreground hover:text-primary">
                  Shipping Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Lumière.pk. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <Link href="/terms" className="hover:text-primary">
              Terms
            </Link>
            <Link href="/refund-policy" className="hover:text-primary">
              Refunds
            </Link>
            <Link href="/privacy" className="hover:text-primary">
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
