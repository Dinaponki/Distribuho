import Link from "next/link";
import { FlashBanner } from "@/components/admin/FlashBanner";
import { ProductsTable } from "@/components/admin/ProductsTable";
import { SubmitButton } from "@/components/admin/SubmitButton";
import {
  Card,
  Field,
  SectionTitle,
  btnPrimary,
  btnSecondary,
  inputClass,
} from "@/components/ui";
import { saveProduct } from "@/lib/actions/products";
import { requireAdmin } from "@/lib/auth/guards";

const UNITS = ["unidad", "pack", "caja", "kg", "bolsa", "bidón"];

export default async function AdminProductsPage({
  searchParams,
}: PageProps<"/admin/products">) {
  const { store } = await requireAdmin();
  const params = await searchParams;

  const isNew = params.new === "1";
  const editId = typeof params.edit === "string" ? params.edit : "";
  const saved = typeof params.saved === "string" ? params.saved : null;
  const error = typeof params.error === "string" ? params.error : null;

  const [products, categories] = await Promise.all([
    store.listProducts(),
    store.listCategories(),
  ]);

  const editing = editId ? products.find((product) => product.id === editId) : null;
  const showForm = isNew || Boolean(editing);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Productos</h1>
          <p className="mt-1 text-sm text-slate-500">
            {products.length} productos ·{" "}
            {products.filter((product) => product.active).length} activos en el
            portal.
          </p>
        </div>
        {!showForm ? (
          <Link href="/admin/products?new=1" className={btnPrimary}>
            + Nuevo producto
          </Link>
        ) : (
          <Link href="/admin/products" className={btnSecondary}>
            Cerrar formulario
          </Link>
        )}
      </div>

      <FlashBanner
        saved={saved}
        error={error}
        errorMessage="El nombre del producto es obligatorio."
      />

      {showForm ? (
        <Card className="p-5">
          <SectionTitle
            title={editing ? `Editar: ${editing.name}` : "Nuevo producto"}
            description="El precio base se usa cuando el cliente no tiene un precio especial."
          />
          <form action={saveProduct} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {editing ? <input type="hidden" name="id" value={editing.id} /> : null}

            <div className="sm:col-span-2">
              <Field label="Nombre">
                <input
                  name="name"
                  required
                  defaultValue={editing?.name ?? ""}
                  placeholder="Coca-Cola 2.25L"
                  className={inputClass}
                />
              </Field>
            </div>

            <Field label="Categoría">
              <select
                name="categoryId"
                defaultValue={editing?.categoryId ?? ""}
                className={inputClass}
              >
                <option value="">Sin categoría</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Unidad">
              <select
                name="unit"
                defaultValue={editing?.unit ?? "unidad"}
                className={inputClass}
              >
                {UNITS.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Precio base">
              <input
                name="basePrice"
                type="number"
                min="0"
                step="0.01"
                required
                defaultValue={editing?.basePrice ?? ""}
                placeholder="4850"
                className={inputClass}
              />
            </Field>

            <Field label="Estado">
              <select
                name="active"
                defaultValue={editing ? String(editing.active) : "true"}
                className={inputClass}
              >
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            </Field>

            <div className="sm:col-span-2">
              <Field label="Descripción corta">
                <input
                  name="description"
                  defaultValue={editing?.description ?? ""}
                  placeholder="Botella PET 2.25 litros"
                  className={inputClass}
                />
              </Field>
            </div>

            <div className="sm:col-span-2">
              <SubmitButton>
                {editing ? "Guardar cambios" : "Crear producto"}
              </SubmitButton>
            </div>
          </form>
        </Card>
      ) : null}
      <ProductsTable products={products} />
    </div>
  );
}
