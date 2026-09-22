/**
 * Configuración de la DEMO.
 *
 * Modo híbrido:
 *  - Si existen NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY
 *    => la app usa Supabase real (PostgreSQL + RLS + Supabase Auth).
 *  - Si no existen => la app arranca en MODO DEMO con datos locales
 *    (misma forma de datos, sin backend externo).
 */

export const DEMO_ORG_ID = "11111111-1111-1111-1111-111111111111";
export const DEMO_ORG_NAME = "Distribuidora Central";

export const DEMO_ADMIN_EMAIL =
  process.env.DEMO_ADMIN_EMAIL ?? "admin@distribuidora.com";
export const DEMO_CLIENT_EMAIL =
  process.env.DEMO_CLIENT_EMAIL ?? "cliente@almacencentral.com";
export const DEMO_PASSWORD = process.env.DEMO_PASSWORD ?? "demo1234";

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

/** Cookie de sesión usada SOLO en modo demo (sin Supabase). */
export const DEMO_SESSION_COOKIE = "distribuidora_demo_role";

export function supabaseConfig(): { url: string; anonKey: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );
  }
  return { url, anonKey };
}
