import type { ProjectStatus } from "@/types/projects.types";

export const PROJECT_STATUS_TABS: {
  value: ProjectStatus | "ALL";
  label: string;
}[] = [
  { value: "ALL", label: "All" },
  { value: "ACTIVE", label: "Active" },
  { value: "DRAFT", label: "Draft" },
  { value: "COMPLETED", label: "Completed" },
  { value: "INVOICE_SENT", label: "Invoice Sent" },
  { value: "INVOICE_PAID", label: "Invoice Paid" },
];

export const STATUSES: ProjectStatus[] = [
  "DRAFT",
  "ACTIVE",
  "COMPLETED",
  "CANCELLED",
  "ARCHIVED",
  "INVOICE_SENT",
  "INVOICE_PAID",
];

export const STATUS_VARIANTS: Record<
  string,
  "default" | "outline" | "destructive"
> = {
  DRAFT: "outline",
  ACTIVE: "default",
  COMPLETED: "outline",
  CANCELLED: "destructive",
  ARCHIVED: "outline",
  INVOICE_SENT: "outline",
  INVOICE_PAID: "outline",
};

export const STATUS_BADGE_CLASSES: Record<string, string> = {
  DRAFT:
    "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30",
  ACTIVE: "",
  COMPLETED:
    "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30",
  CANCELLED: "",
  ARCHIVED:
    "bg-violet-100 text-violet-800 border-violet-300 dark:bg-violet-500/15 dark:text-violet-300 dark:border-violet-500/30",
  INVOICE_SENT:
    "bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-500/30",
  INVOICE_PAID:
    "bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-500/15 dark:text-teal-300 dark:border-teal-500/30",
};
