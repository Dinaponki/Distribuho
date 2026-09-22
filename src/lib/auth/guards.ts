import { redirect } from "next/navigation";
import { getDataStore, type DataStore } from "@/lib/data";
import type { Session } from "@/lib/types";
import { getSession } from "./session";

/**
 * Guardas de servidor (no dependen sólo del proxy).
 * Valida sesión + rol y entrega el store ya acotado a la organización.
 */
export async function requireAdmin(): Promise<{
  session: Session;
  store: DataStore;
}> {
  const session = await getSession();
  if (!session) redirect("/login?next=/admin");
  if (session.role !== "ADMIN") redirect("/portal");

  return { session, store: await getDataStore() };
}

export async function requireClient(): Promise<{
  session: Session;
  store: DataStore;
}> {
  const session = await getSession();
  if (!session) redirect("/login?next=/portal");
  if (session.role !== "CLIENT") redirect("/admin");

  return { session, store: await getDataStore() };
}
