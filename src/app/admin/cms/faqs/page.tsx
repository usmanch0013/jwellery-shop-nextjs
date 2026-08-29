import { getCmsFaqs } from "@/lib/cms/queries";
import CmsFaqsManager from "@/components/admin/cms/CmsFaqsManager";
import { AdminPageHeader } from "@/components/admin/AdminShell";

export default async function CmsFaqsPage() {
  const faqs = await getCmsFaqs();
  return (
    <div className="mx-auto max-w-[800px] space-y-5">
      <AdminPageHeader title="FAQs" backHref="/admin/cms" />
      <CmsFaqsManager faqs={faqs} />
    </div>
  );
}
