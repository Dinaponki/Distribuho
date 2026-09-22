import Link from "next/link";
import { Badge } from "@/components/ui";

const FLOW = [
  {
    step: "1",
    title: "Tus clientes entran a su portal",
    text: "Cada cliente ve el catálogo con sus propios precios y unidades.",
  },
  {
    step: "2",
    title: "Cargan el pedido online",
    text: "Eligen productos y cantidades y confirman. Sin mensajes sueltos.",
  },
  {
    step: "3",
    title: "Vos recibís todo ordenado",
    text: "El pedido llega a tu panel con estados: pendiente, en reparto, entregado.",
  },
];

const BENEFITS = [
  {
    title: "Precios por cliente",
    text: "Cada cliente ve su lista de precios. Sin planillas ni PDFs por WhatsApp.",
  },
  {
    title: "Pedidos sin errores",
    text: "Número de pedido, ítems, cantidades y total calculados por el sistema.",
  },
  {
    title: "Estado del pedido",
    text: "Actualizás el estado y tu cliente lo ve en su historial al instante.",
  },
];

const ctaClass =
  "inline-flex items-center justify-center rounded-lg bg-brand-600 px-6 py-3 text-base font-semibold text-white hover:bg-brand-700";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="border-b border-slate-200">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
              B2B
            </div>
            <span className="text-sm font-semibold text-slate-900">
              Pedidos Mayoristas
            </span>
          </div>
          <Link
            href="/login"
            className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Ingresar
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:py-20">
          <div className="max-w-3xl">
            <Badge tone="brand">Demo para distribuidoras</Badge>
            <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl">
              Tu propia plataforma de pedidos para clientes mayoristas
            </h1>
            <p className="mt-4 text-base text-slate-600 sm:text-lg">
              Tus clientes consultan sus precios, hacen pedidos online y vos
              recibís todo organizado.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="/login" className={ctaClass}>
                Ver demo
              </Link>
              <span className="text-sm text-slate-500">
                Entrás como distribuidora o como cliente en un clic.
              </span>
            </div>
          </div>

          <div className="mt-14 rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              El flujo completo
            </p>

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-center">
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
                  Cliente
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  Entra al portal
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Ve el catálogo con sus precios y arma el pedido.
                </p>
              </div>

              <div className="hidden text-2xl font-bold text-slate-300 md:block">
                →
              </div>

              <div className="rounded-xl border border-brand-200 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
                  Pedido
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  Confirma online
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Recibe su número de pedido y queda registrado.
                </p>
              </div>

              <div className="hidden text-2xl font-bold text-slate-300 md:block">
                →
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
                  Distribuidora
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  Gestiona desde el panel
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Confirma, prepara, despacha y marca como entregado.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="border-t border-slate-200 bg-slate-50 py-14">
          <div className="mx-auto w-full max-w-6xl px-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {BENEFITS.map((benefit) => (
                <div
                  key={benefit.title}
                  className="rounded-xl border border-slate-200 bg-white p-5"
                >
                  <p className="text-sm font-semibold text-slate-900">
                    {benefit.title}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">{benefit.text}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
              {FLOW.map((item) => (
                <div key={item.step} className="flex gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                    {item.step}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {item.title}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-14">
          <div className="mx-auto w-full max-w-6xl px-4 text-center">
            <h2 className="text-2xl font-bold text-slate-900">
              Dejá de recibir pedidos desordenados por WhatsApp
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-600">
              Tus clientes tienen un portal propio donde ven sus productos y
              precios y hacen el pedido directamente.
            </p>
            <Link href="/login" className={`${ctaClass} mt-6`}>
              Ver demo
            </Link>
          </div>
        </section>

        <footer className="border-t border-slate-200 py-6">
          <p className="mx-auto w-full max-w-6xl px-4 text-xs text-slate-500">
            Demo comercial · Portal de pedidos B2B multi-distribuidora.
          </p>
        </footer>
      </main>
    </div>
  );
}
