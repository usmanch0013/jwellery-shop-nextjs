import Link from "next/link";
import Image from "next/image";
import { getAdminBlogPosts } from "@/lib/admin/queries";
import { buttonVariants } from "@/components/ui/button";
import { formatBlogDate } from "@/lib/blog/format";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AdminEmpty,
  AdminPageHeader,
  AdminTable,
  AdminTableElement,
  AdminTd,
  AdminTh,
  AdminThead,
  AdminTr,
} from "@/components/admin/AdminShell";
import type { DbBlogPost } from "@/lib/database.types";

export default async function AdminBlogsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const filter =
    status === "draft" || status === "published" ? status : undefined;
  const posts = (await getAdminBlogPosts(filter)) as DbBlogPost[];

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <AdminPageHeader
        title="Blog"
        description={`${posts.length} post${posts.length === 1 ? "" : "s"}`}
        actions={
          <Link href="/admin/blogs/new" className={cn(buttonVariants(), "gap-1.5")}>
            <Plus className="h-4 w-4" />
            Add post
          </Link>
        }
      />

      <div className="flex flex-wrap gap-2">
        {(
          [
            { href: "/admin/blogs", label: "All", value: undefined },
            {
              href: "/admin/blogs?status=published",
              label: "Published",
              value: "published" as const,
            },
            {
              href: "/admin/blogs?status=draft",
              label: "Drafts",
              value: "draft" as const,
            },
          ] as const
        ).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              buttonVariants({
                variant: filter === item.value ? "default" : "outline",
              }),
              "h-9"
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>

      {posts.length === 0 ? (
        <AdminEmpty
          title="No blog posts yet"
          description="Write your first post to share jewellery tips and styling guides."
        />
      ) : (
        <AdminTable>
          <AdminTableElement>
            <AdminThead>
              <tr>
                <AdminTh>Post</AdminTh>
                <AdminTh>Author</AdminTh>
                <AdminTh>Date</AdminTh>
                <AdminTh>Status</AdminTh>
              </tr>
            </AdminThead>
            <tbody>
              {posts.map((post) => (
                <AdminTr key={post.id}>
                  <AdminTd>
                    <div className="flex items-center gap-3">
                      {post.featured_image ? (
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                          <Image
                            src={post.featured_image}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="48px"
                            unoptimized
                          />
                        </div>
                      ) : null}
                      <div>
                        <Link
                          href={`/admin/blogs/${post.id}`}
                          className="font-medium hover:text-primary"
                        >
                          {post.title}
                        </Link>
                        <p className="text-xs text-muted-foreground">/blog/{post.slug}</p>
                      </div>
                    </div>
                  </AdminTd>
                  <AdminTd className="text-muted-foreground">
                    {post.author_name ?? "—"}
                  </AdminTd>
                  <AdminTd className="text-muted-foreground">
                    {formatBlogDate(post.published_at ?? post.created_at)}
                  </AdminTd>
                  <AdminTd>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-medium capitalize",
                        post.status === "published"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-100 text-slate-700"
                      )}
                    >
                      {post.status}
                    </span>
                  </AdminTd>
                </AdminTr>
              ))}
            </tbody>
          </AdminTableElement>
        </AdminTable>
      )}
    </div>
  );
}
