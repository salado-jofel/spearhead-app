"use server";

import { createClient } from "@/utils/supabase/server";

const QB_TOKEN_URL =
  "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer";
const QB_ENVIRONMENT = process.env.QB_ENVIRONMENT || "sandbox";
const QB_CLIENT_ID = process.env.QB_CLIENT_ID!;
const QB_CLIENT_SECRET = process.env.QB_CLIENT_SECRET!;

const QB_BASE_URL =
  QB_ENVIRONMENT === "sandbox"
    ? "https://sandbox-quickbooks.api.intuit.com"
    : "https://quickbooks.api.intuit.com";

// ─── Get valid access token (refresh if expired) ──────────────────────────────
export async function getValidAccessToken(): Promise<{
  accessToken: string;
  realmId: string;
} | null> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: connection, error } = await supabase
      .from("quickbooks_connections")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error || !connection) return null;

    const now = new Date();
    const accessExpiry = new Date(connection.access_token_expires_at);

    // Token still valid
    if (accessExpiry > now) {
      return {
        accessToken: connection.access_token,
        realmId: connection.realm_id,
      };
    }

    // Token expired — refresh it

    const credentials = btoa(`${QB_CLIENT_ID}:${QB_CLIENT_SECRET}`);

    const response = await fetch(QB_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${credentials}`,
        Accept: "application/json",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: connection.refresh_token,
      }).toString(),
    });

    if (!response.ok) {
      console.error("[QB Client] Token refresh failed:", response.status);
      return null;
    }

    const tokens = await response.json();

    const newAccessExpiry = new Date(now.getTime() + tokens.expires_in * 1000);
    const newRefreshExpiry = new Date(
      now.getTime() + tokens.x_refresh_token_expires_in * 1000,
    );

    // Save refreshed tokens
    await supabase
      .from("quickbooks_connections")
      .update({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        access_token_expires_at: newAccessExpiry.toISOString(),
        refresh_token_expires_at: newRefreshExpiry.toISOString(),
        updated_at: now.toISOString(),
      })
      .eq("user_id", user.id);


    return {
      accessToken: tokens.access_token,
      realmId: connection.realm_id,
    };
  } catch (err) {
    console.error("[QB Client] getValidAccessToken error:", err);
    return null;
  }
}

// ─── Make authenticated QB API request ───────────────────────────────────────
export async function qbRequest<T>(
  method: "GET" | "POST" | "PUT" | "DELETE",
  path: string,
  body?: object,
): Promise<T | null> {
  const auth = await getValidAccessToken();

  if (!auth) {
    console.error("[QB Client] No valid access token");
    return null;
  }

  const url = `${QB_BASE_URL}/v3/company/${auth.realmId}${path}?minorversion=65`;


  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${auth.accessToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const responseText = await response.text();

  if (!response.ok) {
    console.error(
      `[QB Client] Request failed: ${response.status}`,
      responseText,
    );
    return null;
  }

  return JSON.parse(responseText) as T;
}
