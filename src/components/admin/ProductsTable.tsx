import Link from "next/link";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { Badge, Card, EmptyState, btnSecondary, cn } from "@/components/ui";
import { deleteProduct, toggleProductActive } from "@/lib/actions/products";
import { formatMoney } from "@/lib/format";
import type { Product } from "@/lib/types";

const actionClass = "px-3 py-2 text-xs";

export function ProductsTable({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <EmptyState
        title="No hay productos cargados"
        description="Creá tu primer producto para que tus clientes lo vean en el portal."
      />
    );
  }

  return (
    <Card className="divide-y divide-slate-100">
      {products.map((product) => (
        <div
          key={product.id}
          className="flex flex-wrap items-center gap-3 p-4 hover:bg-slate-50"
        >
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-slate-900">{product.name}</p>
              {product.active ? (
                <Badge tone="emerald">Activo</Badge>
              ) : (
                <Badge>Inactivo</Badge>
              )}
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              {product.categoryName ?? "Sin categoría"}
              {product.description ? ` · ${product.description}` : ""}
            </p>
          </div>

          <div className="ml-auto text-right sm:ml-0 sm:w-28">
            <p className="text-sm font-bold text-slate-900">
              {formatMoney(product.basePrice)}
            </p>
            <p className="text-xs text-slate-500">por {product.unit}</p>
          </div>

          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
            <Link
              href={`/admin/products?edit=${product.id}`}
              className={cn(btnSecondary, actionClass)}
            >
              Editar
            </Link>

            <form action={toggleProductActive}>
              <input type="hidden" name="id" value={product.id} />
              <SubmitButton variant="secondary" className={actionClass}>
                {product.active ? "Desactivar" : "Activar"}
              </SubmitButton>
            </form>

            <form action={deleteProduct}>
              <input type="hidden" name="id" value={product.id} />
              <SubmitButton
                variant="danger"
                className={actionClass}
                pendingLabel="Eliminando…"
                confirmMessage={`¿Eliminar ${product.name}?`}
              >
                Eliminar
              </SubmitButton>
            </form>
          </div>
        </div>
      ))}
    </Card>
  );
}
