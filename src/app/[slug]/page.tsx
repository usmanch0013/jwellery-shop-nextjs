import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CmsPageSections from "@/components/cms/CmsPageSections";
import ContactPageClient from "@/components/contact/ContactPageClient";
import CmsPageView from "@/components/cms/CmsPageView";
import { getCmsPage, getCmsPages, getCmsSiteSettings } from "@/lib/cms/queries";
import { normalizePageSections } from "@/lib/cms/page-sections";
import { RESERVED_PAGE_SLUGS } from "@/lib/cms/page-utils";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const pages = await getCmsPages();
  return pages
    .filter((p) => !RESERVED_PAGE_SLUGS.has(p.slug))
    .map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await getCmsPage(slug);
  if (!page) return { title: "Page not found" };
  return {
    title: page.seo_title ?? `${page.title} | Lumière Jewellery`,
    description: page.seo_description ?? undefined,
  };
}

export default async function DynamicCmsSlugPage({ params }: Props) {
  const { slug } = await params;

  if (RESERVED_PAGE_SLUGS.has(slug)) notFound();

  const page = await getCmsPage(slug);
  if (!page) notFound();

  if (slug === "contact") {
    const site = await getCmsSiteSettings();
    const sections = normalizePageSections(page);
    const hero = sections.find((s) => s.type === "hero");
    const heroSettings = hero?.settings as { title?: string; eyebrow?: string };

    return (
      <>
        {sections.filter((s) => s.type !== "hero").length > 0 && (
          <CmsPageSections sections={sections.filter((s) => s.type !== "hero")} />
        )}
        <ContactPageClient
          pageTitle={heroSettings?.title ?? page.title}
          eyebrow={heroSettings?.eyebrow ?? page.eyebrow ?? "Get in Touch"}
          site={site}
        />
      </>
    );
  }

  return <CmsPageView slug={slug} breadcrumbLabel={page.title} />;
}
