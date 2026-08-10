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
