import Breadcrumbs from "@/components/Breadcrumbs";
import CmsPageSections from "@/components/cms/CmsPageSections";
import { getCmsPage } from "@/lib/cms/queries";
import { normalizePageSections } from "@/lib/cms/page-sections";

type CmsPageViewProps = {
  slug: string;
  breadcrumbLabel: string;
  fallbackSections?: boolean;
  children?: React.ReactNode;
};

export default async function CmsPageView({
  slug,
  breadcrumbLabel,
  children,
}: CmsPageViewProps) {
  const page = await getCmsPage(slug);
  const sections = page ? normalizePageSections(page) : [];

  return (
    <div className="min-h-[50vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Breadcrumbs items={[{ label: breadcrumbLabel }]} />
      </div>
      {sections.length > 0 ? (
        <CmsPageSections sections={sections} />
      ) : (
        children
      )}
    </div>
  );
}
