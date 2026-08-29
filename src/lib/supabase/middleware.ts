import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  getSupabaseAnonKey,
  getSupabaseAuthClientOptions,
  getSupabaseUrl,
  isSupabaseConfigured,
} from "./config";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  if (!isSupabaseConfigured()) {
    return supabaseResponse;
  }

  const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
    ...getSupabaseAuthClientOptions(),
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const protectedPaths = ["/account", "/orders", "/admin"];
  const isProtected = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  if (user && request.nextUrl.pathname.startsWith("/admin")) {
    const { isAdminUserMiddleware } = await import("@/lib/admin/middleware-auth");
    const allowed = await isAdminUserMiddleware(user, supabase);
    if (!allowed) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      url.searchParams.set("error", "admin");
      return NextResponse.redirect(url);
    }
  }

  const authPaths = ["/login", "/register"];
  if (user && authPaths.includes(request.nextUrl.pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/account";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
