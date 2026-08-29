import { notFound } from "next/navigation";
import { getCmsPage } from "@/lib/cms/queries";
import { DEFAULT_CMS_PAGES } from "@/lib/cms/defaults";
import CmsPageBuilder from "@/components/admin/cms/CmsPageBuilder";
import type { CmsPage } from "@/lib/cms/types";

export default async function CmsPageEditPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let page = await getCmsPage(slug);

  if (!page) {
    const fallback = DEFAULT_CMS_PAGES.find((p) => p.slug === slug);
    if (!fallback) notFound();
    page = { ...fallback, blocks: [...fallback.blocks] } as CmsPage;
  }

  return <CmsPageBuilder key={page.slug} page={page} />;
}
