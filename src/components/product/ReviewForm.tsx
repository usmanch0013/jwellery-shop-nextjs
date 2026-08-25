"use client";

import { useState } from "react";
import { toast } from "sonner";
import { submitReviewAction } from "@/actions/contact";

interface ReviewFormProps {
  productId: string;
}

export default function ReviewForm({ productId }: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData();
    fd.set("productId", productId);
    fd.set("rating", String(rating));
    fd.set("comment", comment);
    const result = await submitReviewAction(fd);
    setLoading(false);
    if (result.error) toast.error(result.error);
    else {
      toast.success(result.message ?? "Review submitted");
      setComment("");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto flex flex-col items-center gap-4"
    >
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className={`text-xl ${star <= rating ? "text-champagne" : "text-muted"}`}
            aria-label={`${star} stars`}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience..."
        required
        minLength={10}
        rows={4}
        className="w-full border px-3 py-2 text-sm rounded"
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-champagne hover:bg-champagne-dark text-foreground text-sm px-8 py-3 rounded transition-colors disabled:opacity-50"
      >
        {loading ? "Submitting..." : "Write a review"}
      </button>
    </form>
  );
}
