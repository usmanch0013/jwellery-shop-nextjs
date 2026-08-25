import { getAdminReviews } from "@/lib/admin/queries";
import {
  setReviewApprovalFormAction,
  deleteReviewFormAction,
} from "@/actions/admin/reviews";
import { Button } from "@/components/ui/button";

export default async function AdminReviewsPage() {
  const reviews = await getAdminReviews();

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl">Reviews</h1>

      <div className="space-y-3">
        {reviews.length === 0 ? (
          <p className="text-muted-foreground">No reviews yet</p>
        ) : (
          reviews.map((r) => (
            <div
              key={r.id}
              className="border border-border rounded-lg p-4 bg-background"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium">
                    {r.products?.name ?? "Product"} · {r.rating}/5
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {r.profiles?.full_name ?? "Customer"} ·{" "}
                    {new Date(r.created_at).toLocaleDateString("en-PK")}
                  </p>
                  <p className="text-sm mt-2">{r.comment}</p>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded ${
                    r.approved
                      ? "bg-green-100 text-green-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {r.approved ? "Approved" : "Pending"}
                </span>
              </div>
              <div className="flex gap-2 mt-3">
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
            </div>
          ))
        )}
      </div>
    </div>
  );
}
