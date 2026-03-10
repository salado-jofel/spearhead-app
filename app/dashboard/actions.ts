"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function signOut() {
  const supabase = await createClient();

  // 1. Check if a user session exists before trying to sign out
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await supabase.auth.signOut();
  }

  // 2. Clear the cache for the dashboard so the next user doesn't see old data
  revalidatePath("/", "layout");

  // 3. Send them back to the login page
  redirect("/sign-in");
}
