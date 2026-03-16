// app/dashboard/quickbooks/actions.ts  ← UPDATE (replaces the whole file)
"use server";

import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { QB_CONFIG } from "@/utils/quickbooks/config";

const QB_STATE_COOKIE = "qb_oauth_state";

// ── Generate OAuth URL ────────────────────────────────────────────────────────

export async function getQuickBooksAuthUrl(): Promise<string> {
  const state = crypto.randomUUID();

  // Store state in a short-lived httpOnly cookie for CSRF verification on callback
  (await cookies()).set(QB_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 10, // 10 minutes
    path: "/",
  });

  const params = new URLSearchParams({
    client_id: QB_CONFIG.clientId,
    redirect_uri: QB_CONFIG.redirectUri,
    response_type: "code",
    scope: "com.intuit.quickbooks.accounting",
    state,
  });

  return `${QB_CONFIG.authUrl}?${params.toString()}`;
}

// ── Exchange Code for Tokens ──────────────────────────────────────────────────

export async function exchangeCodeForTokens(
  code: string,
  realmId: string,
  returnedState: string, // ← was "p0" — now named and actually used ✅
): Promise<void> {
  try {
    // ── Verify OAuth state (CSRF protection) ──────────────────────────────────
    const cookieStore = await cookies();
    const storedState = cookieStore.get(QB_STATE_COOKIE)?.value;
    cookieStore.delete(QB_STATE_COOKIE); // consume immediately — one-time use

    if (!storedState || storedState !== returnedState) {
      throw new Error("OAuth state mismatch — possible CSRF attack.");
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("User not authenticated");

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

    // ── Safe JSON parse ───────────────────────────────────────────────────────
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
      .upsert({
        user_id: user.id,
        realm_id: realmId,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        access_token_expires_at: accessTokenExpiresAt.toISOString(),
        refresh_token_expires_at: refreshTokenExpiresAt.toISOString(),
        company_name: companyName,
        environment: QB_CONFIG.environment,
        updated_at: now.toISOString(),
      });

    if (upsertError) throw new Error("Failed to save QuickBooks connection");
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

// ── NOTE ──────────────────────────────────────────────────────────────────────
// getValidAccessToken → lives in utils/quickbooks/client.ts (DO NOT duplicate here)
// syncAllOrdersToQuickBooks → moved to dashboard/orders/quickbooks-actions.ts
