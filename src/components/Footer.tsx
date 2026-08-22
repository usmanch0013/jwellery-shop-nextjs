import Link from "next/link";
import { categories } from "@/data/products";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-[#eee] mt-auto">
      <div className="max-w-[1400px] mx-auto px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <h3 className="text-lg font-semibold mb-4">Lumière.pk</h3>
            <p className="text-sm text-[#666] leading-relaxed">
              Pakistan&apos;s award winning artificial jewellery brand. Premium
              quality pieces for every occasion since 2009.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium uppercase tracking-wider mb-4">
              Useful Links
            </h4>
            <ul className="space-y-2.5">
              {[
                "Track Your Order",
                "How To Order?",
                "Shipping Rates",
                "About Us",
                "Contact Us",
                "FAQs",
              ].map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="text-sm text-[#666] hover:text-black transition-colors"
                  >
                    {item}
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
                    className="text-sm text-[#666] hover:text-black transition-colors uppercase"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-medium uppercase tracking-wider mb-4">
              Social Media
            </h4>
            <ul className="space-y-2.5">
              {[
                "Instagram",
                "Facebook",
                "YouTube",
                "TikTok",
                "Pinterest",
              ].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-sm text-[#666] hover:text-black transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-[#eee] mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-[#999]">
            © {new Date().getFullYear()} Lumière.pk. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-[#999]">
            <Link href="#" className="hover:text-black">
              Terms of Service
            </Link>
            <Link href="#" className="hover:text-black">
              Refund Policy
            </Link>
            <Link href="#" className="hover:text-black">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
