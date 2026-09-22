import Link from "next/link";
import { notFound } from "next/navigation";
import { FlashBanner } from "@/components/admin/FlashBanner";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { Badge, Card, SectionTitle, inputClass } from "@/components/ui";
import { saveCustomerPrice } from "@/lib/actions/customers";
import { requireAdmin } from "@/lib/auth/guards";
import { formatMoney } from "@/lib/format";

export default async function AdminCustomerPricesPage({
  params,
  searchParams,
}: PageProps<"/admin/customers/[id]">) {
  const { store } = await requireAdmin();
  const { id } = await params;
  const query = await searchParams;
  const saved = typeof query.saved === "string" ? query.saved : null;

  const customer = await store.getCustomer(id);
  if (!customer) notFound();

  const [products, prices] = await Promise.all([
    store.listProducts(),
    store.listCustomerPrices(customer.id),
  ]);
  const customPrices = new Map(
    prices.map((row) => [row.productId, row.price] as const),
  );

  return (
    <div className="flex flex-col gap-5">
      <div>
        <Link
          href="/admin/customers"
          className="text-xs font-semibold text-brand-700 hover:underline"
        >
          ← Volver a clientes
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900">{customer.name}</h1>
          {customer.active ? (
            <Badge tone="emerald">Activo</Badge>
          ) : (
            <Badge>Inactivo</Badge>
          )}
        </div>
        <p className="mt-1 text-sm text-slate-500">
          {customer.email ?? "Sin email"} · {customPrices.size} precios
          personalizados de {products.length} productos
        </p>
      </div>

      <FlashBanner saved={saved} />

      <Card className="p-5">
        <SectionTitle
          title="Precios por cliente"
          description="Cargá un precio especial o dejá el campo vacío para usar el precio base."
        />

        <div className="divide-y divide-slate-100">
          {products.map((product) => {
            const custom = customPrices.get(product.id);

            return (
              <form
                key={product.id}
                action={saveCustomerPrice}
                className="flex flex-wrap items-end gap-3 py-3"
              >
                <input type="hidden" name="customerId" value={customer.id} />
                <input type="hidden" name="productId" value={product.id} />

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900">
                      {product.name}
                    </p>
                    {custom !== undefined ? (
                      <Badge tone="brand">Precio propio</Badge>
                    ) : (
                      <Badge>Precio base</Badge>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {product.categoryName ?? "Sin categoría"} · base{" "}
                    {formatMoney(product.basePrice)} por {product.unit}
                  </p>
                </div>

                <div className="w-36">
                  <label
                    htmlFor={`price-${product.id}`}
                    className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    Precio
                  </label>
                  <input
                    id={`price-${product.id}`}
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    defaultValue={custom ?? ""}
                    placeholder={String(product.basePrice)}
                    className={inputClass}
                  />
                </div>

                <SubmitButton variant="secondary" className="px-3 py-2 text-xs">
                  Guardar
                </SubmitButton>
              </form>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
