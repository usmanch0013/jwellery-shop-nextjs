"use server";

import { getAdminClient } from "@/lib/admin/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const couponSchema = z.object({
  code: z.string().min(3),
  type: z.enum(["percent", "fixed"]),
  value: z.coerce.number().positive(),
  minOrder: z.coerce.number().min(0),
  usageLimit: z.coerce.number().optional(),
  expiresAt: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
});

export async function saveCouponAction(formData: FormData): Promise<void> {
  const id = formData.get("id") as string | null;
  const parsed = couponSchema.safeParse({
    code: formData.get("code"),
    type: formData.get("type"),
    value: formData.get("value"),
    minOrder: formData.get("minOrder"),
    usageLimit: formData.get("usageLimit") || undefined,
    expiresAt: formData.get("expiresAt") || undefined,
    isActive: formData.get("isActive") === "on",
  });

  if (!parsed.success) return;

  const admin = await getAdminClient();
  const row = {
    code: parsed.data.code.toUpperCase(),
    type: parsed.data.type,
    value: parsed.data.value,
    min_order: parsed.data.minOrder,
    usage_limit: parsed.data.usageLimit ?? null,
    expires_at: parsed.data.expiresAt || null,
    is_active: parsed.data.isActive ?? true,
  };

  if (id) {
    await admin.from("coupons").update(row).eq("id", id);
  } else {
    await admin.from("coupons").insert(row);
  }

  revalidatePath("/admin/coupons");
}

export async function deleteCouponFormAction(formData: FormData): Promise<void> {
  const id = formData.get("id") as string;
  if (!id) return;

  const admin = await getAdminClient();
  await admin.from("coupons").delete().eq("id", id);
  revalidatePath("/admin/coupons");
}
