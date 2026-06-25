import { describe, expect, it } from "vitest";
import {
  centsToEuros,
  currencySymbol,
  eurosToCents,
  formatCents,
} from "./currency";

describe("centsToEuros", () => {
  it("converts cents to a 2dp euro string", () => {
    expect(centsToEuros(1050)).toBe("10.50");
  });

  it("returns empty string for null/undefined", () => {
    expect(centsToEuros(null)).toBe("");
    expect(centsToEuros(undefined)).toBe("");
  });

  it("handles zero", () => {
    expect(centsToEuros(0)).toBe("0.00");
  });
});

describe("eurosToCents", () => {
  it("converts a euro string to integer cents", () => {
    expect(eurosToCents("10.5")).toBe(1050);
  });

  it("rounds fractional cents", () => {
    expect(eurosToCents("10.999")).toBe(1100);
  });

  it("returns null for non-numeric input", () => {
    expect(eurosToCents("abc")).toBeNull();
  });
});

describe("formatCents", () => {
  it("formats cents as EUR currency in fr-FR locale", () => {
    const result = formatCents(1050);
    expect(result).toContain("10,50");
    expect(result).toMatch(/€/);
  });
});

describe("currencySymbol", () => {
  it("returns known symbol", () => {
    expect(currencySymbol("USD")).toBe("$");
  });

  it("falls back to the code when unknown", () => {
    expect(currencySymbol("XYZ")).toBe("XYZ");
  });
});
