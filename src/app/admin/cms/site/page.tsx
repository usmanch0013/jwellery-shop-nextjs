import { getCmsSiteSettings } from "@/lib/cms/queries";
import CmsSiteForm from "@/components/admin/cms/CmsSiteForm";
import { AdminPageHeader } from "@/components/admin/AdminShell";

export default async function CmsSitePage() {
  const site = await getCmsSiteSettings();
  return (
    <div className="mx-auto max-w-[800px] space-y-5">
      <AdminPageHeader title="Site settings" backHref="/admin/cms" description="Global brand, contact & SEO" />
      <CmsSiteForm initial={site} />
    </div>
  );
}
