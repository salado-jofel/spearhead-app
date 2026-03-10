"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function login(
  prevState: any,
  formData: FormData,
): Promise<{ error: string } | undefined> {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Instead of redirecting with a query param, we return the error object
    return { error: error.message };
  }

  // If successful, redirect
  redirect("/dashboard");
}
