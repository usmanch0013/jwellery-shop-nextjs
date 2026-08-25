"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { contactSchema, reviewSchema } from "@/lib/validations/commerce";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

import { rateLimit, rateLimitKey } from "@/lib/rate-limit";

export async function submitContactAction(formData: FormData) {
  const rl = rateLimit(await rateLimitKey("contact"), 5, 60_000);
  if (!rl.ok) return { error: "Too many requests. Please try again later." };

  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject"),
    message: formData.get("message"),
  });

  if (!parsed.success) return { error: "Please fill all required fields" };

  if (isSupabaseConfigured()) {
    const admin = createAdminClient();
    await admin.from("contact_messages").insert(parsed.data);
  }

  if (process.env.RESEND_API_KEY) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev",
        to: process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev",
        subject: `Contact: ${parsed.data.subject ?? "General"}`,
        text: `From: ${parsed.data.name} (${parsed.data.email})\n\n${parsed.data.message}`,
      });
    } catch {
      // non-blocking
    }
  }

  return { success: true };
}

export async function submitReviewAction(formData: FormData) {
  const parsed = reviewSchema.safeParse({
    productId: formData.get("productId"),
    rating: Number(formData.get("rating")),
    comment: formData.get("comment"),
  });

  if (!parsed.success) return { error: "Invalid review" };
  if (!isSupabaseConfigured()) return { error: "Reviews not available" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please login to review" };

  const { error } = await supabase.from("reviews").insert({
    product_id: parsed.data.productId,
    user_id: user.id,
    rating: parsed.data.rating,
    comment: parsed.data.comment,
    approved: false,
  });

  if (error) return { error: error.message };
  revalidatePath(`/products/${parsed.data.productId}`);
  return { success: true, message: "Review submitted for approval" };
}

export async function getProductReviews(productId: string) {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("reviews")
    .select("*, profiles(full_name)")
    .eq("product_id", productId)
    .eq("approved", true)
    .order("created_at", { ascending: false });

  return data ?? [];
}
