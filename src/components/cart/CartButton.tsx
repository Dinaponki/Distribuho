"use client";

import { formatMoney } from "@/lib/format";
import { cn } from "@/components/ui";
import { useCart } from "./CartProvider";

export function CartButton() {
  const { count, subtotal, openCart, hydrated } = useCart();
  const showSummary = hydrated && count > 0;

  return (
    <button
      type="button"
      onClick={openCart}
      className={cn(
        "relative inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition sm:px-4",
        showSummary
          ? "bg-brand-600 text-white hover:bg-brand-700"
          : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
      )}
    >
      <span>Mi pedido</span>
      <span
        className={cn(
          "flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs font-bold",
          showSummary ? "bg-white text-brand-700" : "bg-slate-100 text-slate-600",
        )}
      >
        {showSummary ? count : 0}
      </span>
      {showSummary ? (
        <span className="hidden font-mono text-xs font-semibold sm:inline">
          {formatMoney(subtotal)}
        </span>
      ) : null}
    </button>
  );
}

export function OfflineIndicator() {
  const { online } = useCart();
  if (online) return null;

  return (
    <div className="bg-amber-100 px-4 py-2 text-center text-xs font-semibold text-amber-900">
      Sin conexión — tus cambios se guardan en este dispositivo y los vas a
      recuperar al volver.
    </div>
  );
}
