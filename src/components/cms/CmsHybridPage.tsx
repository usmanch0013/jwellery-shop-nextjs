/**
 * Use on developer-coded pages so the client can still edit sections in the Builder.
 *
 * Example (src/app/warranty/page.tsx):
 *
 *   import CmsHybridPage from "@/components/cms/CmsHybridPage";
 *   export default function WarrantyPage() {
 *     return (
 *       <CmsHybridPage slug="warranty" breadcrumbLabel="Warranty">
 *         {/* optional custom coded block below CMS sections *\/}
 *       </CmsHybridPage>
 *     );
 *   }
 *
 * Register slug in src/lib/cms/page-registry.ts with source: "hybrid".
 * Client edits sections at /admin/cms/pages/warranty
 */

import Breadcrumbs from "@/components/Breadcrumbs";
import CmsPageSections from "@/components/cms/CmsPageSections";
import { getCmsPage } from "@/lib/cms/queries";
import { normalizePageSections } from "@/lib/cms/page-sections";

type CmsHybridPageProps = {
  slug: string;
  breadcrumbLabel: string;
  children?: React.ReactNode;
  /** Sections to show before custom coded children */
  showCmsFirst?: boolean;
};

export default async function CmsHybridPage({
  slug,
  breadcrumbLabel,
  children,
  showCmsFirst = true,
}: CmsHybridPageProps) {
  const page = await getCmsPage(slug);
  const sections = page ? normalizePageSections(page) : [];

  const cmsBlock =
    sections.length > 0 ? <CmsPageSections sections={sections} /> : null;

  return (
    <div className="min-h-[50vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Breadcrumbs items={[{ label: breadcrumbLabel }]} />
      </div>
      {showCmsFirst ? cmsBlock : children}
      {showCmsFirst ? children : cmsBlock}
    </div>
  );
}
