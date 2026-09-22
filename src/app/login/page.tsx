import Link from "next/link";
import { redirect } from "next/navigation";
import { ModeBadge } from "@/components/ModeBadge";
import { Card, cn } from "@/components/ui";
import { signInAsAdmin, signInAsClient } from "@/lib/auth/actions";
import { getSession } from "@/lib/auth/session";
import {
  DEMO_ADMIN_EMAIL,
  DEMO_CLIENT_EMAIL,
  DEMO_PASSWORD,
  isSupabaseConfigured,
} from "@/lib/config";

const roleButtonClass =
  "w-full rounded-lg bg-brand-600 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-700";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const session = await getSession();
  if (session) redirect(session.role === "ADMIN" ? "/admin" : "/portal");

  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : "";
  const error = typeof params.error === "string" ? params.error : null;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
              B2B
            </div>
            <span className="text-sm font-semibold text-slate-900">
              Pedidos Mayoristas
            </span>
          </Link>
          <ModeBadge />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center px-4 py-10">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">
            Ingresá a la demo
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Entrá como distribuidora para gestionar el negocio o como cliente
            para hacer un pedido.
          </p>
        </div>

        {error ? (
          <p className="mx-auto mt-6 w-full max-w-xl rounded-lg bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            No pudimos iniciar sesión: {error}
          </p>
        ) : null}

        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
          <Card className="flex flex-col p-6">
            <h2 className="text-base font-semibold text-slate-900">
              Entrar como distribuidora
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Panel de administración: pedidos, productos, clientes y precios.
            </p>
            <ul className="mt-4 flex flex-1 flex-col gap-1.5 text-sm text-slate-600">
              <li>· Ves los pedidos que llegan del portal</li>
              <li>· Cambiás el estado de cada pedido</li>
              <li>· Administrás catálogo y precios por cliente</li>
            </ul>
            <form action={signInAsAdmin} className="mt-6">
              <input type="hidden" name="next" value={next} />
              <button type="submit" className={roleButtonClass}>
                Entrar como distribuidora
              </button>
            </form>
          </Card>

          <Card className="flex flex-col p-6">
            <h2 className="text-base font-semibold text-slate-900">
              Entrar como cliente
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Portal del cliente mayorista: catálogo con tus precios y pedidos.
            </p>
            <ul className="mt-4 flex flex-1 flex-col gap-1.5 text-sm text-slate-600">
              <li>· Ves el catálogo con tus precios</li>
              <li>· Armás el pedido y lo confirmás online</li>
              <li>· Seguís el estado de tus pedidos</li>
            </ul>
            <form action={signInAsClient} className="mt-6">
              <input type="hidden" name="next" value={next} />
              <button type="submit" className={roleButtonClass}>
                Entrar como cliente
              </button>
            </form>
          </Card>
        </div>

        <p className={cn("mt-8 text-center text-xs text-slate-500")}>
          {isSupabaseConfigured() ? (
            <>
              Usuarios demo de Supabase Auth: {DEMO_ADMIN_EMAIL} (admin) y{" "}
              {DEMO_CLIENT_EMAIL} (cliente), contraseña {DEMO_PASSWORD}.
            </>
          ) : (
            <>
              Entorno de demo con datos de ejemplo: “Distribuidora Central” y el
              cliente “Almacén Central”.
            </>
          )}
        </p>
      </main>
    </div>
  );
}
