import { getAdminCategories } from "@/lib/admin/queries";
import CategoryManagerClient from "@/components/admin/CategoryManagerClient";
import type { DbCategory } from "@/lib/database.types";

export default async function AdminCategoriesPage() {
  const categories = (await getAdminCategories()) as DbCategory[];

  return (
    <div className="mx-auto max-w-[1200px]">
      <CategoryManagerClient initialCategories={categories} />
    </div>
  );
}
