"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import {
  getQuickBooksAuthUrl,
  getQuickBooksConnection,
} from "@/app/dashboard/quickbooks/actions";

export async function login(
  prevState: any,
  formData: FormData,
): Promise<{ error: string } | undefined> {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // ── Step 1: Supabase authentication ──────────────────
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  // ── Step 2: Check QuickBooks connection ──────────────
  const qbConnection = await getQuickBooksConnection();

  const isQBValid =
    qbConnection !== null &&
    new Date(qbConnection.access_token_expires_at) > new Date();

  // ── Step 3: Route ─────────────────────────────────────
  if (!isQBValid) {
    // No gate page — go straight to Intuit OAuth
    const authUrl = await getQuickBooksAuthUrl();
    redirect(authUrl);
  }

  redirect("/dashboard");
}
