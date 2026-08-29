import Link from "next/link";
import { FileText, Globe, Layout, Megaphone } from "lucide-react";

const CMS_LINKS = [
  {
    href: "/admin/cms/pages",
    label: "Pages",
    description: "About, policies, custom pages",
    icon: FileText,
  },
  {
    href: "/admin/cms/homepage",
    label: "Homepage",
    description: "Hero, video, collections",
    icon: Layout,
  },
  {
    href: "/admin/cms/site",
    label: "Site settings",
    description: "Brand, contact, SEO",
    icon: Globe,
  },
  {
    href: "/admin/cms/navigation",
    label: "Navigation",
    description: "Header & footer menus",
    icon: Megaphone,
  },
];

export default function DashboardCmsPanel() {
  return (
    <div className="admin-card p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">Website content</h3>
          <p className="mt-0.5 text-[12px] text-[var(--admin-text-subdued)]">
            Manage storefront pages — client-friendly builder included
          </p>
        </div>
        <Link
          href="/admin/cms"
          className="text-[12px] font-medium text-[#008060] hover:underline shrink-0"
        >
          CMS hub →
        </Link>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {CMS_LINKS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-start gap-3 rounded-lg border border-[var(--admin-border)] p-3 transition-colors hover:border-[#008060]/40 hover:bg-[#f0fdf8]"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f0fdf8]">
              <item.icon className="h-4 w-4 text-[#008060]" />
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-medium">{item.label}</p>
              <p className="text-[11px] text-[var(--admin-text-subdued)]">
                {item.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
