import type { InvoiceStatus } from "@/types/invoices.types";
import type { ProjectStatus } from "@/types/projects.types";
import type { AdminPermission } from "@/types/users.types";
import type { RateType } from "@/types/rates.types";

export const ACTION_VARIANT: Record<
  string,
  "default" | "secondary" | "destructive"
> = {
  CREATE: "default",
  UPDATE: "secondary",
  DELETE: "destructive",
};

export const ALL_PERMISSIONS: AdminPermission[] = [
  "MANAGE_USERS",
  "MANAGE_CLIENTS",
  "MANAGE_PROJECTS",
  "MANAGE_INVOICES",
  "MANAGE_TIME",
  "MANAGE_RATES",
];

export const ADMIN_INVOICE_STATUS_BADGE: Record<
  InvoiceStatus,
  "default" | "secondary" | "destructive"
> = {
  DRAFT: "secondary",
  SENT: "default",
  PAID: "default",
  OVERDUE: "destructive",
  CANCELLED: "secondary",
};

export const INVOICE_STATUSES: InvoiceStatus[] = [
  "DRAFT",
  "SENT",
  "PAID",
  "OVERDUE",
  "CANCELLED",
];

export const ADMIN_PROJECT_STATUS_BADGE: Record<
  ProjectStatus,
  "default" | "secondary" | "destructive"
> = {
  DRAFT: "secondary",
  ACTIVE: "default",
  COMPLETED: "secondary",
  CANCELLED: "destructive",
  ARCHIVED: "secondary",
  INVOICE_SENT: "default",
  INVOICE_PAID: "default",
};

export const PROJECT_STATUSES: ProjectStatus[] = [
  "DRAFT",
  "ACTIVE",
  "COMPLETED",
  "CANCELLED",
  "ARCHIVED",
  "INVOICE_SENT",
  "INVOICE_PAID",
];

export const ADMIN_EMPTY_CLIENT_FORM = {
  name: "",
  email: "",
  phone: "",
  city: "",
  country: "",
  legalName: "",
  address: "",
  postalCode: "",
  vatNumber: "",
};

export const ADMIN_EMPTY_RATE_FORM = {
  name: "",
  type: "HOURLY" as RateType,
  amount: "",
  currency: "EUR",
  description: "",
};
