import { getAdminReviews } from "@/lib/admin/queries";
import {
  setReviewApprovalFormAction,
  deleteReviewFormAction,
} from "@/actions/admin/reviews";
import { Button } from "@/components/ui/button";
import { AdminCard, AdminEmpty, AdminPageHeader } from "@/components/admin/AdminShell";
import { Star } from "lucide-react";

export default async function AdminReviewsPage() {
  const reviews = await getAdminReviews();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Reviews"
        description={`${reviews.length} customer reviews`}
      />

      {reviews.length === 0 ? (
        <AdminEmpty
          title="No reviews yet"
          description="Product reviews will appear here for moderation."
        />
      ) : (
        <div className="grid gap-4">
          {reviews.map((r) => (
            <AdminCard key={r.id} padding>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">
                      {r.products?.name ?? "Product"}
                    </p>
                    <div className="flex items-center gap-0.5 text-amber-600">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      <span className="text-sm font-medium">{r.rating}</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {r.profiles?.full_name ?? "Customer"} ·{" "}
                    {new Date(r.created_at).toLocaleDateString("en-PK")}
                  </p>
                  <p className="text-sm mt-3 leading-relaxed">{r.comment}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                    r.approved
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {r.approved ? "Approved" : "Pending"}
                </span>
              </div>
              <div className="flex gap-2 mt-4 pt-4 border-t border-border/50">
                {!r.approved && (
                  <form action={setReviewApprovalFormAction}>
                    <input type="hidden" name="id" value={r.id} />
                    <input type="hidden" name="approved" value="true" />
                    <Button type="submit" size="sm">
                      Approve
                    </Button>
                  </form>
                )}
                {r.approved && (
                  <form action={setReviewApprovalFormAction}>
                    <input type="hidden" name="id" value={r.id} />
                    <input type="hidden" name="approved" value="false" />
                    <Button type="submit" variant="outline" size="sm">
                      Unapprove
                    </Button>
                  </form>
                )}
                <form action={deleteReviewFormAction}>
                  <input type="hidden" name="id" value={r.id} />
                  <Button type="submit" variant="outline" size="sm">
                    Delete
                  </Button>
                </form>
              </div>
            </AdminCard>
          ))}
        </div>
      )}
    </div>
  );
}
