import type { ReactNode } from "react";
import { ORDER_STATUS_LABEL, type OrderStatus } from "@/lib/types";

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

export const cardClass =
  "rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]";

export const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-inner shadow-slate-50 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 disabled:bg-slate-100";

export const labelClass =
  "mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500";

export const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition disabled:cursor-not-allowed disabled:opacity-60";

export const btnPrimary = cn(
  buttonBase,
  "bg-brand-600 px-4 py-2 text-sm text-white hover:bg-brand-700 active:bg-brand-800",
);

export const btnSecondary = cn(
  buttonBase,
  "border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 active:bg-slate-100",
);

export const btnGhost = cn(
  buttonBase,
  "px-3 py-2 text-sm text-slate-600 hover:bg-slate-100",
);

export const btnDanger = cn(
  buttonBase,
  "border border-rose-200 bg-white px-3 py-2 text-sm text-rose-600 hover:bg-rose-50",
);

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn(cardClass, className)}>{children}</div>;
}

export function SectionTitle({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        {description ? (
          <p className="mt-0.5 text-sm text-slate-500">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "brand" | "warning";
}) {
  const tones = {
    default: "text-slate-900",
    brand: "text-brand-700",
    warning: "text-amber-600",
  } as const;

  return (
    <div className={cn(cardClass, "p-4")}>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className={cn("mt-2 text-3xl font-bold", tones[tone])}>{value}</p>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

const STATUS_TONES: Record<OrderStatus, string> = {
  PENDIENTE: "bg-amber-100 text-amber-800 ring-amber-200",
  CONFIRMADO: "bg-blue-100 text-blue-800 ring-blue-200",
  EN_PREPARACION: "bg-violet-100 text-violet-800 ring-violet-200",
  EN_REPARTO: "bg-cyan-100 text-cyan-800 ring-cyan-200",
  ENTREGADO: "bg-emerald-100 text-emerald-800 ring-emerald-200",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        STATUS_TONES[status],
      )}
    >
      {ORDER_STATUS_LABEL[status]}
    </span>
  );
}

export function Badge({
  children,
  tone = "slate",
}: {
  children: ReactNode;
  tone?: "slate" | "brand" | "emerald" | "amber";
}) {
  const tones = {
    slate: "bg-slate-100 text-slate-700 ring-slate-200",
    brand: "bg-brand-50 text-brand-700 ring-brand-200",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    amber: "bg-amber-50 text-amber-700 ring-amber-200",
  } as const;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

export function EmptyState({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      <p className="text-sm font-semibold text-slate-700">{title}</p>
      {description ? (
        <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
          {description}
        </p>
      ) : null}
      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  );
}

export function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className={labelClass} htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}
