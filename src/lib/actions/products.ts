"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guards";
import type { ProductInput } from "@/lib/types";
import { flag, money, optionalText, text } from "./form-utils";

const PRODUCTS_PATH = "/admin/products";

function revalidateCatalog() {
  revalidatePath(PRODUCTS_PATH);
  revalidatePath("/admin");
  revalidatePath("/portal");
}

export async function saveProduct(formData: FormData): Promise<void> {
  const { store } = await requireAdmin();

  const id = text(formData.get("id"));
  const input: ProductInput = {
    name: text(formData.get("name")),
    categoryId: optionalText(formData.get("categoryId")),
    description: optionalText(formData.get("description")),
    basePrice: money(formData.get("basePrice")),
    unit: text(formData.get("unit")) || "unidad",
    active: flag(formData.get("active")),
  };

  if (!input.name) redirect(`${PRODUCTS_PATH}?error=nombre`);

  if (id) {
    await store.updateProduct(id, input);
  } else {
    await store.createProduct(input);
  }

  revalidateCatalog();
  redirect(`${PRODUCTS_PATH}?saved=${id ? "editado" : "creado"}`);
}

export async function deleteProduct(formData: FormData): Promise<void> {
  const { store } = await requireAdmin();
  const id = text(formData.get("id"));
  if (!id) redirect(PRODUCTS_PATH);

  await store.deleteProduct(id);
  revalidateCatalog();
  redirect(`${PRODUCTS_PATH}?saved=eliminado`);
}

export async function toggleProductActive(formData: FormData): Promise<void> {
  const { store } = await requireAdmin();
  const id = text(formData.get("id"));
  if (!id) redirect(PRODUCTS_PATH);

  const products = await store.listProducts();
  const product = products.find((item) => item.id === id);
  if (!product) redirect(PRODUCTS_PATH);

  await store.updateProduct(id, {
    name: product.name,
    categoryId: product.categoryId,
    description: product.description,
    basePrice: product.basePrice,
    unit: product.unit,
    active: !product.active,
  });

  revalidateCatalog();
  redirect(`${PRODUCTS_PATH}?saved=${product.active ? "desactivado" : "activado"}`);
}
