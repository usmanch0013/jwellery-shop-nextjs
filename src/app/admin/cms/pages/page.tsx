import Link from "next/link";
import { FileText } from "lucide-react";
import { getAdminSitePagesList } from "@/lib/cms/queries";
import CmsPagesListClient from "@/components/admin/cms/CmsPagesListClient";

export default async function CmsPagesListPage() {
  const pages = await getAdminSitePagesList();

  return (
    <div className="mx-auto max-w-[1100px] space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#008060]" />
            <h1 className="text-xl font-semibold text-[#202223]">Pages</h1>
          </div>
          <p className="mt-1 max-w-xl text-[13px] text-[var(--admin-text-subdued)]">
            All website pages in one place. Developer-coded pages stay in code;
            your client can still edit content with the Builder where enabled.
          </p>
        </div>
        <Link
          href="/admin/cms"
          className="text-[13px] text-[#2271b1] hover:underline"
        >
          ← Back to CMS
        </Link>
      </div>

      <div className="admin-card border-[#b7ece0] bg-[#f0fdf8] p-4 text-[13px] text-[#006e52]">
        <p className="font-semibold text-[#004c3f]">How it works</p>
        <ul className="mt-2 list-inside list-disc space-y-1">
          <li>
            <strong>Builder</strong> — full page from drag & drop (client-friendly)
          </li>
          <li>
            <strong>Hybrid</strong> — you code the layout; client adds/edits sections in Builder
          </li>
          <li>
            <strong>Homepage CMS</strong> — homepage hero & sections (not the page builder)
          </li>
          <li>
            <strong>System</strong> — shop/blog etc. managed in their own admin areas
          </li>
        </ul>
      </div>

      <CmsPagesListClient pages={pages} />
    </div>
  );
}
