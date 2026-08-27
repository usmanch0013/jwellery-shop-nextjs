"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSupabaseConfigIssue, isSupabaseConfigured } from "@/lib/supabase/config";
import { loginSchema, registerSchema } from "@/lib/validations/commerce";
import { mergeGuestCartOnLogin } from "@/actions/cart";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { rateLimit, rateLimitKey } from "@/lib/rate-limit";

function authErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "string" && error.trim()) return error;
  if (error && typeof error === "object") {
    const record = error as Record<string, unknown>;
    for (const key of [
      "message",
      "msg",
      "error_description",
      "error",
      "code",
      "error_code",
    ]) {
      const value = record[key];
      if (typeof value === "string" && value.trim()) {
        return key.includes("code")
          ? value.replaceAll("_", " ")
          : value;
      }
    }
    if (typeof record.name === "string" && record.name.trim()) {
      return record.name;
    }
    if (typeof record.status === "number") {
      return `${fallback} (HTTP ${record.status})`;
    }
  }
  return fallback;
}

function getAuthErrorCode(error: unknown): string {
  if (error && typeof error === "object") {
    const record = error as Record<string, unknown>;
    if (typeof record.code === "string") return record.code;
    if (typeof record.error_code === "string") return record.error_code;
  }
  return "";
}

function shouldFallbackToAdminSignup(error: unknown): boolean {
  const code = getAuthErrorCode(error);
  const message = authErrorMessage(error, "").toLowerCase();
  return (
    code === "over_email_send_rate_limit" ||
    code === "email_exists" ||
    code === "user_already_exists" ||
    message.includes("rate limit") ||
    message.includes("already registered") ||
    message.includes("already been registered")
  );
}

async function registerWithAdmin(
  parsed: {
    email: string;
    password: string;
    fullName: string;
    phone: string;
  },
  isAdmin: boolean
): Promise<{ error?: string }> {
  const admin = createAdminClient();
  const email = parsed.email.trim().toLowerCase();

  const { data: created, error: createError } =
    await admin.auth.admin.createUser({
      email: parsed.email,
      password: parsed.password,
      email_confirm: true,
      user_metadata: {
        full_name: parsed.fullName,
        phone: parsed.phone,
      },
    });

  let userId = created.user?.id;

  if (createError) {
    const code = getAuthErrorCode(createError);
    const exists =
      code === "email_exists" ||
      code === "user_already_exists" ||
      authErrorMessage(createError, "")
        .toLowerCase()
        .includes("already");

    if (!exists) {
      return {
        error: authErrorMessage(createError, "Could not create account"),
      };
    }

    const { data: listed, error: listError } =
      await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (listError) {
      return {
        error:
          "This email is already registered. Please sign in with your password.",
      };
    }

    const existing = listed.users.find(
      (user) => user.email?.toLowerCase() === email
    );
    if (!existing) {
      return {
        error:
          "This email is already registered. Please sign in with your password.",
      };
    }

    userId = existing.id;
    const { error: updateError } = await admin.auth.admin.updateUserById(
      userId,
      {
        password: parsed.password,
        email_confirm: true,
        user_metadata: {
          full_name: parsed.fullName,
          phone: parsed.phone,
        },
      }
    );
    if (updateError) {
      return {
        error:
          "This email is already registered. Please sign in with your password.",
      };
    }
  }

  if (userId) {
    await admin.from("profiles").upsert({
      id: userId,
      full_name: parsed.fullName,
      phone: parsed.phone,
      ...(isAdmin ? { role: "admin" } : {}),
    });
  }

  return {};
}

async function completeRegistration(
  supabase: Awaited<ReturnType<typeof createClient>>,
  parsed: { email: string; password: string },
  isAdmin: boolean
) {
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: parsed.email,
    password: parsed.password,
  });

  if (signInError) {
    return {
      ok: true as const,
      message: "Account created. Please sign in with your email and password.",
    };
  }

  await mergeGuestCartOnLogin().catch(() => {});
  revalidatePath("/");
  return {
    ok: true as const,
    redirectTo: isAdmin ? "/admin" : "/account",
  };
}

function isAdminEmail(email: string): boolean {
  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return adminEmails.includes(email.toLowerCase());
}

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
    const issue = getSupabaseConfigIssue();
    return {
      error:
        issue ??
        "Authentication not configured on this server. Add Supabase environment variables in Netlify and redeploy.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) return { error: authErrorMessage(error, "Sign in failed") };

  await mergeGuestCartOnLogin();
  revalidatePath("/");
  return { success: true };
}

export async function registerAction(formData: FormData) {
  try {
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
      const issue = getSupabaseConfigIssue();
      return {
        error:
          issue ??
          "Authentication not configured on this server. Add Supabase environment variables in Netlify and redeploy.",
      };
    }

    const email = parsed.data.email.trim().toLowerCase();
    const isAdmin = isAdminEmail(email);
    const supabase = await createClient();

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        data: {
          full_name: parsed.data.fullName,
          phone: parsed.data.phone,
        },
      },
    });

    if (signUpError) {
      if (!shouldFallbackToAdminSignup(signUpError)) {
        return {
          error: authErrorMessage(signUpError, "Could not create account"),
        };
      }

      const adminResult = await registerWithAdmin(parsed.data, isAdmin);
      if (adminResult.error) {
        return { error: adminResult.error };
      }

      return completeRegistration(supabase, parsed.data, isAdmin);
    }

    if (data.user && isAdmin) {
      try {
        const admin = createAdminClient();
        await admin
          .from("profiles")
          .update({ role: "admin", phone: parsed.data.phone })
          .eq("id", data.user.id);
      } catch {
        // ADMIN_EMAILS still grants /admin access if profile update fails.
      }
    } else if (data.user) {
      await supabase
        .from("profiles")
        .update({ phone: parsed.data.phone })
        .eq("id", data.user.id);
    }

    if (data.session) {
      await mergeGuestCartOnLogin().catch(() => {});
      revalidatePath("/");
      return { ok: true, redirectTo: isAdmin ? "/admin" : "/account" };
    }

    return completeRegistration(supabase, parsed.data, isAdmin);
  } catch (err) {
    return {
      error: authErrorMessage(err, "Registration failed. Please try again."),
    };
  }
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

  if (error) return { error: authErrorMessage(error, "Could not send reset email") };
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
