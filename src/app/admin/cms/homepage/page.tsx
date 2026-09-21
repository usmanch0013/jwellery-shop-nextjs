import {
  getCmsHero,
  getCmsHomepageSections,
  getCmsTrustFeatures,
  getCmsVideo,
  getCmsPromoPopup,
} from "@/lib/cms/queries";
import CmsHomepageForm from "@/components/admin/cms/CmsHomepageForm";
import { AdminPageHeader } from "@/components/admin/AdminShell";

export default async function CmsHomepagePage() {
  const [hero, sections, video, trustFeatures, promoPopup] = await Promise.all([
    getCmsHero(),
    getCmsHomepageSections(),
    getCmsVideo(),
    getCmsTrustFeatures(),
    getCmsPromoPopup(),
  ]);

  return (
    <div className="mx-auto max-w-[900px] space-y-5">
      <AdminPageHeader title="Homepage" backHref="/admin/cms" description="Hero, showcases, video, trust bar & more" />
      <CmsHomepageForm
        hero={hero}
        sections={sections}
        video={video}
        trustFeatures={trustFeatures}
        promoPopup={promoPopup}
      />
    </div>
  );
}
