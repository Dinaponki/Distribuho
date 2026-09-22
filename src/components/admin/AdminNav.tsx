"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/components/ui";

const LINKS = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/orders", label: "Pedidos", exact: false },
  { href: "/admin/products", label: "Productos", exact: false },
  { href: "/admin/customers", label: "Clientes", exact: false },
];

export function AdminNav({ variant = "sidebar" }: { variant?: "sidebar" | "mobile" }) {
  const pathname = usePathname();
  const mobile = variant === "mobile";

  return (
    <nav
      className={cn(
        mobile
          ? "no-scrollbar flex gap-1 overflow-x-auto"
          : "flex flex-col gap-1 rounded-xl border border-slate-200 bg-white p-2",
      )}
    >
      {LINKS.map((link) => {
        const active = link.exact
          ? pathname === link.href
          : pathname === link.href || pathname.startsWith(`${link.href}/`);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition",
              active
                ? "bg-brand-50 text-brand-700"
                : "text-slate-600 hover:bg-slate-100",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
