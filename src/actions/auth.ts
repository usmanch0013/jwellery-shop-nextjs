"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { loginSchema, registerSchema } from "@/lib/validations/commerce";
import { mergeGuestCartOnLogin } from "@/actions/cart";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { rateLimit, rateLimitKey } from "@/lib/rate-limit";

export async function loginAction(formData: FormData) {
  const rl = rateLimit(await rateLimitKey("login"), 10, 60_000);
  if (!rl.ok) return { error: "Too many attempts. Please try again later." };

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Invalid email or password" };
  }

  if (!isSupabaseConfigured()) {
    return { error: "Authentication not configured" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) return { error: error.message };

  await mergeGuestCartOnLogin();
  revalidatePath("/");
  return { success: true };
}

export async function registerAction(formData: FormData) {
  const parsed = registerSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Please fill all fields correctly" };
  }

  if (!isSupabaseConfigured()) {
    return { error: "Authentication not configured" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName, phone: parsed.data.phone },
    },
  });

  if (error) return { error: error.message };
  return { success: true, message: "Check your email to confirm your account" };
}

export async function logoutAction() {
  if (!isSupabaseConfigured()) return;
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/");
  redirect("/login");
}

export async function forgotPasswordAction(formData: FormData) {
  const email = formData.get("email") as string;
  if (!email || !isSupabaseConfigured()) {
    return { error: "Invalid email" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/account`,
  });

  if (error) return { error: error.message };
  return { success: true };
}

export async function getProfile() {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return { user, profile };
}

export async function updateProfileAction(formData: FormData) {
  if (!isSupabaseConfigured()) return { error: "Not configured" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const fullName = formData.get("fullName") as string;
  const phone = formData.get("phone") as string;

  const { error } = await supabase
    .from("profiles")
    .upsert({ id: user.id, full_name: fullName, phone });

  if (error) return { error: error.message };
  revalidatePath("/account");
  return { success: true };
}

export async function getAddresses() {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", user.id)
    .order("is_default", { ascending: false });

  return data ?? [];
}

export async function saveAddressAction(formData: FormData) {
  if (!isSupabaseConfigured()) return { error: "Not configured" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const address = {
    user_id: user.id,
    label: (formData.get("label") as string) || "Home",
    line1: formData.get("line1") as string,
    line2: (formData.get("line2") as string) || null,
    city: formData.get("city") as string,
    province: formData.get("province") as string,
    postal_code: (formData.get("postalCode") as string) || null,
    is_default: formData.get("isDefault") === "true",
  };

  if (address.is_default) {
    await supabase
      .from("addresses")
      .update({ is_default: false })
      .eq("user_id", user.id);
  }

  const { error } = await supabase.from("addresses").insert(address);
  if (error) return { error: error.message };
  revalidatePath("/account");
  return { success: true };
}

export async function deleteAddressAction(addressId: string) {
  if (!isSupabaseConfigured()) return;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("addresses")
    .delete()
    .eq("id", addressId)
    .eq("user_id", user.id);
  revalidatePath("/account");
}
