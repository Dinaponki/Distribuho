import { CartButton, OfflineIndicator } from "@/components/cart/CartButton";
import { CartPanel } from "@/components/cart/CartPanel";
import {
  CartProvider,
  type CartProduct,
} from "@/components/cart/CartProvider";
import { PortalNav } from "@/components/portal/PortalNav";
import { btnGhost, cn } from "@/components/ui";
import { signOut } from "@/lib/auth/actions";
import { requireClient } from "@/lib/auth/guards";

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

export default async function PortalLayout({ children }: LayoutProps<"/portal">) {
  const { session, store } = await requireClient();
  const products = session.customerId
    ? await store.listPortalProducts(session.customerId)
    : [];

  const catalog: CartProduct[] = products.map((product) => ({
    id: product.id,
    name: product.name,
    unit: product.unit,
    price: product.price,
  }));

  return (
    <CartProvider
      organizationId={session.organizationId}
      customerId={session.customerId}
      catalog={catalog}
    >
      <div className="flex min-h-screen flex-col bg-slate-50">
        <OfflineIndicator />

        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
                {initials(session.organizationName)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {session.organizationName}
                </p>
                <p className="truncate text-xs text-slate-500">
                  {session.customerName ?? session.fullName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden sm:block">
                <PortalNav />
              </div>
              <CartButton />
              <form action={signOut}>
                <button type="submit" className={cn(btnGhost, "hidden sm:inline-flex")}>
                  Salir
                </button>
              </form>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-slate-100 px-4 py-2 sm:hidden">
            <PortalNav variant="mobile" />
            <form action={signOut}>
              <button type="submit" className="text-xs font-semibold text-slate-500">
                Salir
              </button>
            </form>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>

        <footer className="border-t border-slate-200 bg-white px-4 py-4">
          <p className="mx-auto max-w-6xl text-xs text-slate-500">
            Portal de pedidos de {session.organizationName}. Los precios son
            exclusivos para {session.customerName ?? session.fullName}.
          </p>
        </footer>

        <CartPanel />
      </div>
    </CartProvider>
  );
}
