"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guards";
import { isOrderStatus } from "@/lib/types";
import { text } from "./form-utils";

/** Cambia el estado de un pedido desde el panel de la distribuidora. */
export async function updateOrderStatus(formData: FormData): Promise<void> {
  const { store } = await requireAdmin();

  const orderId = text(formData.get("orderId"));
  const status = text(formData.get("status"));
  if (!orderId || !isOrderStatus(status)) redirect("/admin/orders");

  await store.updateOrderStatus(orderId, status);

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin");
  revalidatePath("/portal/orders");
  redirect(`/admin/orders/${orderId}?saved=${encodeURIComponent(status)}`);
}
