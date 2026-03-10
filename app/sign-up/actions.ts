"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function signup(
  prevState: any,
  formData: FormData,
): Promise<{ error: string } | undefined> {
  // No need to import cookies here anymore, createClient handles it!
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  // ... rest of your code ...

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: formData.get("firstName"),
        last_name: formData.get("lastName"),
        username: formData.get("username"),
      },
    },
  });

  if (error) {
    // Instead of redirecting with a query param, we return the error object
    return { error: error.message };
  }

  redirect("/verify-email");
}
