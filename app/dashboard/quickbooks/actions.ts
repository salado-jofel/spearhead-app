"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { createQuickBooksInvoice } from "../orders/quickbooks-actions";

const QB_CLIENT_ID = process.env.QB_CLIENT_ID!;
const QB_CLIENT_SECRET = process.env.QB_CLIENT_SECRET!;
const QB_REDIRECT_URI = process.env.QB_REDIRECT_URI!;
const QB_ENVIRONMENT = process.env.QB_ENVIRONMENT || "sandbox";

const QB_AUTH_URL = "https://appcenter.intuit.com/connect/oauth2";
const QB_TOKEN_URL =
  "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer";
const QB_COMPANY_URL =
  QB_ENVIRONMENT === "sandbox"
    ? "https://sandbox-quickbooks.api.intuit.com"
    : "https://quickbooks.api.intuit.com";

// ─── Generate OAuth URL ───────────────────────────────────────────────────────
export async function getQuickBooksAuthUrl(): Promise<string> {
  const scopes = ["com.intuit.quickbooks.accounting"].join(" ");

  const params = new URLSearchParams({
    client_id: QB_CLIENT_ID,
    redirect_uri: QB_REDIRECT_URI,
    response_type: "code",
    scope: scopes,
    state: crypto.randomUUID(),
  });

  return `${QB_AUTH_URL}?${params.toString()}`;
}

// ─── Exchange Code for Tokens ─────────────────────────────────────────────────
export async function exchangeCodeForTokens(
  code: string,
  realmId: string,
): Promise<void> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) throw new Error("User not authenticated");

    // Debug logs
    console.log("[QB] CLIENT_ID exists:", !!QB_CLIENT_ID);
    console.log("[QB] CLIENT_SECRET exists:", !!QB_CLIENT_SECRET);
    console.log("[QB] REDIRECT_URI:", QB_REDIRECT_URI);
    console.log("[QB] CODE length:", code?.length);
    console.log("[QB] REALM_ID:", realmId);

    const credentials = btoa(`${QB_CLIENT_ID}:${QB_CLIENT_SECRET}`);

    const bodyParams = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: QB_REDIRECT_URI,
    });

    console.log("[QB] Requesting token from:", QB_TOKEN_URL);

    const response = await fetch(QB_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${credentials}`,
        Accept: "application/json",
      },
      body: bodyParams.toString(),
    });

    const responseText = await response.text();
    console.log("[QB] Token response status:", response.status);
    console.log("[QB] Token response body:", responseText);

    if (!response.ok) {
      throw new Error(
        `Token exchange failed: ${response.status} - ${responseText}`,
      );
    }

    const tokens = JSON.parse(responseText);

    // Get company info
    const companyResponse = await fetch(
      `${QB_COMPANY_URL}/v3/company/${realmId}/companyinfo/${realmId}?minorversion=65`,
      {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
          Accept: "application/json",
        },
      },
    );

    console.log("[QB] Company response status:", companyResponse.status);

    let companyName = "Unknown Company";
    if (companyResponse.ok) {
      const companyData = await companyResponse.json();
      companyName = companyData?.CompanyInfo?.CompanyName ?? "Unknown Company";
    }

    const now = new Date();
    const accessTokenExpiresAt = new Date(
      now.getTime() + tokens.expires_in * 1000,
    );
    const refreshTokenExpiresAt = new Date(
      now.getTime() + tokens.x_refresh_token_expires_in * 1000,
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
        environment: QB_ENVIRONMENT,
        updated_at: now.toISOString(),
      });

    if (upsertError) {
      console.error("[QB] Upsert error:", upsertError);
      throw new Error("Failed to save QuickBooks connection");
    }

    console.log("[QB] Connection saved successfully!");
  } catch (err) {
    console.error("[QB] exchangeCodeForTokens error:", err);
    throw err;
  }

  redirect("/dashboard/quickbooks");
}

// ─── Get QB Connection ────────────────────────────────────────────────────────
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

// ─── Disconnect QB ────────────────────────────────────────────────────────────
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


export async function syncAllOrdersToQuickBooks(): Promise<{
  success: number;
  failed: number;
  messages: string[];
}> {
  const supabase = await createClient();
  const { data: orders, error } = await supabase
    .from("orders")
    .select("id, order_id, qb_invoice_id")
    .is("qb_invoice_id", null);

  if (error || !orders) {
    return {
      success: 0,
      failed: 1,
      messages: ["Failed to fetch unsynced orders"],
    };
  }

  let success = 0;
  let failed = 0;
  const messages: string[] = [];

  for (const order of orders) {
    const result = await createQuickBooksInvoice(order.id);
    if (result.success) {
      success++;
      messages.push(`✅ ${order.order_id} synced`);
    } else {
      failed++;
      messages.push(`❌ ${order.order_id}: ${result.message}`);
    }
  }

  return { success, failed, messages };
}
