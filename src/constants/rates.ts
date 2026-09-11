import type { MessageDescriptor } from "react-intl";
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

export const TYPE_LABEL_MESSAGES: Record<
  TranslationRateType,
  MessageDescriptor
> = {
  HOURLY: { id: "rates.type.hourly", defaultMessage: "Hourly" },
  DAY: { id: "rates.type.day", defaultMessage: "Day Rate" },
  PER_WORD: { id: "rates.type.perWord", defaultMessage: "Per Word" },
  FIXED: { id: "rates.type.fixed", defaultMessage: "Fixed Fee" },
};

export const TYPE_UNIT_MESSAGES: Record<
  TranslationRateType,
  MessageDescriptor
> = {
  HOURLY: { id: "rates.unit.hourly", defaultMessage: "/hr" },
  DAY: { id: "rates.unit.day", defaultMessage: "/day" },
  PER_WORD: { id: "rates.unit.perWord", defaultMessage: "/word" },
  FIXED: { id: "rates.unit.fixed", defaultMessage: "flat" },
};
