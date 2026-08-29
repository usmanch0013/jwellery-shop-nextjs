import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";

/** Storefront reads — anon client + RLS (no service role on public pages). */
export async function getPublicCmsClient() {
  if (!isSupabaseConfigured()) return null;
  try {
    return await createClient();
  } catch {
    return null;
  }
}

/** Admin-only reads when public client unavailable */
export function getCmsAdminReadClient() {
  if (!isSupabaseConfigured()) return null;
  try {
    return createAdminClient();
  } catch {
    return null;
  }
}
