"use server";

import { revalidatePath } from "next/cache";
import { requireClient } from "@/lib/auth/guards";
import { getDataStore } from "@/lib/data";
import type { NewOrderLine } from "@/lib/types";

export type SubmitOrderResult =
  | { ok: true; number: string; total: number }
  | { ok: false; error: string };

/**
 * Crea el pedido del cliente.
 * Sólo se reciben productId + cantidad: los precios se resuelven en el servidor.
 */
export async function submitOrder(
  lines: NewOrderLine[],
): Promise<SubmitOrderResult> {
  const { session } = await requireClient();

  if (!session.customerId) {
    return {
      ok: false,
      error: "Tu usuario no está asociado a un cliente. Contactá a la distribuidora.",
    };
  }

  const cleanLines: NewOrderLine[] = [];
  for (const line of Array.isArray(lines) ? lines : []) {
    if (!line || typeof line.productId !== "string") continue;
    const quantity = Math.trunc(Number(line.quantity));
    if (!Number.isFinite(quantity) || quantity < 1) continue;
    cleanLines.push({ productId: line.productId, quantity: Math.min(9999, quantity) });
  }

  if (cleanLines.length === 0) {
    return { ok: false, error: "Tu pedido no tiene productos." };
  }

  try {
    const store = await getDataStore();
    const order = await store.createOrder({
      customerId: session.customerId,
      lines: cleanLines,
    });

    revalidatePath("/portal/orders");
    revalidatePath("/admin");
    revalidatePath("/admin/orders");

    return { ok: true, number: order.number, total: order.total };
  } catch (error) {
    console.error("Error al crear el pedido", error);
    return {
      ok: false,
      error: "No pudimos enviar el pedido. Volvé a intentar en unos segundos.",
    };
  }
}
