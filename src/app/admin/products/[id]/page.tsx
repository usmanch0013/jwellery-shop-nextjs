import { notFound } from "next/navigation";
import { getAdminCategories, getAdminProduct } from "@/lib/admin/queries";
import ProductForm from "@/components/admin/ProductForm";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getAdminProduct(id),
    getAdminCategories(),
  ]);

  if (!product) notFound();

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl">Edit product</h1>
      <ProductForm categories={categories} product={product} />
    </div>
  );
}
