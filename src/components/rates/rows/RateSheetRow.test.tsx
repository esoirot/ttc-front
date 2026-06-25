import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { RateSheet } from "@/types/rate-sheets.types";
import { RateSheetRow } from "./RateSheetRow";

function makeSheet(overrides: Partial<RateSheet> = {}): RateSheet {
  return {
    id: 1,
    userId: 1,
    activityId: null,
    clientId: null,
    name: "Standard EN-FR",
    description: null,
    sourceLanguage: "EN",
    targetLanguage: "FR",
    currency: "EUR",
    pricePerWord: 0.12,
    matchRates: {} as RateSheet["matchRates"],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("RateSheetRow", () => {
  it("shows the name, language pair, and price with currency symbol", () => {
    render(
      <RateSheetRow sheet={makeSheet()} onEdit={vi.fn()} onDelete={vi.fn()} />,
    );

    expect(screen.getByText("Standard EN-FR")).toBeInTheDocument();
    expect(screen.getByText("EN → FR")).toBeInTheDocument();
    expect(screen.getByText("0.1200 €")).toBeInTheDocument();
  });

  it("falls back to the currency code when no symbol is known", () => {
    render(
      <RateSheetRow
        sheet={makeSheet({ currency: "XYZ" })}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    expect(screen.getByText("0.1200 XYZ")).toBeInTheDocument();
  });

  it("shows the client name when provided", () => {
    render(
      <RateSheetRow
        sheet={makeSheet()}
        clientName="Acme"
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    expect(screen.getByText("Acme")).toBeInTheDocument();
  });

  it("calls onEdit and onDelete", () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    render(
      <RateSheetRow sheet={makeSheet()} onEdit={onEdit} onDelete={onDelete} />,
    );

    fireEvent.click(screen.getByText("Edit"));
    expect(onEdit).toHaveBeenCalled();

    fireEvent.click(screen.getByText("✕"));
    fireEvent.click(screen.getByText("Delete"));
    expect(onDelete).toHaveBeenCalled();
  });
});
