import { describe, expect, it } from "vitest";
import {
  calculateTranslationLineItem,
  isTranslationEntry,
  resolvePerWordPrice,
} from "./translationPricing";
import { defaultMatchRates } from "@/constants/matchRateItems";
import type { RateSheet } from "@/types/rate-sheets.types";
import type { Project } from "@/types/projects.types";
import type { TimeEntry } from "@/types/time-entries.types";

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

type PriceProject = Pick<
  Project,
  | "clientId"
  | "sourceLanguage"
  | "targetLanguage"
  | "rateSheetId"
  | "perWordRate"
  | "useCustomRate"
>;

function makeProject(overrides: Partial<PriceProject> = {}): PriceProject {
  return {
    clientId: 5,
    sourceLanguage: "EN",
    targetLanguage: "FR",
    rateSheetId: null,
    perWordRate: null,
    useCustomRate: false,
    ...overrides,
  };
}

describe("isTranslationEntry", () => {
  it("returns true when the entry's activity is TRANSLATOR", () => {
    expect(
      isTranslationEntry({
        activity: { id: 1, name: "Translation", activityType: "TRANSLATOR" },
      }),
    ).toBe(true);
  });

  it("returns false for a non-TRANSLATOR activity", () => {
    expect(
      isTranslationEntry({
        activity: { id: 2, name: "Proofreading", activityType: "CORRECTOR" },
      }),
    ).toBe(false);
  });

  it("returns false when there is no activity", () => {
    expect(isTranslationEntry({ activity: null })).toBe(false);
    expect(isTranslationEntry({})).toBe(false);
  });
});

describe("resolvePerWordPrice", () => {
  it("uses project.perWordRate when useCustomRate is on", () => {
    expect(
      resolvePerWordPrice(
        makeProject({ useCustomRate: true, perWordRate: 0.15 }),
        [],
      ),
    ).toBe(0.15);
  });

  it("falls back to the resolved client rate sheet's pricePerWord when useCustomRate is off", () => {
    const sheet = makeSheet({ pricePerWord: 0.12 });
    expect(
      resolvePerWordPrice(makeProject({ useCustomRate: false }), [sheet]),
    ).toBe(0.12);
  });

  it("prefers an explicit project.rateSheetId over language-pair matching", () => {
    const sheets = [
      makeSheet({
        id: 1,
        sourceLanguage: "EN",
        targetLanguage: "FR",
        pricePerWord: 0.1,
      }),
      makeSheet({
        id: 2,
        sourceLanguage: "DE",
        targetLanguage: "IT",
        pricePerWord: 0.2,
      }),
    ];
    expect(
      resolvePerWordPrice(
        makeProject({ useCustomRate: false, rateSheetId: 2 }),
        sheets,
      ),
    ).toBe(0.2);
  });

  it("returns null when useCustomRate is on but perWordRate is unset", () => {
    expect(
      resolvePerWordPrice(
        makeProject({ useCustomRate: true, perWordRate: null }),
        [],
      ),
    ).toBeNull();
  });

  it("returns null when useCustomRate is off and no rate sheet resolves", () => {
    expect(
      resolvePerWordPrice(makeProject({ useCustomRate: false }), []),
    ).toBeNull();
  });
});

describe("calculateTranslationLineItem", () => {
  it("multiplies wordsProcessed by the resolved per-word price", () => {
    expect(
      calculateTranslationLineItem(
        { wordsProcessed: 1000 } as Pick<TimeEntry, "wordsProcessed">,
        0.12,
      ),
    ).toEqual({ quantity: 1000, unitPrice: 0.12 });
  });

  it("defaults quantity to 0 when wordsProcessed is null, without erroring", () => {
    expect(
      calculateTranslationLineItem(
        { wordsProcessed: null } as Pick<TimeEntry, "wordsProcessed">,
        0.12,
      ),
    ).toEqual({ quantity: 0, unitPrice: 0.12 });
  });

  it("defaults unitPrice to 0 when the per-word price is unresolvable", () => {
    expect(
      calculateTranslationLineItem(
        { wordsProcessed: 500 } as Pick<TimeEntry, "wordsProcessed">,
        null,
      ),
    ).toEqual({ quantity: 500, unitPrice: 0 });
  });
});
