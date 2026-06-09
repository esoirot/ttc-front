import { CURRENCY_SYMBOLS } from "@/constants/rates";

export function centsToEuros(cents: number | null | undefined): string {
  if (cents == null) return "";
  return (cents / 100).toFixed(2);
}

export function eurosToCents(euros: string): number | null {
  const n = parseFloat(euros);
  if (isNaN(n)) return null;
  return Math.round(n * 100);
}

export function formatCents(cents: number): string {
  return (cents / 100).toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
  });
}

export function currencySymbol(code: string): string {
  return CURRENCY_SYMBOLS[code] ?? code;
}
