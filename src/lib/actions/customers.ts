"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guards";
import type { CustomerInput } from "@/lib/types";
import { flag, optionalMoney, optionalText, text } from "./form-utils";

const CUSTOMERS_PATH = "/admin/customers";

export async function saveCustomer(formData: FormData): Promise<void> {
  const { store } = await requireAdmin();

  const id = text(formData.get("id"));
  const input: CustomerInput = {
    name: text(formData.get("name")),
    company: optionalText(formData.get("company")),
    email: optionalText(formData.get("email")),
    phone: optionalText(formData.get("phone")),
    address: optionalText(formData.get("address")),
    active: flag(formData.get("active")),
  };

  if (!input.name) redirect(`${CUSTOMERS_PATH}?error=nombre`);

  if (id) {
    await store.updateCustomer(id, input);
  } else {
    await store.createCustomer(input);
  }

  revalidatePath(CUSTOMERS_PATH);
  revalidatePath("/admin");
  redirect(`${CUSTOMERS_PATH}?saved=${id ? "editado" : "creado"}`);
}

/** Precio especial de un producto para un cliente (vacío = volver al precio base). */
export async function saveCustomerPrice(formData: FormData): Promise<void> {
  const { store } = await requireAdmin();

  const customerId = text(formData.get("customerId"));
  const productId = text(formData.get("productId"));
  if (!customerId || !productId) redirect(CUSTOMERS_PATH);

  await store.setCustomerPrice(
    customerId,
    productId,
    optionalMoney(formData.get("price")),
  );

  revalidatePath(`${CUSTOMERS_PATH}/${customerId}`);
  revalidatePath("/portal");
  redirect(`${CUSTOMERS_PATH}/${customerId}?saved=${encodeURIComponent(productId)}`);
}
