"use client";

export default function CustomerReviews() {
  return (
    <section className="py-16 lg:py-20 border-t border-border">
      <h2 className="text-[22px] lg:text-[26px] font-medium text-foreground text-center mb-10">
        Customer Reviews
      </h2>
      <p className="text-center text-[#888] text-sm mb-8">
        Be the first to write a review.
      </p>
      <div className="flex justify-center">
        <button
          type="button"
          className="bg-champagne hover:bg-champagne-dark text-foreground text-sm px-8 py-3 rounded transition-colors"
        >
          Write a review
        </button>
      </div>
    </section>
  );
}
