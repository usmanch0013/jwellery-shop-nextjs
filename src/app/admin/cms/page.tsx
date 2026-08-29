import Link from "next/link";
import {
  FileText,
  Globe,
  HelpCircle,
  Home,
  Layout,
  MessageSquareQuote,
  Navigation,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminShell";

const CMS_MODULES = [
  {
    href: "/admin/cms/site",
    title: "Site settings",
    description: "Brand name, contact info, SEO, top bar & marquee",
    icon: Globe,
  },
  {
    href: "/admin/cms/homepage",
    title: "Homepage",
    description: "Hero, sections, video, trust bar, FAQ headings",
    icon: Home,
  },
  {
    href: "/admin/cms/pages",
    title: "Pages",
    description: "WordPress-style page list + Elementor visual editor",
    icon: FileText,
    featured: true,
  },
  {
    href: "/admin/cms/testimonials",
    title: "Testimonials",
    description: "Customer reviews shown on homepage",
    icon: MessageSquareQuote,
  },
  {
    href: "/admin/cms/faqs",
    title: "FAQs",
    description: "Frequently asked questions",
    icon: HelpCircle,
  },
  {
    href: "/admin/cms/navigation",
    title: "Navigation",
    description: "Header menu & footer links",
    icon: Navigation,
  },
];

export default function CmsHubPage() {
  return (
    <div className="mx-auto max-w-[1000px] space-y-5">
      <AdminPageHeader
        title="Website CMS"
        description="Manage all storefront content — headings, text, images & links"
      />

      <div className="admin-card flex items-start gap-3 border-[#b7ece0] bg-[#f0fdf8] p-4">
        <Layout className="mt-0.5 h-5 w-5 text-[#008060]" />
        <div>
          <p className="text-sm font-semibold text-[#004c3f]">Content management system</p>
          <p className="mt-1 text-[13px] text-[#006e52]">
            Edit pages, homepage, navigation and site settings from here. For new
            installs run migrations <code className="text-xs">009_cms.sql</code>,{" "}
            <code className="text-xs">010_security_hardening.sql</code>, and{" "}
            <code className="text-xs">011_security_fixes.sql</code> in Supabase.
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {CMS_MODULES.map((mod) => (
          <Link
            key={mod.href}
            href={mod.href}
            className={`admin-card flex items-start gap-3 p-4 transition-colors hover:bg-[#fafbfb] ${
              "featured" in mod && mod.featured
                ? "border-[#2271b1] ring-1 ring-[#2271b1]/20"
                : ""
            }`}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--admin-bg)]">
              <mod.icon className="h-4 w-4 text-[#008060]" />
            </div>
            <div>
              <p className="text-sm font-semibold">{mod.title}</p>
              <p className="mt-0.5 text-[12px] text-[var(--admin-text-subdued)]">
                {mod.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
