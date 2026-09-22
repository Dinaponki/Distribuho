"use client";

import { btnPrimary, cn, inputClass } from "@/components/ui";
import { useCart, type CartProduct } from "./CartProvider";

/** Botón "Agregar" que se transforma en selector de cantidad una vez en el carrito. */
export function AddToCart({ product }: { product: CartProduct }) {
  const { quantityOf, addLine, setQuantity, hydrated } = useCart();
  const quantity = hydrated ? quantityOf(product.id) : 0;

  if (quantity === 0) {
    return (
      <button
        type="button"
        disabled={!hydrated}
        onClick={() => addLine(product)}
        className={cn(btnPrimary, "w-full py-2.5")}
      >
        Agregar
      </button>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center rounded-lg border border-brand-200 bg-brand-50">
        <button
          type="button"
          aria-label={`Quitar una unidad de ${product.name}`}
          onClick={() => setQuantity(product.id, quantity - 1)}
          className="h-10 w-10 text-lg font-semibold text-brand-700 hover:bg-brand-100"
        >
          −
        </button>
        <input
          type="number"
          min={1}
          value={quantity}
          onChange={(event) =>
            setQuantity(product.id, Math.trunc(Number(event.target.value)) || 1)
          }
          className={cn(
            inputClass,
            "h-10 w-16 rounded-none border-x border-y-0 border-brand-200 bg-transparent text-center font-semibold shadow-none focus:ring-0",
          )}
        />
        <button
          type="button"
          aria-label={`Agregar una unidad de ${product.name}`}
          onClick={() => setQuantity(product.id, quantity + 1)}
          className="h-10 w-10 text-lg font-semibold text-brand-700 hover:bg-brand-100"
        >
          +
        </button>
      </div>
      <span className="text-xs font-semibold text-brand-700">En el pedido</span>
    </div>
  );
}
