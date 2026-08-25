import { getAdminCategories } from "@/lib/admin/queries";
import { updateCategoryAction } from "@/actions/admin/categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function AdminCategoriesPage() {
  const categories = await getAdminCategories();

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl">Categories</h1>
      <div className="space-y-4">
        {categories.map((cat) => (
          <form
            key={cat.id}
            action={updateCategoryAction.bind(null, cat.id)}
            className="border border-border rounded-lg p-4 bg-background grid md:grid-cols-4 gap-3 items-end"
          >
            <div>
              <Label>Name</Label>
              <Input name="name" defaultValue={cat.name} />
            </div>
            <div>
              <Label>Slug</Label>
              <Input name="slug" defaultValue={cat.slug} />
            </div>
            <div>
              <Label>Image URL</Label>
              <Input name="image" defaultValue={cat.image ?? ""} />
            </div>
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <Label>Description</Label>
                <Input name="description" defaultValue={cat.description ?? ""} />
              </div>
              <Button type="submit" size="sm">
                Save
              </Button>
            </div>
            <p className="md:col-span-4 text-xs text-muted-foreground">
              {cat.product_count} products
            </p>
          </form>
        ))}
      </div>
    </div>
  );
}
