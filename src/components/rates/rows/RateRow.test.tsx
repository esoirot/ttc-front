import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { TranslationRate } from "@/types/rates.types";
import { RateRow } from "./RateRow";

function makeRate(overrides: Partial<TranslationRate> = {}): TranslationRate {
  return {
    id: 1,
    userId: 1,
    activityId: null,
    clientId: null,
    type: "HOURLY",
    name: "Standard",
    amount: 40,
    currency: "EUR",
    description: null,
    sourceLanguage: null,
    targetLanguage: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("RateRow", () => {
  it("formats HOURLY amounts to 2 decimals", () => {
    render(
      <RateRow
        rate={makeRate({ amount: 40 })}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    expect(screen.getByText("40.00")).toBeInTheDocument();
  });

  it("formats PER_WORD amounts to 4 decimals", () => {
    render(
      <RateRow
        rate={makeRate({ type: "PER_WORD", amount: 0.12 })}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    expect(screen.getByText("0.1200")).toBeInTheDocument();
  });

  it("shows the language pair badge when both languages are set", () => {
    render(
      <RateRow
        rate={makeRate({ sourceLanguage: "EN", targetLanguage: "FR" })}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    expect(screen.getByText("EN → FR")).toBeInTheDocument();
  });

  it("calls onEdit when Edit is clicked", () => {
    const onEdit = vi.fn();
    render(<RateRow rate={makeRate()} onEdit={onEdit} onDelete={vi.fn()} />);
    fireEvent.click(screen.getByText("Edit"));
    expect(onEdit).toHaveBeenCalled();
  });

  it("calls onDelete after confirming the delete dialog", () => {
    const onDelete = vi.fn();
    render(
      <RateRow
        rate={makeRate({ name: "Standard" })}
        onEdit={vi.fn()}
        onDelete={onDelete}
      />,
    );
    fireEvent.click(screen.getByText("✕"));
    fireEvent.click(screen.getByText("Delete"));
    expect(onDelete).toHaveBeenCalled();
  });
});
