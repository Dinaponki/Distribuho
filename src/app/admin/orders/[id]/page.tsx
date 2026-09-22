import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusSelect } from "@/components/admin/StatusSelect";
import { SubmitButton } from "@/components/admin/SubmitButton";
import {
  Card,
  Field,
  SectionTitle,
  StatusBadge,
  labelClass,
} from "@/components/ui";
import { updateOrderStatus } from "@/lib/actions/order-status";
import { requireAdmin } from "@/lib/auth/guards";
import { formatDateTime, formatMoney, formatUnit } from "@/lib/format";
import { ORDER_STATUS_LABEL, isOrderStatus } from "@/lib/types";

export default async function AdminOrderDetailPage({
  params,
  searchParams,
}: PageProps<"/admin/orders/[id]">) {
  const { store } = await requireAdmin();
  const { id } = await params;
  const query = await searchParams;

  const order = await store.getOrder(id);
  if (!order) notFound();

  const customer = await store.getCustomer(order.customerId);
  const savedStatus =
    typeof query.saved === "string" && isOrderStatus(query.saved)
      ? query.saved
      : null;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <Link
          href="/admin/orders"
          className="text-xs font-semibold text-brand-700 hover:underline"
        >
          ← Volver a pedidos
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="font-mono text-2xl font-bold text-slate-900">
            {order.number}
          </h1>
          <StatusBadge status={order.status} />
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Recibido el {formatDateTime(order.createdAt)}
        </p>
      </div>

      {savedStatus ? (
        <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          Estado actualizado a {ORDER_STATUS_LABEL[savedStatus]}.
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <SectionTitle
            title="Productos del pedido"
            description={`${order.items.length} ${order.items.length === 1 ? "ítem" : "ítems"}`}
          />

          <div className="-mx-5 overflow-x-auto px-5">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                  <th className="py-2 font-semibold">Producto</th>
                  <th className="py-2 text-right font-semibold">Cantidad</th>
                  <th className="py-2 text-right font-semibold">Precio unit.</th>
                  <th className="py-2 text-right font-semibold">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3 text-slate-700">{item.name}</td>
                    <td className="py-3 text-right text-slate-600">
                      {item.quantity} {formatUnit(item.unit).toLowerCase()}
                    </td>
                    <td className="py-3 text-right text-slate-600">
                      {formatMoney(item.unitPrice)}
                    </td>
                    <td className="py-3 text-right font-semibold text-slate-900">
                      {formatMoney(item.subtotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
            <span className="text-sm font-medium text-slate-500">Total</span>
            <span className="text-2xl font-bold text-slate-900">
              {formatMoney(order.total)}
            </span>
          </div>

          {order.notes ? (
            <p className="mt-4 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <span className="font-semibold">Observaciones:</span> {order.notes}
            </p>
          ) : null}
        </Card>
        <div className="flex flex-col gap-5">
          <Card className="p-5">
            <SectionTitle title="Cliente" />
            <dl className="flex flex-col gap-2 text-sm">
              <div>
                <dt className={labelClass}>Nombre</dt>
                <dd className="font-semibold text-slate-800">
                  {order.customerName}
                </dd>
              </div>
              {customer?.company ? (
                <div>
                  <dt className={labelClass}>Empresa</dt>
                  <dd className="text-slate-700">{customer.company}</dd>
                </div>
              ) : null}
              {customer?.phone ? (
                <div>
                  <dt className={labelClass}>Teléfono</dt>
                  <dd className="text-slate-700">{customer.phone}</dd>
                </div>
              ) : null}
              {customer?.email ? (
                <div>
                  <dt className={labelClass}>Email</dt>
                  <dd className="break-all text-slate-700">{customer.email}</dd>
                </div>
              ) : null}
              {customer?.address ? (
                <div>
                  <dt className={labelClass}>Dirección</dt>
                  <dd className="text-slate-700">{customer.address}</dd>
                </div>
              ) : null}
            </dl>
            {customer ? (
              <Link
                href={`/admin/customers/${customer.id}`}
                className="mt-4 inline-block text-xs font-semibold text-brand-700 hover:underline"
              >
                Ver precios de este cliente →
              </Link>
            ) : null}
          </Card>

          <Card className="p-5">
            <SectionTitle
              title="Estado del pedido"
              description="El cliente ve el cambio en su historial."
            />
            <form action={updateOrderStatus} className="flex flex-col gap-3">
              <input type="hidden" name="orderId" value={order.id} />
              <Field label="Estado">
                <StatusSelect current={order.status} />
              </Field>
              <SubmitButton variant="secondary">Actualizar estado</SubmitButton>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
