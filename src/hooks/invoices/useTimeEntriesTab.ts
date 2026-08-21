import { useState } from "react";
import { useRates } from "../rates/useRates";
import { useProjects } from "../projects/useProjects";
import { useTimeEntries } from "../time/useTimeEntries";
import { useRateSheets } from "../rate-sheets/useRateSheets";
import {
  calculateTranslationLineItem,
  isTranslationEntry,
  resolvePerWordPrice,
} from "@/lib/translationPricing";
import type { InvoiceAddItemInput } from "@/types/invoices.types";

export function useTimeEntriesTab(
  invoiceId: number,
  onAdd: (input: InvoiceAddItemInput) => Promise<unknown>,
) {
  const { rates } = useRates();
  const { projects } = useProjects();
  const { rateSheets } = useRateSheets();
  const [selectedProjectId, setSelectedProjectId] = useState<string>("__all__");
  const [selectedRateId, setSelectedRateId] = useState<string>("");
  const [unitPrice, setUnitPrice] = useState<string>("");
  const [selectedEntryIds, setSelectedEntryIds] = useState<Set<number>>(
    new Set(),
  );

  const projectId =
    selectedProjectId !== "__all__" ? Number(selectedProjectId) : undefined;

  const {
    entries,
    loading: entriesLoading,
    hasMore,
    loadMore,
  } = useTimeEntries(projectId !== undefined ? { projectId } : undefined);

  const billableEntries = entries.filter(
    (e) => e.billable && e.invoicingStatus !== "INVOICED",
  );

  function handleProjectChange(val: string) {
    setSelectedProjectId(val);
    setSelectedEntryIds(new Set());
    setSelectedRateId("");
    const proj = projects.find((p) => String(p.id) === val);
    const isTranslationProject = proj?.activities?.some(
      (a) => a.activityType === "TRANSLATOR",
    );
    const perWordPrice =
      proj && isTranslationProject
        ? resolvePerWordPrice(proj, rateSheets)
        : null;
    setUnitPrice(perWordPrice != null ? String(perWordPrice) : "");
  }

  function handleRateChange(val: string) {
    setSelectedRateId(val);
    const rate = rates.find((r) => String(r.id) === val);
    if (rate) setUnitPrice(String(rate.amount));
  }

  function handleUnitPriceChange(val: string) {
    setUnitPrice(val);
    setSelectedRateId("");
  }

  function toggleEntry(id: number) {
    setSelectedEntryIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleBulkAdd() {
    const manualOverride = unitPrice !== "" ? parseFloat(unitPrice) || 0 : null;

    for (const entryId of selectedEntryIds) {
      const entry = entries.find((e) => e.id === entryId);
      if (!entry) continue;

      let quantity: number;
      let itemUnitPrice: number;

      if (isTranslationEntry(entry)) {
        const project = projects.find((p) => p.id === entry.projectId);
        const perWordPrice =
          manualOverride ??
          (project ? resolvePerWordPrice(project, rateSheets) : null);
        ({ quantity, unitPrice: itemUnitPrice } = calculateTranslationLineItem(
          entry,
          perWordPrice,
        ));
      } else {
        quantity =
          entry.durationSeconds != null
            ? parseFloat((entry.durationSeconds / 3600).toFixed(4))
            : 0;
        itemUnitPrice = manualOverride ?? 0;
      }

      await onAdd({
        invoiceId,
        description: entry.description ?? "Time entry",
        quantity,
        unitPrice: itemUnitPrice,
        projectId: entry.projectId ?? undefined,
        timeEntryId: entry.id,
      });
    }
    setSelectedEntryIds(new Set());
  }

  return {
    rates,
    projects,
    selectedProjectId,
    selectedRateId,
    unitPrice,
    selectedEntryIds,
    billableEntries,
    entriesLoading,
    hasMore,
    loadMore,
    handleProjectChange,
    handleRateChange,
    handleUnitPriceChange,
    toggleEntry,
    handleBulkAdd,
  };
}
