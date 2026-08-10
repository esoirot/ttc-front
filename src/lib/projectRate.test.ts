import { describe, expect, it } from "vitest";
import {
  defaultClientRateSheetId,
  findClientRateSheet,
  resolveProjectRateSheet,
} from "./projectRate";
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
    Pick<
      Project,
      "clientId" | "sourceLanguage" | "targetLanguage" | "rateSheetId"
    >
  > = {},
): Pick<
  Project,
  "clientId" | "sourceLanguage" | "targetLanguage" | "rateSheetId"
> {
  return {
    clientId: 5,
    sourceLanguage: "EN",
    targetLanguage: "FR",
    rateSheetId: null,
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

describe("defaultClientRateSheetId", () => {
  it("returns null when there are no sheets", () => {
    expect(defaultClientRateSheetId([])).toBeNull();
  });

  it("returns the sheet marked isDefault", () => {
    const sheets = [
      makeSheet({ id: 1, isDefault: false }),
      makeSheet({ id: 2, isDefault: true }),
      makeSheet({ id: 3, isDefault: false }),
    ];
    expect(defaultClientRateSheetId(sheets)).toBe(2);
  });

  it("returns the sole sheet even when it is not marked isDefault", () => {
    const sheets = [makeSheet({ id: 7, isDefault: false })];
    expect(defaultClientRateSheetId(sheets)).toBe(7);
  });

  it("returns null when there are multiple sheets and none is default", () => {
    const sheets = [
      makeSheet({ id: 1, isDefault: false }),
      makeSheet({ id: 2, isDefault: false }),
    ];
    expect(defaultClientRateSheetId(sheets)).toBeNull();
  });
});

describe("resolveProjectRateSheet", () => {
  it("uses the explicit rateSheetId when set, ignoring language pair", () => {
    const sheets = [
      makeSheet({ id: 1, sourceLanguage: "EN", targetLanguage: "FR" }),
      makeSheet({ id: 2, sourceLanguage: "DE", targetLanguage: "IT" }),
    ];
    expect(
      resolveProjectRateSheet(sheets, makeProject({ rateSheetId: 2 })),
    ).toBe(sheets[1]);
  });

  it("returns undefined when rateSheetId is set but no sheet matches", () => {
    expect(
      resolveProjectRateSheet(
        [makeSheet({ id: 1 })],
        makeProject({ rateSheetId: 99 }),
      ),
    ).toBeUndefined();
  });

  it("falls back to language-pair matching when rateSheetId is unset", () => {
    const sheet = makeSheet({ id: 1 });
    expect(
      resolveProjectRateSheet([sheet], makeProject({ rateSheetId: null })),
    ).toBe(sheet);
  });
});
