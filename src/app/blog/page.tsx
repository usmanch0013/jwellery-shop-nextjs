import Link from "next/link";
import Image from "next/image";
import { getPublishedBlogPosts } from "@/lib/blog/queries";
import { formatBlogDate } from "@/lib/blog/format";
import { ArrowRight } from "lucide-react";

export const metadata = {
  title: "Blog | Lumière Jewellery",
  description: "Jewellery care tips, styling guides, and fashion inspiration.",
};

export default async function BlogIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const { posts, total, limit } = await getPublishedBlogPosts(page, 9);
  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-12 lg:py-16">
      <div className="mb-10 text-center">
        <h1 className="font-serif text-3xl lg:text-4xl">Blog</h1>
        <p className="mt-3 text-muted-foreground">
          Jewellery care, styling tips, and inspiration from Lumière
        </p>
      </div>

      {posts.length === 0 ? (
        <p className="text-center text-muted-foreground">No posts published yet.</p>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="group">
              <div className="relative mb-4 aspect-[3/2] overflow-hidden bg-muted">
                {post.featured_image ? (
                  <Image
                    src={post.featured_image}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    unoptimized
                  />
                ) : null}
              </div>
              <p className="text-xs text-muted-foreground">
                {formatBlogDate(post.published_at)}
              </p>
              <h2 className="mt-1 text-lg font-medium leading-snug group-hover:underline">
                {post.title}
              </h2>
              <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                {post.excerpt}
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm text-primary">
                Read more <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-12 flex justify-center gap-3">
          {page > 1 && (
            <Link
              href={`/blog?page=${page - 1}`}
              className="rounded-full border px-4 py-2 text-sm hover:bg-muted"
            >
              Previous
            </Link>
          )}
          <span className="self-center text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`/blog?page=${page + 1}`}
              className="rounded-full border px-4 py-2 text-sm hover:bg-muted"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
