"use client";

import { useFormStatus } from "react-dom";
import { inputClass } from "@/components/ui";
import { ORDER_STATUSES, ORDER_STATUS_LABEL, type OrderStatus } from "@/lib/types";

function PendingHint() {
  const { pending } = useFormStatus();
  return (
    <span className="text-xs font-medium text-slate-500">
      {pending ? "Actualizando…" : "El cambio se guarda al instante"}
    </span>
  );
}

/**
 * Selector de estado del pedido: al cambiar, envía el formulario
 * (Server Action) y actualiza la base de datos.
 */
export function StatusSelect({ current }: { current: OrderStatus }) {
  return (
    <>
      <select
        name="status"
        defaultValue={current}
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
        className={inputClass}
      >
        {ORDER_STATUSES.map((status) => (
          <option key={status} value={status}>
            {ORDER_STATUS_LABEL[status]}
          </option>
        ))}
      </select>
      <PendingHint />
    </>
  );
}
