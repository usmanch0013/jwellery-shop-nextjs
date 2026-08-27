import {
  getBlogCategoriesAction,
  getBlogTagsAction,
} from "@/actions/admin/blogs";
import BlogEditor from "@/components/admin/BlogEditor";
import { AdminPageHeader } from "@/components/admin/AdminShell";

export default async function NewBlogPostPage() {
  const [categories, tags] = await Promise.all([
    getBlogCategoriesAction(),
    getBlogTagsAction(),
  ]);

  return (
    <div className="mx-auto max-w-[1400px] space-y-8">
      <AdminPageHeader
        title="Add new post"
        description="Create a blog post for your store"
        backHref="/admin/blogs"
      />
      <BlogEditor categories={categories} tags={tags} />
    </div>
  );
}
