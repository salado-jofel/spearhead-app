"use server";

import OAuthClient from "intuit-oauth";
import { createClient } from "@/utils/supabase/server";
import { createQBClient } from "@/utils/quickbooks/client";
import { redirect } from "next/navigation";

export async function signIn(
  prevState: any,
  formData: FormData,
): Promise<{ error: string } | undefined> {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // ── Step 1: Sign in with Supabase ─────────────────────────────────────────
  // Must be first — we need an authenticated user to store QB OAuth state
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { error: error.message };

  // ── Step 2: Check QB connection ───────────────────────────────────────────
  const client = createQBClient();

  const hasTokens =
    !!process.env.QB_ACCESS_TOKEN &&
    !!process.env.QB_REFRESH_TOKEN &&
    !!process.env.QB_REALM_ID;

  if (hasTokens) {
    client.setToken({
      access_token: process.env.QB_ACCESS_TOKEN!,
      refresh_token: process.env.QB_REFRESH_TOKEN!,
      realmId: process.env.QB_REALM_ID!,
      token_type: "bearer",
      expires_in: 3600,
      x_refresh_token_expires_in: 8726400,
    });

    // Token valid — go straight to dashboard
    if (client.isAccessTokenValid()) {
      redirect("/dashboard");
    }

    // Token expired — try silent refresh
    try {
      await client.refresh();
      redirect("/dashboard"); // Refresh worked — all good
    } catch {
      // Refresh failed — fall through to full QB OAuth below
    }
  }

  // ── Step 3: QB not connected or fully expired → trigger OAuth ─────────────
  // User is now signed in so we can safely store state in user metadata
  const state = crypto.randomUUID();

  await supabase.auth.updateUser({
    data: {
      qb_oauth_state: state,
      qb_oauth_state_exp: Date.now() + 10 * 60 * 1000, // 10 min
    },
  });

  const authUri = client.authorizeUri({
    scope: [OAuthClient.scopes.Accounting],
    state,
  });

  redirect(authUri); // ✅ User goes to Intuit login page
}
