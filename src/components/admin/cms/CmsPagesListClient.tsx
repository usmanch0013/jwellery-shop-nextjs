"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Code2,
  ExternalLink,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Settings,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AdminSitePageRow } from "@/lib/cms/queries";
import {
  sourceBadgeClass,
  sourceLabel,
} from "@/lib/cms/page-registry";
import {
  CmsPageDeleteDialog,
  CmsPageFormModal,
} from "@/components/admin/cms/CmsPageFormModal";
import type { CmsPage } from "@/lib/cms/types";

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-PK", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export default function CmsPagesListClient({ pages }: { pages: AdminSitePageRow[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editPage, setEditPage] = useState<CmsPage | null>(null);
  const [deleteSlug, setDeleteSlug] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return pages;
    return pages.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        p.path.toLowerCase().includes(q)
    );
  }, [pages, query]);

  const deletePageRow = deleteSlug
    ? pages.find((p) => p.slug === deleteSlug)
    : null;

  const deletePageAsCms: CmsPage | null = deletePageRow
    ? {
        slug: deletePageRow.slug,
        title: deletePageRow.title,
        eyebrow: null,
        content: "",
        seo_title: null,
        seo_description: null,
        hero_image: null,
        blocks: [],
      }
    : null;

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-text-subdued)]" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search pages..."
              className="h-9 pl-9 text-[13px]"
            />
          </div>
          <Button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="gap-1.5 bg-[#2271b1] hover:bg-[#135e96]"
          >
            <Plus className="h-4 w-4" />
            Add New Page
          </Button>
        </div>

        <div className="admin-card overflow-hidden">
          <table className="w-full text-left text-[13px]">
            <thead className="border-b border-[var(--admin-border)] bg-[#f6f6f7]">
              <tr>
                <th className="px-4 py-2.5 font-semibold">Title</th>
                <th className="hidden px-4 py-2.5 font-semibold sm:table-cell">URL</th>
                <th className="hidden px-4 py-2.5 font-semibold md:table-cell">Type</th>
                <th className="hidden px-4 py-2.5 font-semibold lg:table-cell">Updated</th>
                <th className="px-4 py-2.5 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--admin-border)]">
              {filtered.map((page) => (
                <tr key={page.slug} className="hover:bg-[#fafbfb]">
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      {page.editHref ? (
                        <Link
                          href={page.editHref}
                          className="font-medium text-[#2271b1] hover:underline"
                        >
                          {page.title}
                        </Link>
                      ) : (
                        <span className="font-medium">{page.title}</span>
                      )}
                      {page.description && (
                        <span className="text-[11px] text-[var(--admin-text-subdued)] line-clamp-1">
                          {page.description}
                        </span>
                      )}
                      <span className="text-[11px] text-[var(--admin-text-subdued)] sm:hidden">
                        {page.path}
                      </span>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-[var(--admin-text-subdued)] sm:table-cell">
                    {page.path}
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${sourceBadgeClass(page.source)}`}
                    >
                      {sourceLabel(page.source)}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 text-[var(--admin-text-subdued)] lg:table-cell">
                    {formatDate(page.updated_at)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={page.path}
                        target="_blank"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--admin-text-subdued)] hover:bg-[#f1f2f3]"
                        title="View live"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>

                      {page.source === "coded" && (
                        <span
                          className="inline-flex h-8 w-8 items-center justify-center text-[var(--admin-text-subdued)]"
                          title="Developer-coded page"
                        >
                          <Code2 className="h-3.5 w-3.5" />
                        </span>
                      )}

                      {page.canUseBuilder && page.editHref?.includes("/pages/") && (
                        <>
                          <button
                            type="button"
                            onClick={async () => {
                              const { getCmsPageForEditAction } = await import(
                                "@/actions/admin/cms"
                              );
                              const res = await getCmsPageForEditAction(page.slug);
                              if (res.page) setEditPage(res.page);
                            }}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--admin-text-subdued)] hover:bg-[#f1f2f3]"
                            title="Page settings"
                          >
                            <Settings className="h-3.5 w-3.5" />
                          </button>
                          <Link
                            href={`/admin/cms/pages/${page.slug}`}
                            className="inline-flex items-center gap-1.5 rounded-md bg-[#2271b1] px-3 py-1.5 text-[12px] font-medium text-white hover:bg-[#135e96]"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Builder
                          </Link>
                        </>
                      )}

                      {page.source === "homepage" && page.editHref && (
                        <Link
                          href={page.editHref}
                          className="inline-flex items-center gap-1.5 rounded-md bg-[#6d28d9] px-3 py-1.5 text-[12px] font-medium text-white hover:bg-[#5b21b6]"
                        >
                          Edit Homepage
                        </Link>
                      )}

                      {page.source === "system" && page.editHref && (
                        <Link
                          href={page.editHref}
                          className="inline-flex items-center gap-1.5 rounded-md border border-[var(--admin-border)] px-3 py-1.5 text-[12px] hover:bg-[#fafbfb]"
                        >
                          Manage
                        </Link>
                      )}

                      {page.canDelete && (
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() =>
                              setMenuOpen(menuOpen === page.slug ? null : page.slug)
                            }
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-[#f1f2f3]"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                          {menuOpen === page.slug && (
                            <>
                              <div
                                className="fixed inset-0 z-10"
                                onClick={() => setMenuOpen(null)}
                              />
                              <div className="absolute right-0 top-full z-20 mt-1 w-40 rounded-lg border bg-white py-1 shadow-lg">
                                <button
                                  type="button"
                                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] text-red-600 hover:bg-red-50"
                                  onClick={() => {
                                    setMenuOpen(null);
                                    setDeleteSlug(page.slug);
                                  }}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  Delete
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-[var(--admin-text-subdued)]">
              No pages match your search.
            </p>
          )}
        </div>
      </div>

      <CmsPageFormModal open={createOpen} onOpenChange={setCreateOpen} mode="create" />
      <CmsPageFormModal
        open={!!editPage}
        onOpenChange={(open) => !open && setEditPage(null)}
        mode="edit"
        page={editPage ?? undefined}
      />
      <CmsPageDeleteDialog
        open={!!deleteSlug}
        onOpenChange={(open) => !open && setDeleteSlug(null)}
        page={deletePageAsCms}
        onDeleted={() => router.refresh()}
      />
    </>
  );
}
