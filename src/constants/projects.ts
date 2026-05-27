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
