import type { QueryClient } from "@tanstack/react-query";

// Every cache root holding a copy of an entity's data (its lists, detail
// pages, and other domains that embed its name, totals or counts). After a
// save they all reload, so the server decides filters, sort, totals and
// copied names. A page that starts showing an entity's data adds its root here.
const SHOWN_IN = {
  client: ["clients", "dashboard"],
  // Client cards show the first contact's name or a contact count.
  contact: ["clients"],
  clientRate: ["clientRates"],
  project: ["projects", "dashboard"],
  // Also checklists and checklist items: time entries copy their titles and
  // words, projects total their words.
  task: [
    "tasks",
    "task",
    "project",
    "projects",
    "projectActivities",
    "timeEntries",
    "dashboard",
  ],
  // Comments, labels, attachments.
  taskDetail: ["task", "projectActivities"],
  timeEntry: [
    "timeEntries",
    "firstTimeEntryStart",
    "tasks",
    "task",
    "project",
    "projects",
    "projectActivities",
    "dashboard",
  ],
  invoice: ["invoices", "timeEntries", "dashboard"],
  invoiceItem: ["invoices", "invoice", "timeEntries", "dashboard"],
  occupation: [
    "occupations",
    "occupation",
    "clients",
    "client",
    "projects",
    "project",
    "timeEntries",
  ],
  charge: ["occupation"],
  rate: ["translationRates", "occupation"],
  rateSheet: ["rateSheets"],
  tag: ["tags", "clients", "client", "timeEntries"],
} as const;

export type ShownEntity = keyof typeof SHOWN_IN;

export function reloadWhereShown(qc: QueryClient, entity: ShownEntity): void {
  for (const root of SHOWN_IN[entity]) {
    void qc.invalidateQueries({ queryKey: [root] });
  }
}
