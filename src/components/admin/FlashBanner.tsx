import { cn } from "@/components/ui";

const SAVED_LABELS: Record<string, string> = {
  creado: "Registro creado correctamente.",
  editado: "Cambios guardados correctamente.",
  eliminado: "Registro eliminado.",
  activado: "Registro activado.",
  desactivado: "Registro desactivado.",
};

/** Mensaje de confirmación/error para operaciones del panel. */
export function FlashBanner({
  saved,
  error,
  errorMessage = "Revisá los datos: falta información obligatoria.",
}: {
  saved?: string | null;
  error?: string | null;
  errorMessage?: string;
}) {
  if (error) {
    return (
      <p className="rounded-lg bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
        {errorMessage}
      </p>
    );
  }

  if (!saved) return null;

  return (
    <p
      className={cn(
        "rounded-lg px-4 py-3 text-sm font-medium",
        "bg-emerald-50 text-emerald-800",
      )}
    >
      {SAVED_LABELS[saved] ?? "Cambios guardados correctamente."}
    </p>
  );
}
