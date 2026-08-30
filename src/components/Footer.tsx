import Link from "next/link";
import type { CategoryInfo } from "@/types";
import type { CmsNavLink, CmsSiteSettings } from "@/lib/cms/types";

const defaultFooterLinks = [
  { label: "Track Your Order", href: "/track-order" },
  { label: "How To Order?", href: "/shipping-policy" },
  { label: "Shipping Rates", href: "/shipping-policy" },
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
  { label: "FAQs", href: "/#faq" },
];

export default function Footer({
  categories,
  site,
  usefulLinks,
  legalLinks,
}: {
  categories: CategoryInfo[];
  site?: CmsSiteSettings;
  usefulLinks?: CmsNavLink[];
  legalLinks?: CmsNavLink[];
}) {
  const brandName = site?.brandName ?? "Lumière.pk";
  const brandDescription =
    site?.footerDescription ??
    "Pakistan's award winning artificial jewellery brand. Premium quality pieces for every occasion since 2009.";
  const footerLinks =
    usefulLinks?.map((l) => ({ label: l.label, href: l.href })) ?? defaultFooterLinks;
  return (
    <footer className="mt-auto border-t border-border bg-white">
      <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <h3 className="text-lg font-semibold mb-4">{brandName}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {brandDescription}
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
            {categories
              .filter((cat) => cat.productCount > 0)
              .slice(0, 7)
              .map((cat) => (
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
              {(legalLinks?.length
                ? legalLinks.map((l) => ({ label: l.label, href: l.href }))
                : [
                    { label: "Terms of Service", href: "/terms" },
                    { label: "Refund Policy", href: "/refund-policy" },
                    { label: "Privacy Policy", href: "/privacy" },
                    { label: "Shipping Policy", href: "/shipping-policy" },
                  ]
              ).map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-sm text-muted-foreground hover:text-primary">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {brandName}. All rights reserved.
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
