import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseConfig } from "@/lib/config";

/**
 * Cliente Supabase para Server Components / Server Actions.
 * Usa la sesión por cookies: todas las consultas quedan sujetas a RLS.
 * Crear uno NUEVO por request (nunca compartirlo).
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const { url, anonKey } = supabaseConfig();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Llamado desde un Server Component: el refresh de token
          // se encarga en src/proxy.ts
        }
      },
    },
  });
}
