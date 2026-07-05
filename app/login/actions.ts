"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function login(formData: FormData): Promise<{ error: string } | void> {
  const username = String(formData.get("username") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!username || !password) {
    return { error: "Ingresá usuario y contraseña." };
  }

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("email")
    .eq("username", username)
    .maybeSingle();

  if (!profile) {
    return { error: "Usuario o contraseña incorrectos." };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: profile.email,
    password,
  });

  if (error) {
    return { error: "Usuario o contraseña incorrectos." };
  }

  redirect("/");
}
