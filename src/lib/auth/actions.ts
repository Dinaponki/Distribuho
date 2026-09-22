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
 * Traduce errores de Supabase Auth a mensajes útiles sin ocultar el problema.
 * "Invalid login credentials" casi siempre significa que falta ejecutar
 * `npm run seed:demo` en ese proyecto de Supabase.
 */
function loginErrorMessage(rawMessage: string): string {
  const message = rawMessage.toLowerCase();

  if (message.includes("invalid login credentials")) {
    return `No existe el usuario demo en este proyecto de Supabase (o su contraseña cambió). Ejecutá "npm run seed:demo" con SUPABASE_SERVICE_ROLE_KEY configurada y volvé a intentar.`;
  }

  if (message.includes("email not confirmed")) {
    return "El usuario demo no tiene el email confirmado. Ejecutá \"npm run seed:demo\" para confirmarlo automáticamente.";
  }

  return rawMessage;
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
    redirect(`/login?error=${encodeURIComponent(loginErrorMessage(error.message))}`);
  }

  // Perfil de negocio: si el usuario autentica pero no tiene fila en public.users
  // (p. ej. se creó por el panel de Supabase a mano), la sesión no funcionaría.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile) {
      redirect(
        `/login?error=${encodeURIComponent(
          "El usuario existe en Supabase Auth pero no tiene perfil en la tabla users. Ejecutá \"npm run seed:demo\" para completar el seed.",
        )}`,
      );
    }
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
