import type { TimeEntry } from "@/types/time-entries.types";
import type { Project } from "@/types/projects.types";
import type { RateSheet } from "@/types/rate-sheets.types";
import { resolveProjectRateSheet } from "./projectRate";

export function isTranslationEntry(
  entry: Pick<TimeEntry, "occupation">,
): boolean {
  return entry.occupation?.occupationType === "TRANSLATOR";
}

export function resolvePerWordPrice(
  project: Pick<
    Project,
    | "clientId"
    | "sourceLanguage"
    | "targetLanguage"
    | "rateSheetId"
    | "perWordRate"
    | "useCustomRate"
  >,
  rateSheets: RateSheet[],
): number | null {
  return project.useCustomRate
    ? (project.perWordRate ?? null)
    : (resolveProjectRateSheet(rateSheets, project)?.pricePerWord ?? null);
}

export interface TranslationLineItem {
  quantity: number;
  unitPrice: number;
}

/**
 * Interim rule: an entry bills the words of its linked checklist item when
 * that item counts toward the task total (time entry words never count).
 */
export function calculateTranslationLineItem(
  entry: Pick<TimeEntry, "subtask">,
  perWordPrice: number | null,
): TranslationLineItem {
  const item = entry.subtask;
  return {
    quantity: item?.countInTotal ? (item.wordCount ?? 0) : 0,
    unitPrice: perWordPrice ?? 0,
  };
}
