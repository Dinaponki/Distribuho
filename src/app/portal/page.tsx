import Link from "next/link";
import { AddToCart } from "@/components/cart/AddToCart";
import {
  Badge,
  Card,
  EmptyState,
  btnSecondary,
  cn,
  inputClass,
} from "@/components/ui";
import { requireClient } from "@/lib/auth/guards";
import { formatMoney, formatUnit } from "@/lib/format";
import type { PortalProduct } from "@/lib/types";

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function matches(product: PortalProduct, query: string): boolean {
  const haystack = normalize(
    `${product.name} ${product.description ?? ""} ${product.categoryName ?? ""}`,
  );
  return haystack.includes(normalize(query));
}

export default async function PortalCatalogPage({
  searchParams,
}: PageProps<"/portal">) {
  const { session, store } = await requireClient();
  const params = await searchParams;

  const query = typeof params.q === "string" ? params.q.trim() : "";
  const categoryId = typeof params.cat === "string" ? params.cat : "";

  const [categories, products] = await Promise.all([
    store.listCategories(),
    session.customerId
      ? store.listPortalProducts(session.customerId)
      : Promise.resolve<PortalProduct[]>([]),
  ]);

  const filtered = products.filter(
    (product) =>
      (!categoryId || product.categoryId === categoryId) &&
      (!query || matches(product, query)),
  );

  const buildHref = (next: { q?: string; cat?: string }) => {
    const search = new URLSearchParams();
    const nextQuery = next.q ?? query;
    const nextCategory = next.cat ?? categoryId;
    if (nextQuery) search.set("q", nextQuery);
    if (nextCategory) search.set("cat", nextCategory);
    const queryString = search.toString();
    return queryString ? `/portal?${queryString}` : "/portal";
  };

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-slate-900">Catálogo</h1>
        <p className="mt-1 text-sm text-slate-500">
          Estos son tus precios como {session.customerName ?? session.fullName}.
          Cargá cantidades y confirmá el pedido.
        </p>
      </div>

      <div className="mb-4 flex flex-col gap-3">
        <form action="/portal" method="get" className="flex gap-2">
          {categoryId ? (
            <input type="hidden" name="cat" value={categoryId} />
          ) : null}
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Buscar por producto, marca o categoría…"
            className={cn(inputClass, "flex-1")}
          />
          <button type="submit" className={btnSecondary}>
            Buscar
          </button>
        </form>

        <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          <Link
            href={buildHref({ cat: "" })}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1.5 text-sm font-semibold transition",
              categoryId === ""
                ? "border-brand-600 bg-brand-600 text-white"
                : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50",
            )}
          >
            Todas
          </Link>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={buildHref({ cat: category.id })}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-sm font-semibold transition",
                categoryId === category.id
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50",
              )}
            >
              {category.name}
            </Link>
          ))}
        </div>

        <p className="text-xs font-medium text-slate-500">
          {filtered.length}{" "}
          {filtered.length === 1 ? "producto" : "productos"}
          {query ? ` para “${query}”` : ""}
        </p>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No encontramos productos"
          description="Probá con otra búsqueda o quitá los filtros para ver el catálogo completo."
        >
          <Link href="/portal" className={btnSecondary}>
            Ver todo el catálogo
          </Link>
        </EmptyState>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((product) => (
            <Card key={product.id} className="flex flex-col gap-3 p-4">
              <div className="flex items-start justify-between gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  {product.categoryName ?? "Sin categoría"}
                </span>
                {product.hasCustomPrice ? <Badge tone="brand">Tu precio</Badge> : null}
              </div>

              <div className="flex-1">
                <h2 className="text-sm font-semibold text-slate-900">
                  {product.name}
                </h2>
                {product.description ? (
                  <p className="mt-0.5 text-xs text-slate-500">
                    {product.description}
                  </p>
                ) : null}
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Precio por {formatUnit(product.unit).toLowerCase()}
                </p>
                <p className="text-xl font-bold text-slate-900">
                  {formatMoney(product.price)}
                </p>
              </div>

              <AddToCart
                product={{
                  id: product.id,
                  name: product.name,
                  unit: product.unit,
                  price: product.price,
                }}
              />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
