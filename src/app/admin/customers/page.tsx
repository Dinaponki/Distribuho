import Link from "next/link";
import { CustomersTable } from "@/components/admin/CustomersTable";
import { FlashBanner } from "@/components/admin/FlashBanner";
import { SubmitButton } from "@/components/admin/SubmitButton";
import {
  Card,
  Field,
  SectionTitle,
  btnPrimary,
  btnSecondary,
  inputClass,
} from "@/components/ui";
import { saveCustomer } from "@/lib/actions/customers";
import { requireAdmin } from "@/lib/auth/guards";

export default async function AdminCustomersPage({
  searchParams,
}: PageProps<"/admin/customers">) {
  const { store } = await requireAdmin();
  const params = await searchParams;

  const isNew = params.new === "1";
  const editId = typeof params.edit === "string" ? params.edit : "";
  const saved = typeof params.saved === "string" ? params.saved : null;
  const error = typeof params.error === "string" ? params.error : null;

  const customers = await store.listCustomers();
  const editing = editId ? customers.find((item) => item.id === editId) : null;
  const showForm = isNew || Boolean(editing);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Clientes</h1>
          <p className="mt-1 text-sm text-slate-500">
            {customers.length} clientes ·{" "}
            {customers.filter((customer) => customer.active).length} activos
          </p>
        </div>
        {!showForm ? (
          <Link href="/admin/customers?new=1" className={btnPrimary}>
            + Nuevo cliente
          </Link>
        ) : (
          <Link href="/admin/customers" className={btnSecondary}>
            Cerrar formulario
          </Link>
        )}
      </div>

      <FlashBanner
        saved={saved}
        error={error}
        errorMessage="El nombre del cliente es obligatorio."
      />

      {showForm ? (
        <Card className="p-5">
          <SectionTitle
            title={editing ? `Editar: ${editing.name}` : "Nuevo cliente"}
            description="Cada cliente ve sus propios precios en el portal."
          />
          <form action={saveCustomer} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {editing ? <input type="hidden" name="id" value={editing.id} /> : null}

            <Field label="Nombre">
              <input
                name="name"
                required
                defaultValue={editing?.name ?? ""}
                placeholder="Almacén Central"
                className={inputClass}
              />
            </Field>

            <Field label="Empresa">
              <input
                name="company"
                defaultValue={editing?.company ?? ""}
                placeholder="Almacén Central SRL"
                className={inputClass}
              />
            </Field>

            <Field label="Email">
              <input
                name="email"
                type="email"
                defaultValue={editing?.email ?? ""}
                placeholder="compras@almacencentral.com"
                className={inputClass}
              />
            </Field>

            <Field label="Teléfono">
              <input
                name="phone"
                defaultValue={editing?.phone ?? ""}
                placeholder="+54 11 4555-1200"
                className={inputClass}
              />
            </Field>

            <Field label="Dirección">
              <input
                name="address"
                defaultValue={editing?.address ?? ""}
                placeholder="Av. Rivadavia 4520, CABA"
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
              <SubmitButton>
                {editing ? "Guardar cambios" : "Crear cliente"}
              </SubmitButton>
            </div>
          </form>
        </Card>
      ) : null}

      <CustomersTable customers={customers} />
    </div>
  );
}
