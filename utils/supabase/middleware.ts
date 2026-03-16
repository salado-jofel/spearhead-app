import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set({ name, value, ...options }),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const currentPath = request.nextUrl.pathname;

  const isAuthPage =
    currentPath === "/sign-in" ||
    currentPath === "/sign-up" ||
    currentPath === "/verify-email";

  // ── Pre-fetch QB connection once (only when user is logged in) ──────────
  // Avoids duplicate queries in LOGIC A and LOGIC C below
  let isQBValid = false;
  if (user) {
    const { data: qb } = await supabase
      .from("quickbooks_connections")
      .select("id, access_token_expires_at")
      .eq("user_id", user.id)
      .maybeSingle();

    isQBValid =
      qb !== null && new Date(qb.access_token_expires_at) > new Date();
  }

  // ── LOGIC A: Logged-in user visits an auth page ──────────────────────────
  if (user && isAuthPage) {
    // If QB is NOT valid, don't redirect to /dashboard —
    // let them stay on /sign-in so the login action can
    // kick off the QB OAuth flow again.
    if (!isQBValid) {
      return supabaseResponse;
    }

    // QB is valid → existing redirect logic (unchanged)
    const referer = request.headers.get("referer");
    const refererUrl = referer ? new URL(referer) : null;
    const isComingFromLanding = refererUrl?.pathname === "/";

    if (
      !referer ||
      isComingFromLanding ||
      referer.includes("/sign-in") ||
      referer.includes("/sign-up")
    ) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }

    return NextResponse.redirect(referer);
  }

  // ── LOGIC B: Unauthenticated user visits /dashboard ──────────────────────
  if (!user && currentPath.startsWith("/dashboard")) {
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    url.searchParams.set("next", currentPath);
    return NextResponse.redirect(url);
  }

  // ── LOGIC C: Authenticated but QB missing/expired on /dashboard ──────────
  // Must exclude /dashboard/quickbooks/callback — that route IS
  // what creates the QB connection, so QB doesn't exist yet at that point.
  const isQBCallback = currentPath.startsWith("/dashboard/quickbooks/callback");

  if (user && currentPath.startsWith("/dashboard") && !isQBCallback) {
    if (!isQBValid) {
      // Send back to sign-in — the login action will re-trigger QB OAuth
      const url = request.nextUrl.clone();
      url.pathname = "/sign-in";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
