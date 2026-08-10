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
