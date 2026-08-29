import {
  getCmsHero,
  getCmsHomepageSections,
  getCmsTrustFeatures,
  getCmsVideo,
} from "@/lib/cms/queries";
import CmsHomepageForm from "@/components/admin/cms/CmsHomepageForm";
import { AdminPageHeader } from "@/components/admin/AdminShell";

export default async function CmsHomepagePage() {
  const [hero, sections, video, trustFeatures] = await Promise.all([
    getCmsHero(),
    getCmsHomepageSections(),
    getCmsVideo(),
    getCmsTrustFeatures(),
  ]);

  return (
    <div className="mx-auto max-w-[900px] space-y-5">
      <AdminPageHeader title="Homepage" backHref="/admin/cms" description="Hero, showcases, video, trust bar & more" />
      <CmsHomepageForm hero={hero} sections={sections} video={video} trustFeatures={trustFeatures} />
    </div>
  );
}
