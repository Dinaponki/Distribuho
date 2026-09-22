"use client";

import { useFormStatus } from "react-dom";
import { btnDanger, btnPrimary, btnSecondary, cn } from "@/components/ui";

/**
 * Botón de submit para formularios con Server Actions.
 * Muestra el estado pendiente y puede pedir confirmación.
 */
export function SubmitButton({
  children,
  pendingLabel = "Guardando…",
  variant = "primary",
  className,
  confirmMessage,
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  variant?: "primary" | "secondary" | "danger";
  className?: string;
  confirmMessage?: string;
}) {
  const { pending } = useFormStatus();

  const base =
    variant === "primary" ? btnPrimary : variant === "danger" ? btnDanger : btnSecondary;

  return (
    <button
      type="submit"
      disabled={pending}
      onClick={
        confirmMessage
          ? (event) => {
              if (!window.confirm(confirmMessage)) event.preventDefault();
            }
          : undefined
      }
      className={cn(base, className)}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
