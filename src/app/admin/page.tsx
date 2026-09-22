import Link from "next/link";
import {
  Card,
  EmptyState,
  SectionTitle,
  StatCard,
  StatusBadge,
  btnSecondary,
} from "@/components/ui";
import { requireAdmin } from "@/lib/auth/guards";
import { formatDateTime, formatMoney, isToday } from "@/lib/format";

export default async function AdminDashboardPage() {
  const { store } = await requireAdmin();

  const [orders, customers, products] = await Promise.all([
    store.listOrders(),
    store.listCustomers(),
    store.listProducts(),
  ]);

  const pending = orders.filter((order) => order.status === "PENDIENTE");
  const today = orders.filter((order) => isToday(order.createdAt));
  const recent = orders.slice(0, 6);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Resumen del día y últimos pedidos recibidos.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Pedidos pendientes"
          value={pending.length}
          hint="Esperando confirmación"
          tone={pending.length > 0 ? "warning" : "default"}
        />
        <StatCard
          label="Pedidos de hoy"
          value={today.length}
          hint={`${formatMoney(today.reduce((acc, order) => acc + order.total, 0))} facturado`}
        />
        <StatCard label="Clientes" value={customers.length} hint="Con portal propio" />
        <StatCard
          label="Productos"
          value={products.length}
          hint={`${products.filter((product) => product.active).length} activos`}
        />
      </div>

      <Card className="p-5">
        <SectionTitle
          title="Pedidos recientes"
          description="Los últimos pedidos que entraron por el portal."
          action={
            <Link href="/admin/orders" className={btnSecondary}>
              Ver todos
            </Link>
          }
        />

        {recent.length === 0 ? (
          <EmptyState
            title="Todavía no hay pedidos"
            description="Cuando un cliente confirme un pedido desde el portal, lo vas a ver acá."
          />
        ) : (
          <div className="-mx-5 overflow-x-auto px-5">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                  <th className="py-2 font-semibold">Pedido</th>
                  <th className="py-2 font-semibold">Cliente</th>
                  <th className="py-2 font-semibold">Fecha</th>
                  <th className="py-2 text-right font-semibold">Total</th>
                  <th className="py-2 font-semibold">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recent.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50">
                    <td className="py-3">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-mono text-sm font-semibold text-brand-700 hover:underline"
                      >
                        {order.number}
                      </Link>
                    </td>
                    <td className="py-3 text-slate-700">{order.customerName}</td>
                    <td className="py-3 text-slate-500">
                      {formatDateTime(order.createdAt)}
                    </td>
                    <td className="py-3 text-right font-semibold text-slate-900">
                      {formatMoney(order.total)}
                    </td>
                    <td className="py-3">
                      <StatusBadge status={order.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <div className="flex flex-wrap gap-3">
        <Link href="/admin/products?new=1" className={btnSecondary}>
          + Nuevo producto
        </Link>
        <Link href="/admin/customers?new=1" className={btnSecondary}>
          + Nuevo cliente
        </Link>
        <Link href="/admin/customers" className={btnSecondary}>
          Precios por cliente
        </Link>
      </div>
    </div>
  );
}
