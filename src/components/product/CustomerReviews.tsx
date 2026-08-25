import { getProductReviews } from "@/actions/contact";
import ReviewForm from "./ReviewForm";

interface CustomerReviewsProps {
  productId: string;
}

export default async function CustomerReviews({
  productId,
}: CustomerReviewsProps) {
  const reviews = await getProductReviews(productId);

  return (
    <section className="py-16 lg:py-20 border-t border-border">
      <h2 className="text-[22px] lg:text-[26px] font-medium text-foreground text-center mb-10">
        Customer Reviews
      </h2>

      {reviews.length === 0 ? (
        <p className="text-center text-[#888] text-sm mb-8">
          Be the first to write a review.
        </p>
      ) : (
        <div className="max-w-2xl mx-auto space-y-6 mb-10">
          {reviews.map((review) => (
            <div key={review.id} className="border-b pb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium">
                  {(review as { profiles?: { full_name?: string } }).profiles
                    ?.full_name ?? "Customer"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {"★".repeat(review.rating)}
                </span>
              </div>
              {review.comment && (
                <p className="text-sm text-muted-foreground">{review.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}

      <ReviewForm productId={productId} />
    </section>
  );
}
