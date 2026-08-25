import { getAdminCategories } from "@/lib/admin/queries";
import ProductForm from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  const categories = await getAdminCategories();

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl">Add product</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
