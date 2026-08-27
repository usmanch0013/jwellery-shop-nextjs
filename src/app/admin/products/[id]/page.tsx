import { notFound } from "next/navigation";
import {
  getAdminCategories,
  getAdminProductDetails,
} from "@/lib/admin/queries";
import { getProductTagsAction } from "@/actions/admin/tags";
import ProductEditor from "@/components/admin/ProductEditor";
import { AdminPageHeader } from "@/components/admin/AdminShell";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories, tags] = await Promise.all([
    getAdminProductDetails(id),
    getAdminCategories(),
    getProductTagsAction(),
  ]);

  if (!product) notFound();

  return (
    <div className="mx-auto max-w-[1400px] space-y-8">
      <AdminPageHeader
        title="Edit product"
        description={product.name}
        backHref="/admin/products"
      />
      <ProductEditor
        categories={categories}
        tags={tags}
        product={product}
      />
    </div>
  );
}
