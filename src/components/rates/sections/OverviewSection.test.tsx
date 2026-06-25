import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const useRateCrudMock = vi.fn();
vi.mock("@/hooks/rates/useRateCrud", () => ({
  useRateCrud: () => useRateCrudMock(),
}));

let rateFormProps: Record<string, unknown> = {};
vi.mock("../forms/RateForm", () => ({
  RateForm: (props: Record<string, unknown>) => {
    rateFormProps = props;
    return <div data-testid="rate-form" />;
  },
}));

import type { TranslationRate } from "@/types/rates.types";
import { OverviewSection } from "./OverviewSection";

function makeRate(overrides: Partial<TranslationRate> = {}): TranslationRate {
  return {
    id: 1,
    userId: 1,
    activityId: null,
    clientId: null,
    type: "HOURLY",
    name: "Standard",
    amount: 50,
    currency: "EUR",
    description: null,
    sourceLanguage: null,
    targetLanguage: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function crudState(overrides: Record<string, unknown> = {}) {
  return {
    creating: false,
    updating: false,
    deleteRate: vi.fn(),
    showForm: false,
    setShowForm: vi.fn(),
    editingId: null,
    setEditingId: vi.fn(),
    handleCreate: vi.fn(),
    handleUpdate: vi.fn(),
    ...overrides,
  };
}

describe("OverviewSection", () => {
  beforeEach(() => {
    useRateCrudMock.mockReset();
    rateFormProps = {};
  });

  it("shows the type label and rate count", () => {
    useRateCrudMock.mockReturnValue(crudState());
    render(
      <OverviewSection type="HOURLY" rates={[makeRate()]} loading={false} />,
    );

    expect(screen.getByText("Hourly")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("shows skeletons while loading", () => {
    useRateCrudMock.mockReturnValue(crudState());
    const { container } = render(
      <OverviewSection type="HOURLY" rates={[]} loading={true} />,
    );

    expect(
      container.querySelectorAll('[class*="animate-pulse"]').length,
    ).toBeGreaterThan(0);
  });

  it("shows an empty state when there are no rates and not loading", () => {
    useRateCrudMock.mockReturnValue(crudState());
    render(<OverviewSection type="FIXED" rates={[]} loading={false} />);

    expect(screen.getByText("No rates defined.")).toBeInTheDocument();
  });

  it("renders rate name, amount, and unit", () => {
    useRateCrudMock.mockReturnValue(crudState());
    render(
      <OverviewSection
        type="PER_WORD"
        rates={[makeRate({ type: "PER_WORD", name: "General", amount: 0.1 })]}
        loading={false}
      />,
    );

    expect(screen.getByText("General")).toBeInTheDocument();
    expect(screen.getByText(/0\.1000€/)).toBeInTheDocument();
    expect(screen.getByText("EUR /word")).toBeInTheDocument();
  });

  it("shows a language badge only when source/target languages are set", () => {
    useRateCrudMock.mockReturnValue(crudState());
    render(
      <OverviewSection
        type="HOURLY"
        rates={[makeRate({ sourceLanguage: "EN", targetLanguage: "FR" })]}
        loading={false}
      />,
    );

    expect(screen.getByText("EN → FR")).toBeInTheDocument();
  });

  it("toggles the create form via the + Add / Cancel button", () => {
    const setShowForm = vi.fn();
    const setEditingId = vi.fn();
    useRateCrudMock.mockReturnValue(
      crudState({ setShowForm, setEditingId, showForm: false }),
    );
    render(<OverviewSection type="HOURLY" rates={[]} loading={false} />);

    fireEvent.click(screen.getByText("+ Add"));

    expect(setEditingId).toHaveBeenCalledWith(null);
    expect(setShowForm).toHaveBeenCalled();
  });

  it("shows the create RateForm when showForm is true", () => {
    useRateCrudMock.mockReturnValue(crudState({ showForm: true }));
    render(<OverviewSection type="HOURLY" rates={[]} loading={false} />);

    expect(screen.getByTestId("rate-form")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("clicking Edit on a rate row switches it into edit mode via setEditingId", () => {
    const setShowForm = vi.fn();
    const setEditingId = vi.fn();
    useRateCrudMock.mockReturnValue(crudState({ setShowForm, setEditingId }));
    render(
      <OverviewSection
        type="HOURLY"
        rates={[makeRate({ id: 7 })]}
        loading={false}
      />,
    );

    fireEvent.click(screen.getByText("Edit"));

    expect(setShowForm).toHaveBeenCalledWith(false);
    expect(setEditingId).toHaveBeenCalledWith(7);
  });

  it("renders RateForm in place of the row when editingId matches", () => {
    useRateCrudMock.mockReturnValue(crudState({ editingId: 7 }));
    render(
      <OverviewSection
        type="HOURLY"
        rates={[makeRate({ id: 7 })]}
        loading={false}
      />,
    );

    expect(screen.getByTestId("rate-form")).toBeInTheDocument();
    expect(screen.queryByText("Edit")).not.toBeInTheDocument();
  });

  it("RateForm's onSave for the create form calls handleCreate", () => {
    const handleCreate = vi.fn();
    useRateCrudMock.mockReturnValue(
      crudState({ showForm: true, handleCreate }),
    );
    render(<OverviewSection type="HOURLY" rates={[]} loading={false} />);

    (rateFormProps.onSave as (data: unknown) => void)({ name: "New" });

    expect(handleCreate).toHaveBeenCalledWith({ name: "New" });
  });

  it("RateForm's onSave for the edit form calls handleUpdate with the rate id", () => {
    const handleUpdate = vi.fn();
    useRateCrudMock.mockReturnValue(crudState({ editingId: 7, handleUpdate }));
    render(
      <OverviewSection
        type="HOURLY"
        rates={[makeRate({ id: 7 })]}
        loading={false}
      />,
    );

    (rateFormProps.onSave as (data: unknown) => void)({ name: "Renamed" });

    expect(handleUpdate).toHaveBeenCalledWith(7, { name: "Renamed" });
  });
});
