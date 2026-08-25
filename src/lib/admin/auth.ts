import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";

function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export async function isAdminUser(user: User | null): Promise<boolean> {
  if (!user?.email) return false;

  const adminEmails = getAdminEmails();
  if (adminEmails.includes(user.email.toLowerCase())) return true;

  if (!isSupabaseConfigured()) return false;

  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    return data?.role === "admin";
  } catch {
    return adminEmails.includes(user.email.toLowerCase());
  }
}

export async function requireAdmin(): Promise<User> {
  if (!isSupabaseConfigured()) {
    redirect("/login?redirect=/admin&error=supabase");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/admin");
  }

  const allowed = await isAdminUser(user);
  if (!allowed) {
    redirect("/?error=admin");
  }

  return user;
}

export async function getAdminClient() {
  await requireAdmin();
  return createAdminClient();
}
