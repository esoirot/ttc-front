import type { ClientType, ClientIndustry } from "@/types/clients.types";

export const EMPTY_CLIENT_FORM = {
  clientType: "COMPANY" as ClientType,
  name: "",
  legalName: "",
  vatNumber: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  country: "",
  postalCode: "",
  paymentDelayDays: "",
  taxRate: "",
  billingEndOfMonth: false,
  website: "",
  industry: null as ClientIndustry | null,
};

export const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  ACTIVE: "bg-primary/15 text-primary",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-destructive/15 text-destructive",
  ARCHIVED: "bg-muted text-muted-foreground",
  INVOICE_SENT: "bg-amber-100 text-amber-700",
  INVOICE_PAID: "bg-emerald-100 text-emerald-700",
};

export const EMPTY_CONTACT = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
};
