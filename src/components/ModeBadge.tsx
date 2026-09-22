import { isSupabaseConfigured } from "@/lib/config";
import { Badge } from "@/components/ui";

/** Indica si la demo corre con datos locales o contra Supabase real. */
export function ModeBadge() {
  return isSupabaseConfigured() ? (
    <Badge tone="emerald">Supabase conectado</Badge>
  ) : (
    <Badge tone="amber">Datos demo locales</Badge>
  );
}
