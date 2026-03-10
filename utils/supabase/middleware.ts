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

          supabaseResponse = NextResponse.next({
            request,
          });

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

  // LOGIC A: If user IS logged in and tries to access Auth pages
  if (user && isAuthPage) {
    const referer = request.headers.get("referer");
    const refererUrl = referer ? new URL(referer) : null;

    // Check if the referer is just the landing page "/"
    const isComingFromLanding = refererUrl?.pathname === "/";

    // If coming from landing page OR no referer, go to dashboard
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

    // Otherwise, send them back to where they were (e.g., /dashboard/orders)
    return NextResponse.redirect(referer);
  }

  // LOGIC B: Protect Dashboard
  if (!user && currentPath.startsWith("/dashboard")) {
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    url.searchParams.set("next", currentPath);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
