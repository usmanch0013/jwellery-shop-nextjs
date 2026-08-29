import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { SupabaseClient, User } from "@supabase/supabase-js";

function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/** Admin check for middleware — uses user session + RLS, no service role. */
export async function isAdminUserMiddleware(
  user: User,
  supabase: SupabaseClient
): Promise<boolean> {
  if (!user.email) return false;

  const adminEmails = getAdminEmails();
  if (adminEmails.includes(user.email.toLowerCase())) return true;

  if (!isSupabaseConfigured()) return false;

  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  return data?.role === "admin";
}
