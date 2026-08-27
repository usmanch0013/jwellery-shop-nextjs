import { wrapSupabaseFetch } from "./fetch";

export function getSupabaseAnonKey(): string {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    ""
  );
}

export function getSupabaseServiceRoleKey(): string {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_SECRET_KEY ??
    ""
  );
}

/** New publishable keys (sb_publishable_*) replace legacy anon JWT keys. */
export function usesNewApiKeys(): boolean {
  return getSupabaseAnonKey().startsWith("sb_");
}

/** Client options so auth/REST work with sb_publishable keys. */
export function getSupabaseAuthClientOptions(apiKey = getSupabaseAnonKey()) {
  if (!apiKey.startsWith("sb_")) {
    return {};
  }

  return {
    global: {
      fetch: wrapSupabaseFetch(apiKey),
      // Override SDK default `Bearer sb_*...` on the auth client.
      headers: { Authorization: "" },
    },
  };
}

export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey());
}

export function getSupabaseConfigIssue(): string | null {
  if (!getSupabaseUrl() && !getSupabaseAnonKey()) {
    return "Missing NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or ANON_KEY).";
  }
  if (!getSupabaseUrl()) {
    return "Missing NEXT_PUBLIC_SUPABASE_URL.";
  }
  if (!getSupabaseAnonKey()) {
    return "Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY).";
  }
  return null;
}

export function getSupabaseUrl(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
}
