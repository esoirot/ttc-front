import type { RateType } from "@/types/rates.types";

export const CURRENCIES = ["EUR", "USD", "GBP", "CHF", "CAD", "AUD", "JPY"];

export const RATE_TYPES: RateType[] = ["HOURLY", "PER_WORD", "FIXED"];

export const TYPE_LABELS: Record<RateType, string> = {
  HOURLY: "Hourly",
  PER_WORD: "Per Word",
  FIXED: "Fixed Fee",
};

export const TYPE_UNIT: Record<RateType, string> = {
  HOURLY: "/hr",
  PER_WORD: "/word",
  FIXED: "flat",
};
