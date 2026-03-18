"use server";

import OAuthClient from "intuit-oauth";
import { createClient } from "@/utils/supabase/server";
import { createQBClient } from "@/utils/quickbooks/client";
import { redirect } from "next/navigation";

// ── Redirect to QuickBooks OAuth ──────────────────────────────────────────────
export async function redirectToQuickBooks(): Promise<never> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) redirect("/sign-in");

  const state = crypto.randomUUID();

  await supabase.auth.updateUser({
    data: {
      qb_oauth_state: state,
      qb_oauth_state_exp: Date.now() + 10 * 60 * 1000,
    },
  });

  // ✅ SDK builds the auth URL — no more manual QB_CONFIG.authUrl
  const authUri = createQBClient().authorizeUri({
    scope: [OAuthClient.scopes.Accounting],
    state,
  });

  redirect(authUri);
}

// ── Exchange Code for Tokens ──────────────────────────────────────────────────
// ✅ Accepts full callback URL — SDK's createToken() parses code from it
// ✅ No redirect() at the end — caller handles redirect after facility sync
export async function exchangeCodeForTokens(
  callbackUrl: string,
  realmId: string,
  returnedState: string,
): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("User not authenticated");

  // ── Verify OAuth state (CSRF protection) ─────────────────────────────────
  const storedState = user.user_metadata?.qb_oauth_state as string | undefined;
  const stateExp = user.user_metadata?.qb_oauth_state_exp as number | undefined;

  // Clear state immediately regardless of outcome
  await supabase.auth.updateUser({
    data: { qb_oauth_state: null, qb_oauth_state_exp: null },
  });

  if (!storedState || storedState !== returnedState) {
    throw new Error("OAuth state mismatch — possible CSRF attack.");
  }
  if (!stateExp || Date.now() > stateExp) {
    throw new Error("OAuth state expired.");
  }

  // ── SDK token exchange — replaces manual fetch ────────────────────────────
  const client = createQBClient();
  await client.createToken(callbackUrl); // ✅ SDK parses code + exchanges for tokens
  const token = client.getToken();

  // ── Fetch company name ────────────────────────────────────────────────────
  let companyName = "Unknown Company";
  try {
    const baseUrl =
      process.env.QB_ENVIRONMENT === "production"
        ? "https://quickbooks.api.intuit.com"
        : "https://sandbox-quickbooks.api.intuit.com";

    const companyResponse = await fetch(
      `${baseUrl}/v3/company/${realmId}/companyinfo/${realmId}?minorversion=65`,
      {
        headers: {
          Authorization: `Bearer ${token.access_token}`,
          Accept: "application/json",
        },
      },
    );
    if (companyResponse.ok) {
      const companyData = await companyResponse.json();
      companyName = companyData?.CompanyInfo?.CompanyName ?? "Unknown Company";
    }
  } catch (e) {
    console.warn("[QB] Company name fetch threw:", e);
  }

  // ── Save tokens to DB ─────────────────────────────────────────────────────
  const now = new Date();

  const { error: upsertError } = await supabase
    .from("quickbooks_connections")
    .upsert(
      {
        user_id: user.id,
        realm_id: realmId,
        access_token: token.access_token,
        refresh_token: token.refresh_token,
        access_token_expires_at: new Date(
          now.getTime() + 3600 * 1000,
        ).toISOString(),
        refresh_token_expires_at: new Date(
          now.getTime() + 8726400 * 1000,
        ).toISOString(),
        company_name: companyName,
        environment: process.env.QB_ENVIRONMENT,
        updated_at: now.toISOString(),
      },
      { onConflict: "user_id" },
    );

  if (upsertError) {
    console.error("[QB] Upsert failed:", upsertError.message);
    throw new Error(
      `Failed to save QuickBooks connection: ${upsertError.message}`,
    );
  }

  // ✅ No redirect here — callback handles it after facility sync
}

// ── Get QB Connection ─────────────────────────────────────────────────────────
export async function getQuickBooksConnection() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) return null;

    const { data, error } = await supabase
      .from("quickbooks_connections")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("[getQuickBooksConnection] Error:", error);
      return null;
    }
    return data;
  } catch (err) {
    console.error("[getQuickBooksConnection] Unexpected error:", err);
    return null;
  }
}

// ── Disconnect QB ─────────────────────────────────────────────────────────────
export async function disconnectQuickBooks(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("User not authenticated");

  const { error } = await supabase
    .from("quickbooks_connections")
    .delete()
    .eq("user_id", user.id);

  if (error) throw new Error("Failed to disconnect QuickBooks");
  redirect("/dashboard/quickbooks");
}
