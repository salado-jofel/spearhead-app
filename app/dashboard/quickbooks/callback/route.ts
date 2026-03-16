// app/dashboard/quickbooks/callback/route.ts  ← CREATE THIS, DELETE page.tsx

import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { exchangeCodeForTokens } from "../actions";
import { isRedirectError } from "next/dist/client/components/redirect-error";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const code = searchParams.get("code");
  const realmId = searchParams.get("realmId");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const supabase = await createClient();

  const abortLogin = async (reason: string): Promise<NextResponse> => {
    await supabase.auth.signOut();
    return NextResponse.redirect(
      new URL(`/sign-in?error=${encodeURIComponent(reason)}`, request.url),
    );
  };

  // ── QB denied / user cancelled ────────────────────────────────────────────
  if (error) {
    return abortLogin("QuickBooks authorization was denied. Please try again.");
  }

  // ── Missing OAuth params — includes state ─────────────────────────────────
  if (!code || !realmId || !state) {
    return abortLogin("Invalid QuickBooks callback. Please sign in again.");
  }

  // ── Exchange code for tokens — cookie write now allowed in Route Handler ──
  try {
    await exchangeCodeForTokens(code, realmId, state);
  } catch (err) {
    // redirect() in Next.js throws internally — re-throw so navigation happens
    if (isRedirectError(err)) throw err;
    return abortLogin("Failed to connect QuickBooks. Please sign in again.");
  }

  // Fallback — exchangeCodeForTokens calls redirect() internally
  return NextResponse.redirect(new URL("/dashboard", request.url));
}
