import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getCmsPage } from "@/lib/cms/queries";

type CmsStaticPageProps = {
  slug: string;
  breadcrumbLabel: string;
  fallbackTitle: string;
  fallbackContent: string;
  children?: React.ReactNode;
};

export async function generateCmsPageMetadata(
  slug: string,
  fallbackTitle: string,
  fallbackDescription?: string
): Promise<Metadata> {
  const page = await getCmsPage(slug);
  return {
    title: page?.seo_title ?? fallbackTitle,
    description: page?.seo_description ?? fallbackDescription,
  };
}

export default async function CmsStaticPage({
  slug,
  breadcrumbLabel,
  fallbackTitle,
  fallbackContent,
  children,
}: CmsStaticPageProps) {
  const page = await getCmsPage(slug);

  return (
    <div className="py-12 lg:py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: breadcrumbLabel }]} />

        {page?.eyebrow && (
          <p className="text-gold uppercase tracking-[0.3em] text-sm mb-4">
            {page.eyebrow}
          </p>
        )}

        <h1 className="font-serif text-3xl lg:text-4xl mb-6">
          {page?.title ?? fallbackTitle}
        </h1>

        <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
          {page?.content ?? fallbackContent}
        </div>

        {children}
      </div>
    </div>
  );
}
