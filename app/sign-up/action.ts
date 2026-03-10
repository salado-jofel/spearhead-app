"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function signup(formData: FormData) {
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
    redirect("/error?message=" + encodeURIComponent(error.message));
  }

  redirect("/verify-email");
}
