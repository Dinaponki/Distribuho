import { cookies } from "next/headers";
import { DEMO_SESSION_COOKIE, isSupabaseConfigured } from "@/lib/config";
import { DEMO_USERS, ORGANIZATION } from "@/lib/demo/data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Role, Session } from "@/lib/types";

export { DEMO_SESSION_COOKIE };

export function isDemoMode(): boolean {
  return !isSupabaseConfigured();
}

async function getDemoSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const role = cookieStore.get(DEMO_SESSION_COOKIE)?.value;
  if (role !== "ADMIN" && role !== "CLIENT") return null;

  const user = role === "ADMIN" ? DEMO_USERS.admin : DEMO_USERS.client;
  return {
    mode: "demo",
    userId: user.id,
    email: user.email,
    fullName: user.fullName,
    role,
    organizationId: ORGANIZATION.id,
    organizationName: ORGANIZATION.name,
    customerId: user.customerId,
    customerName: user.customerId ? "Almacén Central" : null,
  };
}


type ProfileRow = {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  organization_id: string;
  customer_id: string | null;
  organizations: { name: string } | null;
  customers: { name: string } | null;
};

async function getSupabaseSession(): Promise<Session | null> {
  const client = await createSupabaseServerClient();

  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) return null;

  const { data } = await client
    .from("users")
    .select(
      "id, email, full_name, role, organization_id, customer_id, organizations(name), customers(name)",
    )
    .eq("id", user.id)
    .maybeSingle<ProfileRow>();

  const profile = data;
  if (!profile) return null;

  return {
    mode: "supabase",
    userId: profile.id,
    email: profile.email,
    fullName: profile.full_name,
    role: profile.role,
    organizationId: profile.organization_id,
    organizationName: profile.organizations?.name ?? "Mi distribuidora",
    customerId: profile.customer_id,
    customerName: profile.customers?.name ?? null,
  };
}

/** Sesión actual (o null si no hay login). */
export async function getSession(): Promise<Session | null> {
  if (isDemoMode()) return getDemoSession();
  return getSupabaseSession();
}
