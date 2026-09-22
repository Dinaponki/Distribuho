"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { submitOrder, type SubmitOrderResult } from "@/lib/actions/orders";
import { btnPrimary, btnSecondary, cn } from "@/components/ui";
import { formatMoney, formatUnit } from "@/lib/format";
import { useCart, type CartLine } from "./CartProvider";

type SendState =
  | { status: "idle" }
  | { status: "sending" }
  | { status: "done"; result: Extract<SubmitOrderResult, { ok: true }> }
  | { status: "error"; message: string };

export function CartPanel() {
  const {
    lines,
    count,
    subtotal,
    isOpen,
    closeCart,
    setQuantity,
    removeLine,
    clear,
    online,
  } = useCart();
  const router = useRouter();
  const [sendState, setSendState] = useState<SendState>({ status: "idle" });

  if (!isOpen) return null;

  async function handleConfirm() {
    setSendState({ status: "sending" });
    const result = await submitOrder(
      lines.map((line) => ({
        productId: line.productId,
        quantity: line.quantity,
      })),
    );

    if (!result.ok) {
      setSendState({ status: "error", message: result.error });
      return;
    }

    clear();
    setSendState({ status: "done", result });
    router.refresh();
  }

  const confirmed = sendState.status === "done";

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Cerrar carrito"
        onClick={closeCart}
        className="absolute inset-0 h-full w-full bg-slate-900/40"
      />

      <aside className="relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              {confirmed ? "Pedido enviado" : "Tu pedido"}
            </h2>
            <p className="text-xs text-slate-500">
              {confirmed
                ? "La distribuidora ya lo recibió"
                : `${count} ${count === 1 ? "unidad" : "unidades"}`}
            </p>
          </div>
          <button
            type="button"
            onClick={closeCart}
            className="rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-500 hover:bg-slate-100"
          >
            Cerrar
          </button>
        </header>

        {confirmed ? (
          <CartSuccess
            number={
              sendState.status === "done" ? sendState.result.number : ""
            }
            total={sendState.status === "done" ? sendState.result.total : 0}
            onClose={closeCart}
          />
        ) : (
          <>
            <CartLines
              lines={lines}
              onChangeQuantity={setQuantity}
              onRemove={removeLine}
            />
            <footer className="border-t border-slate-200 px-5 py-4">
              {!online ? (
                <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
                  Sin conexión. Podés seguir cargando productos: se guardan en
                  este dispositivo y podrás enviar el pedido cuando vuelva la
                  señal.
                </p>
              ) : null}

              {sendState.status === "error" ? (
                <p className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
                  {sendState.message}
                </p>
              ) : null}

              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-slate-500">Subtotal</span>
                <span className="text-xl font-bold text-slate-900">
                  {formatMoney(subtotal)}
                </span>
              </div>

              <button
                type="button"
                onClick={handleConfirm}
                disabled={
                  lines.length === 0 || !online || sendState.status === "sending"
                }
                className={cn(btnPrimary, "w-full py-3 text-base")}
              >
                {sendState.status === "sending"
                  ? "Enviando pedido…"
                  : "Confirmar pedido"}
              </button>
              <p className="mt-2 text-center text-xs text-slate-500">
                El pedido llega directo al panel de la distribuidora.
              </p>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}

function CartLines({
  lines,
  onChangeQuantity,
  onRemove,
}: {
  lines: CartLine[];
  onChangeQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}) {
  if (lines.length === 0) {
    return (
      <div className="flex-1 px-5 py-4">
        <p className="mt-10 text-center text-sm text-slate-500">
          Todavía no agregaste productos. Sumá los que necesites y confirmá el
          pedido.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-5 py-4">
      <ul className="flex flex-col gap-3">
        {lines.map((line) => (
          <li key={line.productId} className="rounded-lg border border-slate-200 p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-800">{line.name}</p>
                <p className="text-xs text-slate-500">
                  {formatUnit(line.unit)} · {formatMoney(line.price)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onRemove(line.productId)}
                className="text-xs font-semibold text-slate-400 hover:text-rose-600"
              >
                Eliminar
              </button>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center rounded-lg border border-slate-300">
                <button
                  type="button"
                  aria-label={`Quitar una unidad de ${line.name}`}
                  onClick={() => onChangeQuantity(line.productId, line.quantity - 1)}
                  className="h-9 w-9 text-lg font-semibold text-slate-600 hover:bg-slate-100"
                >
                  −
                </button>
                <input
                  type="number"
                  min={1}
                  value={line.quantity}
                  onChange={(event) =>
                    onChangeQuantity(line.productId, Number(event.target.value) || 1)
                  }
                  className="h-9 w-14 border-x border-slate-200 text-center text-sm font-semibold outline-none"
                />
                <button
                  type="button"
                  aria-label={`Agregar una unidad de ${line.name}`}
                  onClick={() => onChangeQuantity(line.productId, line.quantity + 1)}
                  className="h-9 w-9 text-lg font-semibold text-slate-600 hover:bg-slate-100"
                >
                  +
                </button>
              </div>
              <p className="text-sm font-semibold text-slate-900">
                {formatMoney(line.quantity * line.price)}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CartSuccess({
  number,
  total,
  onClose,
}: {
  number: string;
  total: number;
  onClose: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl text-emerald-700">
        ✓
      </div>
      <div>
        <p className="text-lg font-semibold text-slate-900">
          Pedido enviado correctamente
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Número de pedido{" "}
          <span className="font-mono font-semibold text-slate-800">{number}</span>
        </p>
        <p className="mt-1 text-sm text-slate-500">Total {formatMoney(total)}</p>
      </div>
      <div className="flex w-full flex-col gap-2">
        <Link href="/portal/orders" onClick={onClose} className={btnPrimary}>
          Ver mis pedidos
        </Link>
        <button type="button" onClick={onClose} className={btnSecondary}>
          Seguir comprando
        </button>
      </div>
    </div>
  );
}
