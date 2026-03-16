import { createClient } from "@/utils/supabase/server";
import { exchangeCodeForTokens } from "../actions";
import { AlertCircle } from "lucide-react";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{
    code?: string;
    realmId?: string;
    error?: string;
    state?: string;
  }>;
}

export default async function QuickBooksCallbackPage({ searchParams }: Props) {
  const params = await searchParams;
  const supabase = await createClient();

  // ── Shared abort: sign out + back to sign-in ─────────
  async function abortLogin(reason: string) {
    await supabase.auth.signOut();
    redirect(`/sign-in?error=${encodeURIComponent(reason)}`);
  }

  // ── QB denied / user cancelled ───────────────────────
  if (params.error) {
    await abortLogin("QuickBooks authorization was denied. Please try again.");
  }

  // ── Missing OAuth params ──────────────────────────────
  if (!params.code || !params.realmId) {
    await abortLogin("Invalid QuickBooks callback. Please sign in again.");
  }

  // ── Exchange code for tokens ──────────────────────────
  try {
    await exchangeCodeForTokens(params.code!, params.realmId!);
  } catch (err) {
    // ✅ KEY FIX: redirect() in Next.js throws internally.
    // Re-throw it so the navigation actually happens.
    // Only call abortLogin for REAL errors.
    if (isRedirectError(err)) throw err;

    await abortLogin("Failed to connect QuickBooks. Please sign in again.");
  }

  // Fallback redirect if exchangeCodeForTokens doesn't call redirect() itself
  redirect("/dashboard");
}
