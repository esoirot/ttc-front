import { describe, expect, it } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import { reloadWhereShown, type ShownEntity } from "./cacheDeps";

// Every cache root that shows a copy of each entity's data.
const EXPECTED: Record<ShownEntity, string[]> = {
  client: ["clients", "dashboard"],
  contact: ["clients"],
  clientRate: ["clientRates"],
  project: ["projects", "dashboard"],
  task: [
    "tasks",
    "task",
    "project",
    "projects",
    "projectActivities",
    "timeEntries",
    "dashboard",
  ],
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
};

const ALL_ROOTS = [...new Set(Object.values(EXPECTED).flat()), "me"];

describe("reloadWhereShown", () => {
  it.each(Object.entries(EXPECTED))(
    "given every cache is loaded, when a %s is saved, then only the caches showing it go stale",
    (entity, roots) => {
      const qc = new QueryClient();
      for (const root of ALL_ROOTS) qc.setQueryData([root, 1], {});

      reloadWhereShown(qc, entity as ShownEntity);

      const stale = ALL_ROOTS.filter(
        (root) => qc.getQueryState([root, 1])?.isInvalidated,
      );
      expect(stale.sort()).toEqual([...roots].sort());
    },
  );
});
