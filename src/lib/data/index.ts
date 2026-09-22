import { getSession } from "@/lib/auth/session";
import { isSupabaseConfigured } from "@/lib/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createDemoStore } from "./demo-store";
import { createSupabaseStore } from "./supabase-store";
import type { DataStore } from "./store";

export type { DataStore } from "./store";

/**
 * Devuelve el acceso a datos ya acotado a la organización de la sesión.
 *  - Supabase configurado → cliente con RLS (nunca acepta org del navegador)
 *  - Sin Supabase         → base local de la demo
 */
export async function getDataStore(): Promise<DataStore> {
  if (!isSupabaseConfigured()) return createDemoStore();

  const session = await getSession();
  if (!session) throw new Error("Se requiere sesión activa");

  const client = await createSupabaseServerClient();
  return createSupabaseStore(client, session);
}
