import type { InvoiceStatus } from "@/types/invoices.types";

export const STATUS_TABS: { value: InvoiceStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "DRAFT", label: "Draft" },
  { value: "SENT", label: "Sent" },
  { value: "PAID", label: "Paid" },
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
