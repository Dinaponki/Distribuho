import Link from "next/link";
import { Badge, Card, EmptyState, btnSecondary, cn } from "@/components/ui";
import type { Customer } from "@/lib/types";

export function CustomersTable({ customers }: { customers: Customer[] }) {
  if (customers.length === 0) {
    return (
      <EmptyState
        title="No hay clientes cargados"
        description="Cargá tu primer cliente para que pueda entrar a su portal de pedidos."
      />
    );
  }

  return (
    <Card className="divide-y divide-slate-100">
      {customers.map((customer) => (
        <div
          key={customer.id}
          className="flex flex-wrap items-center gap-3 p-4 hover:bg-slate-50"
        >
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-slate-900">
                {customer.name}
              </p>
              {customer.active ? (
                <Badge tone="emerald">Activo</Badge>
              ) : (
                <Badge>Inactivo</Badge>
              )}
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              {[customer.company, customer.email, customer.phone]
                .filter(Boolean)
                .join(" · ") || "Sin datos de contacto"}
            </p>
          </div>

          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
            <Link
              href={`/admin/customers/${customer.id}`}
              className={cn(btnSecondary, "px-3 py-2 text-xs")}
            >
              Precios
            </Link>
            <Link
              href={`/admin/customers?edit=${customer.id}`}
              className={cn(btnSecondary, "px-3 py-2 text-xs")}
            >
              Editar
            </Link>
          </div>
        </div>
      ))}
    </Card>
  );
}
