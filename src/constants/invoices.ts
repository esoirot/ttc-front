import type { MessageDescriptor } from "react-intl";
import type { InvoiceStatus } from "@/types/invoices.types";
import type { TranslationRateType } from "@/types/rates.types";

export const STATUS_TABS: {
  value: InvoiceStatus | "ALL";
  labelMessage: MessageDescriptor;
}[] = [
  {
    value: "ALL",
    labelMessage: { id: "invoices.statusTab.all", defaultMessage: "All" },
  },
  {
    value: "DRAFT",
    labelMessage: { id: "invoices.statusTab.draft", defaultMessage: "Draft" },
  },
  {
    value: "SENT",
    labelMessage: { id: "invoices.statusTab.sent", defaultMessage: "Sent" },
  },
  {
    value: "PAID",
    labelMessage: { id: "invoices.statusTab.paid", defaultMessage: "Paid" },
  },
];

export const STATUS_BADGE: Record<
  InvoiceStatus,
  "default" | "secondary" | "outline" | "destructive"
> = {
  DRAFT: "secondary",
  SENT: "default",
  PAID: "outline",
  OVERDUE: "destructive",
  CANCELLED: "secondary",
};

export const STATUS_TRANSITIONS: Record<InvoiceStatus, InvoiceStatus[]> = {
  DRAFT: ["SENT", "CANCELLED"],
  SENT: ["PAID", "OVERDUE"],
  PAID: [],
  OVERDUE: ["PAID"],
  CANCELLED: [],
};

export const CURRENCIES = ["EUR", "USD", "GBP", "CHF", "CAD", "AUD", "JPY"];

export const QTY_LABEL_MESSAGES: Record<
  TranslationRateType,
  MessageDescriptor
> = {
  HOURLY: { id: "invoices.qtyLabel.hourly", defaultMessage: "Hours" },
  PER_WORD: { id: "invoices.qtyLabel.perWord", defaultMessage: "Words" },
  FIXED: { id: "invoices.qtyLabel.fixed", defaultMessage: "Qty" },
  DAY: { id: "invoices.qtyLabel.day", defaultMessage: "Day" },
};
