// app/dashboard/quickbooks/actions.ts  ← FULL FILE

"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { QB_CONFIG } from "@/utils/quickbooks/config";

// ── Redirect to QuickBooks OAuth ──────────────────────────────────────────────

export async function redirectToQuickBooks(): Promise<never> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) redirect("/sign-in");

  const state = crypto.randomUUID();

  // Store state server-side in user metadata — survives cross-site redirects
  await supabase.auth.updateUser({
    data: {
      qb_oauth_state: state,
      qb_oauth_state_exp: Date.now() + 10 * 60 * 1000,
    },
  });

  const params = new URLSearchParams({
    client_id: QB_CONFIG.clientId,
    redirect_uri: QB_CONFIG.redirectUri,
    response_type: "code",
    scope: "com.intuit.quickbooks.accounting",
    state,
  });

  redirect(`${QB_CONFIG.authUrl}?${params.toString()}`);
}

// ── Exchange Code for Tokens ──────────────────────────────────────────────────

export async function exchangeCodeForTokens(
  code: string,
  realmId: string,
  returnedState: string,
): Promise<void> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("User not authenticated");

    // ── Verify OAuth state (CSRF protection) ─────────────────────────────────
    const storedState = user.user_metadata?.qb_oauth_state as
      | string
      | undefined;
    const stateExp = user.user_metadata?.qb_oauth_state_exp as
      | number
      | undefined;

    // Consume immediately — clear from metadata regardless of outcome
    await supabase.auth.updateUser({
      data: { qb_oauth_state: null, qb_oauth_state_exp: null },
    });

    if (!storedState || storedState !== returnedState) {
      throw new Error("OAuth state mismatch — possible CSRF attack.");
    }
    if (!stateExp || Date.now() > stateExp) {
      throw new Error("OAuth state expired.");
    }

    // ── Token exchange ────────────────────────────────────────────────────────
    const credentials = btoa(`${QB_CONFIG.clientId}:${QB_CONFIG.clientSecret}`);

    const response = await fetch(QB_CONFIG.tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${credentials}`,
        Accept: "application/json",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: QB_CONFIG.redirectUri,
      }).toString(),
    });

    const responseText = await response.text();
    if (!response.ok) {
      throw new Error(
        `Token exchange failed: ${response.status} - ${responseText}`,
      );
    }

    let tokens: Record<string, unknown>;
    try {
      tokens = JSON.parse(responseText);
    } catch {
      throw new Error(
        `QB token endpoint returned non-JSON: ${responseText.slice(0, 200)}`,
      );
    }

    // ── Fetch company name ────────────────────────────────────────────────────
    let companyName = "Unknown Company";
    try {
      const companyResponse = await fetch(
        `${QB_CONFIG.companyUrl}/v3/company/${realmId}/companyinfo/${realmId}?minorversion=65`,
        {
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
            Accept: "application/json",
          },
        },
      );
      if (companyResponse.ok) {
        const companyData = await companyResponse.json();
        companyName =
          companyData?.CompanyInfo?.CompanyName ?? "Unknown Company";
      } else {
        console.warn(
          "[QB] Failed to fetch company name:",
          companyResponse.status,
        );
      }
    } catch (e) {
      console.warn("[QB] Company name fetch threw:", e);
    }

    const now = new Date();
    const accessTokenExpiresAt = new Date(
      now.getTime() + (tokens.expires_in as number) * 1000,
    );
    const refreshTokenExpiresAt = new Date(
      now.getTime() + (tokens.x_refresh_token_expires_in as number) * 1000,
    );

    const { error: upsertError } = await supabase
      .from("quickbooks_connections")
      .upsert(
        {
          user_id: user.id,
          realm_id: realmId,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          access_token_expires_at: accessTokenExpiresAt.toISOString(),
          refresh_token_expires_at: refreshTokenExpiresAt.toISOString(),
          company_name: companyName,
          environment: QB_CONFIG.environment,
          updated_at: now.toISOString(),
        },
        { onConflict: "user_id" },
      );

    if (upsertError) {
      console.error("[QB] Upsert failed — code:", upsertError.code);
      console.error("[QB] Upsert failed — message:", upsertError.message);
      console.error("[QB] Upsert failed — details:", upsertError.details);
      console.error("[QB] Upsert failed — hint:", upsertError.hint);
      throw new Error(
        `Failed to save QuickBooks connection: ${upsertError.message}`,
      );
    }
  } catch (err) {
    console.error("[QB] exchangeCodeForTokens error:", err);
    throw err;
  }

  redirect("/dashboard");
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
