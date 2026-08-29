import { getCmsTestimonials } from "@/lib/cms/queries";
import CmsTestimonialsManager from "@/components/admin/cms/CmsTestimonialsManager";
import { AdminPageHeader } from "@/components/admin/AdminShell";

export default async function CmsTestimonialsPage() {
  const testimonials = await getCmsTestimonials();
  return (
    <div className="mx-auto max-w-[800px] space-y-5">
      <AdminPageHeader title="Testimonials" backHref="/admin/cms" />
      <CmsTestimonialsManager testimonials={testimonials} />
    </div>
  );
}
