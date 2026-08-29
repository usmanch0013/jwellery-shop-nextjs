import { getAdminCmsNavLinks } from "@/lib/cms/queries";
import CmsNavManager from "@/components/admin/cms/CmsNavManager";
import { AdminPageHeader } from "@/components/admin/AdminShell";

export default async function CmsNavigationPage() {
  const [header, footerUseful, footerLegal] = await Promise.all([
    getAdminCmsNavLinks("header"),
    getAdminCmsNavLinks("footer_useful"),
    getAdminCmsNavLinks("footer_legal"),
  ]);

  return (
    <div className="mx-auto max-w-[800px] space-y-5">
      <AdminPageHeader
        title="Navigation"
        backHref="/admin/cms"
        description="Header & footer menus — drag, hide, add or remove links"
      />
      <CmsNavManager header={header} footerUseful={footerUseful} footerLegal={footerLegal} />
    </div>
  );
}
