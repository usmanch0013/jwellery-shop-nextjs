"use server";

import { getAdminClient } from "@/lib/admin/auth";
import { revalidatePath } from "next/cache";

export async function approveReviewAction(
  id: string,
  approved: boolean
): Promise<void> {
  const admin = await getAdminClient();
  await admin.from("reviews").update({ approved }).eq("id", id);
  revalidatePath("/admin/reviews");
}

export async function setReviewApprovalFormAction(
  formData: FormData
): Promise<void> {
  const id = formData.get("id") as string;
  const approved = formData.get("approved") === "true";
  if (!id) return;
  await approveReviewAction(id, approved);
}

export async function deleteReviewFormAction(
  formData: FormData
): Promise<void> {
  const id = formData.get("id") as string;
  if (!id) return;

  const admin = await getAdminClient();
  await admin.from("reviews").delete().eq("id", id);
  revalidatePath("/admin/reviews");
}
