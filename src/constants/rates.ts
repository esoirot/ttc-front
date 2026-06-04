import type { TranslationRateType } from "@/types/rates.types";

export const CURRENCIES = ["EUR", "USD", "GBP", "CHF", "CAD", "AUD", "JPY"];

export const CURRENCY_SYMBOLS: Record<string, string> = {
  EUR: "€",
  USD: "$",
  GBP: "£",
  CHF: "Fr",
  CAD: "CA$",
  AUD: "A$",
  JPY: "¥",
};

export const TRANSLATION_RATE_TYPES: TranslationRateType[] = [
  "HOURLY",
  "DAY",
  "PER_WORD",
  "FIXED",
];

export const TYPE_LABELS: Record<TranslationRateType, string> = {
  HOURLY: "Hourly",
  DAY: "Day Rate",
  PER_WORD: "Per Word",
  FIXED: "Fixed Fee",
};

export const TYPE_UNIT: Record<TranslationRateType, string> = {
  HOURLY: "/hr",
  DAY: "/day",
  PER_WORD: "/word",
  FIXED: "flat",
};
