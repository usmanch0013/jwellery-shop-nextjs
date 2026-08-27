import { getAdminCategories } from "@/lib/admin/queries";
import { getProductTagsAction } from "@/actions/admin/tags";
import ProductEditor from "@/components/admin/ProductEditor";
import { AdminPageHeader } from "@/components/admin/AdminShell";

export default async function NewProductPage() {
  const [categories, tags] = await Promise.all([
    getAdminCategories(),
    getProductTagsAction(),
  ]);

  return (
    <div className="mx-auto max-w-[1400px] space-y-8">
      <AdminPageHeader
        title="Add product"
        description="Create a new product with categories, tags, gallery and variations"
        backHref="/admin/products"
      />
      <ProductEditor categories={categories} tags={tags} />
    </div>
  );
}
