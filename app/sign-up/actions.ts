"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function signup(
  prevState: any,
  formData: FormData,
): Promise<{ error: string } | undefined> {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const username = formData.get("username") as string;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        full_name: `${firstName} ${lastName}`.trim(),
        username,
      },
    },
  });

  // ── Log the full error so we can see exactly what's failing ──
  if (error) {
    console.error("[signup] Supabase error:", {
      message: error.message,
      status: error.status,
      name: error.name,
    });
    return { error: error.message };
  }

  // ── Handle case where user already exists ─────────────────────
  if (data.user && data.user.identities?.length === 0) {
    return { error: "An account with this email already exists." };
  }

  redirect("/verify-email");
}
