import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type CookieToSet = { name: string; value: string; options: CookieOptions };

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // ── Admin protection ──────────────────────────────────────
  const isAdminPath = pathname.startsWith("/admin");
  const isAdminLogin = pathname === "/admin/login";
  if (isAdminPath && !isAdminLogin && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }
  if (isAdminLogin && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/dashboard";
    return NextResponse.redirect(url);
  }

  // ── Member portal protection ──────────────────────────────
  const isMemberPortal = pathname.startsWith("/members/portal");
  const isMemberLogin = pathname === "/members/login";
  if (isMemberPortal && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/members/login";
    return NextResponse.redirect(url);
  }
  if (isMemberLogin && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/members/portal";
    return NextResponse.redirect(url);
  }

  // ── Rector protection ─────────────────────────────────────
  const isRectorPath = pathname.startsWith("/rector/dashboard");
  const isRectorLogin = pathname === "/rector/login";
  if (isRectorPath && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/rector/login";
    return NextResponse.redirect(url);
  }

  // ── Redirect old /login to /members/login ─────────────────
  if (pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/members/login";
    return NextResponse.redirect(url);
  }

  // ── Redirect /register away (no public registration) ──────
  if (pathname === "/register") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/members/portal/:path*",
    "/members/login",
    "/rector/:path*",
    "/login",
    "/register",
  ],
};
