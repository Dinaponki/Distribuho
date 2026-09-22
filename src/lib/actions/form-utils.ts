/** Helpers para leer FormData en las Server Actions del panel. */

export function text(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

export function optionalText(value: FormDataEntryValue | null): string | null {
  const value1 = text(value);
  return value1 === "" ? null : value1;
}

/** Acepta "1234", "1234,50" o "1234.50". */
export function money(value: FormDataEntryValue | null): number {
  const raw = text(value).replace(",", ".");
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.round(parsed * 100) / 100;
}

/** Cadena vacía → null (permite "quitar" un precio especial). */
export function optionalMoney(value: FormDataEntryValue | null): number | null {
  const raw = text(value);
  if (raw === "") return null;
  return money(value);
}

export function flag(value: FormDataEntryValue | null): boolean {
  const raw = text(value).toLowerCase();
  return raw === "true" || raw === "on" || raw === "1";
}
