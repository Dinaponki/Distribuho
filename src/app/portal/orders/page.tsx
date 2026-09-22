import { Card, EmptyState, StatusBadge, btnPrimary } from "@/components/ui";
import { requireClient } from "@/lib/auth/guards";
import { formatDateTime, formatMoney, formatUnit } from "@/lib/format";

export default async function PortalOrdersPage() {
  const { session, store } = await requireClient();
  const orders = session.customerId
    ? await store.listOrders({ customerId: session.customerId })
    : [];

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-slate-900">Mis pedidos</h1>
        <p className="mt-1 text-sm text-slate-500">
          Historial de pedidos enviados a {session.organizationName}.
        </p>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          title="Todavía no hiciste pedidos"
          description="Cuando confirmes tu primer pedido lo vas a ver acá con su estado actualizado."
        >
          <a href="/portal" className={btnPrimary}>
            Ir al catálogo
          </a>
        </EmptyState>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div>
                  <p className="font-mono text-sm font-semibold text-slate-900">
                    {order.number}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatDateTime(order.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-slate-900">
                    {formatMoney(order.total)}
                  </span>
                  <StatusBadge status={order.status} />
                </div>
              </div>

              <details className="border-t border-slate-100">
                <summary className="cursor-pointer px-4 py-2 text-xs font-semibold text-brand-700 hover:bg-slate-50">
                  Ver detalle ({order.items.length}{" "}
                  {order.items.length === 1 ? "producto" : "productos"})
                </summary>
                <ul className="divide-y divide-slate-100">
                  {order.items.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center justify-between gap-4 px-4 py-2 text-sm"
                    >
                      <span className="text-slate-700">
                        {item.name}
                        <span className="ml-2 text-xs text-slate-400">
                          {item.quantity} × {formatUnit(item.unit).toLowerCase()}
                        </span>
                      </span>
                      <span className="font-medium text-slate-800">
                        {formatMoney(item.subtotal)}
                      </span>
                    </li>
                  ))}
                </ul>
              </details>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
