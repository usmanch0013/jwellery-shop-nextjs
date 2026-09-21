import Breadcrumbs from "@/components/Breadcrumbs";
import CmsPageSections from "@/components/cms/CmsPageSections";
import LegalPageBody, { isLegalPageSlug } from "@/components/cms/LegalPageBody";
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
  const isLegal = isLegalPageSlug(slug);
  const useStructuredBody = isLegal || slug === "about";

  return (
    <div className="min-h-[50vh]">
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: breadcrumbLabel }]} />
      </div>

      {sections.length > 0 ? (
        <CmsPageSections sections={sections} />
      ) : page?.content ? (
        <>
          <div className="mx-auto max-w-3xl px-4 pb-2 sm:px-6 lg:px-8">
            {page.eyebrow ? (
              <p className="mb-3 text-xs uppercase tracking-[0.28em] text-primary">
                {page.eyebrow}
              </p>
            ) : null}
            <h1 className="font-serif text-3xl text-foreground sm:text-4xl lg:text-[2.5rem]">
              {page.title}
            </h1>
          </div>
          {useStructuredBody ? (
            <LegalPageBody content={page.content} />
          ) : (
            <div className="mx-auto max-w-3xl px-4 pb-16 sm:px-6 lg:px-8">
              <div className="mt-6 whitespace-pre-line text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
                {page.content}
              </div>
            </div>
          )}
        </>
      ) : (
        children
      )}
    </div>
  );
}
