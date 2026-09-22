"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/components/ui";

const LINKS = [
  { href: "/portal", label: "Catálogo" },
  { href: "/portal/orders", label: "Mis pedidos" },
];

export function PortalNav({ variant = "desktop" }: { variant?: "desktop" | "mobile" }) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "flex items-center gap-1",
        variant === "mobile" && "overflow-x-auto",
      )}
    >
      {LINKS.map((link) => {
        const active =
          link.href === "/portal"
            ? pathname === "/portal"
            : pathname.startsWith(link.href);

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
