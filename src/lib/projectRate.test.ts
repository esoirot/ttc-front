import { describe, expect, it } from "vitest";
import { findClientRateSheet } from "./projectRate";
import { defaultMatchRates } from "@/constants/matchRateItems";
import type { RateSheet } from "@/types/rate-sheets.types";
import type { Project } from "@/types/projects.types";

function makeSheet(overrides: Partial<RateSheet> = {}): RateSheet {
  return {
    id: 1,
    userId: 1,
    activityId: null,
    clientId: 5,
    name: "EN-FR standard",
    description: null,
    sourceLanguage: "EN",
    targetLanguage: "FR",
    currency: "EUR",
    pricePerWord: 0.12,
    matchRates: defaultMatchRates(),
    isDefault: false,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function makeProject(
  overrides: Partial<
    Pick<Project, "clientId" | "sourceLanguage" | "targetLanguage">
  > = {},
): Pick<Project, "clientId" | "sourceLanguage" | "targetLanguage"> {
  return {
    clientId: 5,
    sourceLanguage: "EN",
    targetLanguage: "FR",
    ...overrides,
  };
}

describe("findClientRateSheet", () => {
  it("returns undefined when the project has no clientId", () => {
    expect(
      findClientRateSheet([makeSheet()], makeProject({ clientId: null })),
    ).toBeUndefined();
  });

  it("matches on exact clientId + language pair", () => {
    const sheet = makeSheet();
    expect(findClientRateSheet([sheet], makeProject())).toBe(sheet);
  });

  it("matches case-insensitively", () => {
    const sheet = makeSheet();
    expect(
      findClientRateSheet(
        [sheet],
        makeProject({ sourceLanguage: "en", targetLanguage: "fr" }),
      ),
    ).toBe(sheet);
  });

  it("matches with surrounding whitespace trimmed", () => {
    const sheet = makeSheet();
    expect(
      findClientRateSheet(
        [sheet],
        makeProject({ sourceLanguage: " EN ", targetLanguage: " FR " }),
      ),
    ).toBe(sheet);
  });

  it("does not match a different clientId", () => {
    const sheet = makeSheet({ clientId: 5 });
    expect(
      findClientRateSheet([sheet], makeProject({ clientId: 6 })),
    ).toBeUndefined();
  });

  it("does not match a different language pair", () => {
    const sheet = makeSheet({ sourceLanguage: "EN", targetLanguage: "FR" });
    expect(
      findClientRateSheet([sheet], makeProject({ targetLanguage: "DE" })),
    ).toBeUndefined();
  });
});
