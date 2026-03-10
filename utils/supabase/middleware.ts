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
          // Update the REQUEST cookies
          cookiesToSet.forEach(({ name, value, options }) =>
            // FIX: Pass as a single object to satisfy the new TypeScript definition
            request.cookies.set({ name, value, ...options }),
          );

          // Update the RESPONSE cookies
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

  // IMPORTANT: This refreshes the session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // PROTECTION LOGIC:
  // 1. If no user and they are trying to access dashboard, send to login
  if (!user && request.nextUrl.pathname.startsWith("/dashboard")) {
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    return NextResponse.redirect(url);
  }

  // 2. If user IS logged in and tries to go back to login/sign-up, send to dashboard
  if (
    user &&
    (request.nextUrl.pathname === "//sign-in" ||
      request.nextUrl.pathname === "/sign-up")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
