import type { Project } from "@/types/projects.types";
import type { RateSheet } from "@/types/rate-sheets.types";

function normalizeLanguage(value: string | null | undefined): string {
  return (value ?? "").trim().toUpperCase();
}

export function findClientRateSheet(
  rateSheets: RateSheet[],
  project: Pick<Project, "clientId" | "sourceLanguage" | "targetLanguage">,
): RateSheet | undefined {
  if (project.clientId == null) return undefined;
  const projectSource = normalizeLanguage(project.sourceLanguage);
  const projectTarget = normalizeLanguage(project.targetLanguage);
  return rateSheets.find(
    (sheet) =>
      sheet.clientId === project.clientId &&
      normalizeLanguage(sheet.sourceLanguage) === projectSource &&
      normalizeLanguage(sheet.targetLanguage) === projectTarget,
  );
}

export function defaultClientRateSheetId(
  clientRateSheets: RateSheet[],
): number | null {
  const explicitDefault = clientRateSheets.find((s) => s.isDefault);
  if (explicitDefault) return explicitDefault.id;
  return clientRateSheets.length === 1 ? clientRateSheets[0].id : null;
}

export function resolveProjectRateSheet(
  rateSheets: RateSheet[],
  project: Pick<
    Project,
    "clientId" | "sourceLanguage" | "targetLanguage" | "rateSheetId"
  >,
): RateSheet | undefined {
  if (project.rateSheetId != null) {
    return rateSheets.find((s) => s.id === project.rateSheetId);
  }
  return findClientRateSheet(rateSheets, project);
}

export function calculateProjectRevenue(
  project: Pick<
    Project,
    | "fixedFee"
    | "hourlyRate"
    | "perWordRate"
    | "useCustomRate"
    | "totalWordsProcessed"
  >,
  totalSeconds: number,
  clientRateSheet: RateSheet | undefined,
): number {
  const perWordPrice = project.useCustomRate
    ? project.perWordRate
    : (clientRateSheet?.pricePerWord ?? null);
  const words = project.totalWordsProcessed ?? 0;

  let revenue = 0;
  if (perWordPrice != null) revenue += words * perWordPrice;
  if (project.useCustomRate && project.hourlyRate != null) {
    revenue += (totalSeconds / 3600) * project.hourlyRate;
  }
  if (project.useCustomRate && project.fixedFee != null) {
    revenue += project.fixedFee;
  }
  return revenue;
}
