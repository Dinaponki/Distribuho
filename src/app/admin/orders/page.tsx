import Link from "next/link";
import {
  Card,
  EmptyState,
  StatusBadge,
  cn,
} from "@/components/ui";
import { requireAdmin } from "@/lib/auth/guards";
import { formatDateTime, formatMoney } from "@/lib/format";
import { ORDER_STATUSES, ORDER_STATUS_LABEL, isOrderStatus } from "@/lib/types";

export default async function AdminOrdersPage({
  searchParams,
}: PageProps<"/admin/orders">) {
  const { store } = await requireAdmin();
  const params = await searchParams;

  const statusFilter =
    typeof params.status === "string" && isOrderStatus(params.status)
      ? params.status
      : "";

  const orders = await store.listOrders();
  const filtered = statusFilter
    ? orders.filter((order) => order.status === statusFilter)
    : orders;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Pedidos</h1>
        <p className="mt-1 text-sm text-slate-500">
          {orders.length} pedidos en total. Abrí un pedido para ver el detalle y
          cambiar su estado.
        </p>
      </div>

      <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        <Link
          href="/admin/orders"
          className={cn(
            "shrink-0 rounded-full border px-3 py-1.5 text-sm font-semibold transition",
            statusFilter === ""
              ? "border-brand-600 bg-brand-600 text-white"
              : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50",
          )}
        >
          Todos
        </Link>
        {ORDER_STATUSES.map((status) => (
          <Link
            key={status}
            href={`/admin/orders?status=${status}`}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1.5 text-sm font-semibold transition",
              statusFilter === status
                ? "border-brand-600 bg-brand-600 text-white"
                : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50",
            )}
          >
            {ORDER_STATUS_LABEL[status]}
          </Link>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No hay pedidos con este estado"
          description="Probá con otro filtro o esperá a que los clientes carguen pedidos desde el portal."
        />
      ) : (
        <>
          {/* Tabla (desktop) */}
          <Card className="hidden overflow-hidden lg:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50">
                <tr className="text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3 font-semibold">Pedido</th>
                  <th className="px-4 py-3 font-semibold">Cliente</th>
                  <th className="px-4 py-3 font-semibold">Fecha</th>
                  <th className="px-4 py-3 text-right font-semibold">Total</th>
                  <th className="px-4 py-3 font-semibold">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-mono font-semibold text-brand-700 hover:underline"
                      >
                        {order.number}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {order.customerName}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {formatDateTime(order.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-900">
                      {formatMoney(order.total)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={order.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {/* Tarjetas (mobile) */}
          <div className="flex flex-col gap-3 lg:hidden">
            {filtered.map((order) => (
              <Link key={order.id} href={`/admin/orders/${order.id}`}>
                <Card className="p-4 transition hover:border-brand-300">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-sm font-semibold text-brand-700">
                        {order.number}
                      </p>
                      <p className="text-sm text-slate-700">{order.customerName}</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {formatDateTime(order.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900">
                        {formatMoney(order.total)}
                      </p>
                      <div className="mt-1">
                        <StatusBadge status={order.status} />
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
