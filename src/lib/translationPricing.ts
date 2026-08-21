import type { TimeEntry } from "@/types/time-entries.types";
import type { Project } from "@/types/projects.types";
import type { RateSheet } from "@/types/rate-sheets.types";
import { resolveProjectRateSheet } from "./projectRate";

export function isTranslationEntry(
  entry: Pick<TimeEntry, "activity">,
): boolean {
  return entry.activity?.activityType === "TRANSLATOR";
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

export function calculateTranslationLineItem(
  entry: Pick<TimeEntry, "wordsProcessed">,
  perWordPrice: number | null,
): TranslationLineItem {
  return { quantity: entry.wordsProcessed ?? 0, unitPrice: perWordPrice ?? 0 };
}
