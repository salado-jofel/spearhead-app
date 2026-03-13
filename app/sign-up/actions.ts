"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function signup(
  prevState: unknown,
  formData: FormData,
): Promise<{ error: string } | undefined> {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const firstName = formData.get("first_name") as string;
  const lastName = formData.get("last_name") as string;
  const phone = formData.get("phone") as string;
  const role = (formData.get("role") as string) || "sales_representative";

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        full_name: `${firstName} ${lastName}`.trim(),
        role,
      },
    },
  });

  if (error) {
    console.error("[signup] Supabase error:", error.message);
    return { error: error.message };
  }

  if (data.user && data.user.identities?.length === 0) {
    return { error: "An account with this email already exists." };
  }

  // Upsert profile with role
  if (data.user) {
    const { error: profileError } = await supabase.from("profiles").upsert({
      id: data.user.id,
      email,
      first_name: firstName,
      last_name: lastName,
      phone,
      role,
    });

    if (profileError) {
      console.error("[signup] Profile upsert error:", profileError.message);
    }
  }

  redirect("/verify-email");
}
