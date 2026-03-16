"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { getQuickBooksConnection } from "@/app/dashboard/quickbooks/actions";
import { QB_CONFIG } from "@/utils/quickbooks/config";

export async function login(
  prevState: any,
  formData: FormData,
): Promise<{ error: string } | undefined> {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // ── Step 1: Supabase authentication ──────────────────────────────────────────
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  // ── Step 2: Check QuickBooks connection ──────────────────────────────────────
  const qbConnection = await getQuickBooksConnection();

  const isQBValid =
    qbConnection !== null &&
    new Date(qbConnection.access_token_expires_at) > new Date();

  // ── Step 3: Route ─────────────────────────────────────────────────────────────
  if (!isQBValid) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const state = crypto.randomUUID();
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
  }

  redirect("/dashboard");
}
