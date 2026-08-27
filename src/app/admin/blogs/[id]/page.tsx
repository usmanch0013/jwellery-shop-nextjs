import { notFound } from "next/navigation";
import { getAdminBlogPostDetails } from "@/lib/admin/queries";
import {
  getBlogCategoriesAction,
  getBlogTagsAction,
} from "@/actions/admin/blogs";
import BlogEditor from "@/components/admin/BlogEditor";
import { AdminPageHeader } from "@/components/admin/AdminShell";

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [post, categories, tags] = await Promise.all([
    getAdminBlogPostDetails(id),
    getBlogCategoriesAction(),
    getBlogTagsAction(),
  ]);

  if (!post) notFound();

  return (
    <div className="mx-auto max-w-[1400px] space-y-8">
      <AdminPageHeader
        title="Edit post"
        description={post.title}
        backHref="/admin/blogs"
      />
      <BlogEditor categories={categories} tags={tags} post={post} />
    </div>
  );
}
