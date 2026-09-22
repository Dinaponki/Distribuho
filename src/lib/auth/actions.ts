"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  DEMO_ADMIN_EMAIL,
  DEMO_CLIENT_EMAIL,
  DEMO_PASSWORD,
  DEMO_SESSION_COOKIE,
  isSupabaseConfigured,
} from "@/lib/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Role } from "@/lib/types";

/** Acepta un destino interno seguro (?next=/admin/...) o el default del rol. */
function safeRedirect(value: string | null | undefined, fallback: string) {
  if (value && value.startsWith("/") && !value.startsWith("//")) return value;
  return fallback;
}

/**
 * Login de la DEMO.
 * Sin Supabase: se marca el rol en una cookie (no hay backend de auth).
 * Con Supabase: se autentica contra Supabase Auth con los usuarios del seed.
 */
export async function signIn(
  role: Role,
  next?: string | null,
): Promise<void> {
  const destination = safeRedirect(
    next,
    role === "ADMIN" ? "/admin" : "/portal",
  );

  if (!isSupabaseConfigured()) {
    const cookieStore = await cookies();
    cookieStore.set(DEMO_SESSION_COOKIE, role, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
    });
    redirect(destination);
  }

  const email = role === "ADMIN" ? DEMO_ADMIN_EMAIL : DEMO_CLIENT_EMAIL;
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: DEMO_PASSWORD,
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect(destination);
}

export async function signInAsAdmin(formData: FormData): Promise<void> {
  const next = formData.get("next");
  await signIn("ADMIN", typeof next === "string" ? next : null);
}

export async function signInAsClient(formData: FormData): Promise<void> {
  const next = formData.get("next");
  await signIn("CLIENT", typeof next === "string" ? next : null);
}

export async function signOut(): Promise<void> {
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }

  const cookieStore = await cookies();
  cookieStore.delete(DEMO_SESSION_COOKIE);
  redirect("/login");
}
