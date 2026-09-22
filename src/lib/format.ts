/**
 * Formateo determinístico (mismo string en server y client) para evitar
 * problemas de hidratación por Intl/timezone.
 */

const TZ = "America/Argentina/Buenos_Aires";

/** $ 12.345 */
export function formatMoney(value: number): string {
  const rounded = Math.round(value);
  const sign = rounded < 0 ? "-" : "";
  const digits = Math.abs(rounded).toString();
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${sign}$${grouped}`;
}

/** $ 12.345,50 */
export function formatMoneyPrecise(value: number): string {
  const fixed = Math.abs(value).toFixed(2);
  const [whole, cents] = fixed.split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const sign = value < 0 ? "-" : "";
  return `${sign}$${grouped},${cents}`;
}

function parts(date: Date) {
  const formatted = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const get = (type: string) =>
    formatted.find((part) => part.type === type)?.value ?? "00";

  return {
    day: get("day"),
    month: get("month"),
    year: get("year"),
    hour: get("hour") === "24" ? "00" : get("hour"),
    minute: get("minute"),
  };
}

/** 14/03/2026 */
export function formatDate(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  const { day, month, year } = parts(date);
  return `${day}/${month}/${year}`;
}

/** 14/03/2026 · 18:40 */
export function formatDateTime(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  const { day, month, year, hour, minute } = parts(date);
  return `${day}/${month}/${year} · ${hour}:${minute}`;
}

/** Clave YYYY-MM-DD en horario de Argentina (para comparar "hoy"). */
export function dayKey(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  const { day, month, year } = parts(date);
  return `${year}-${month}-${day}`;
}

export function isToday(value: string | Date): boolean {
  return dayKey(value) === dayKey(new Date());
}

/** "Caja de 24" / "unidad" → capitalizado para mostrar en el portal. */
export function formatUnit(unit: string): string {
  return unit.charAt(0).toUpperCase() + unit.slice(1);
}
