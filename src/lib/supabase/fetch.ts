type FetchFn = typeof fetch;

/**
 * New-format Supabase keys (sb_publishable_*) must not be sent as Bearer JWTs.
 * The SDK falls back to the API key when there is no session; strip that case.
 */
export function wrapSupabaseFetch(
  supabaseKey: string,
  baseFetch: FetchFn = fetch
): FetchFn {
  const isNewFormatKey = supabaseKey.startsWith("sb_");

  return async (input, init) => {
    const headers = new Headers(init?.headers);

    if (!headers.has("apikey")) {
      headers.set("apikey", supabaseKey);
    }

    if (isNewFormatKey) {
      const auth = headers.get("Authorization");
      if (!auth?.trim()) {
        headers.delete("Authorization");
      } else if (auth.startsWith("Bearer ")) {
        const token = auth.slice(7);
        // Publishable keys must not be sent as Bearer JWTs; secret keys may be.
        if (
          token === supabaseKey ||
          token.startsWith("sb_publishable_")
        ) {
          headers.delete("Authorization");
        }
      }
    }

    return baseFetch(input, { ...init, headers });
  };
}
