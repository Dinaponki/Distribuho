import { AdminNav } from "@/components/admin/AdminNav";
import { ModeBadge } from "@/components/ModeBadge";
import { btnGhost, cn } from "@/components/ui";
import { signOut } from "@/lib/auth/actions";
import { requireAdmin } from "@/lib/auth/guards";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const { session } = await requireAdmin();

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">
              {session.organizationName}
            </p>
            <p className="truncate text-xs text-slate-500">
              Panel de administración
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <ModeBadge />
            </div>
            <span className="hidden text-xs text-slate-500 md:inline">
              {session.fullName}
            </span>
            <form action={signOut}>
              <button type="submit" className={cn(btnGhost, "text-xs sm:text-sm")}>
                Salir
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-slate-100 px-4 py-2 lg:hidden">
          <AdminNav variant="mobile" />
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-6 px-4 py-6">
        <aside className="hidden w-56 shrink-0 lg:block">
          <AdminNav />
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
