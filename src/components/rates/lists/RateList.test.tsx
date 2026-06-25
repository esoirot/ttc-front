import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const useRatesMock = vi.fn();
vi.mock("@/hooks/rates/useRates", () => ({
  useRates: (...args: unknown[]) => useRatesMock(...args),
}));

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

let rateRowProps: Record<string, unknown>[] = [];
vi.mock("../rows/RateRow", () => ({
  RateRow: (props: Record<string, unknown>) => {
    rateRowProps.push(props);
    return (
      <div data-testid="rate-row">{(props.rate as { name: string }).name}</div>
    );
  },
}));

import type { TranslationRate } from "@/types/rates.types";
import { RateList } from "./RateList";

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

describe("RateList", () => {
  beforeEach(() => {
    useRatesMock.mockReset();
    useRateCrudMock.mockReset();
    rateFormProps = {};
    rateRowProps = [];
  });

  it("shows skeletons while loading", () => {
    useRatesMock.mockReturnValue({ rates: [], loading: true });
    useRateCrudMock.mockReturnValue(crudState());
    const { container } = render(<RateList type="HOURLY" />);

    expect(
      container.querySelectorAll('[class*="animate-pulse"]').length,
    ).toBeGreaterThan(0);
  });

  it("shows the type-specific empty state when there are no rates", () => {
    useRatesMock.mockReturnValue({ rates: [], loading: false });
    useRateCrudMock.mockReturnValue(crudState());
    render(<RateList type="PER_WORD" />);

    expect(screen.getByText("No per word rates yet.")).toBeInTheDocument();
  });

  it("renders a RateRow per rate", () => {
    useRatesMock.mockReturnValue({
      rates: [makeRate({ id: 1, name: "A" }), makeRate({ id: 2, name: "B" })],
      loading: false,
    });
    useRateCrudMock.mockReturnValue(crudState());
    render(<RateList type="HOURLY" />);

    expect(screen.getAllByTestId("rate-row")).toHaveLength(2);
  });

  it("renders RateForm instead of the row when editingId matches", () => {
    useRatesMock.mockReturnValue({
      rates: [makeRate({ id: 1 })],
      loading: false,
    });
    useRateCrudMock.mockReturnValue(crudState({ editingId: 1 }));
    render(<RateList type="HOURLY" />);

    expect(screen.getByTestId("rate-form")).toBeInTheDocument();
    expect(screen.queryByTestId("rate-row")).not.toBeInTheDocument();
  });

  it("shows the '+ Add <Type> Rate' button when the form is closed", () => {
    useRatesMock.mockReturnValue({ rates: [], loading: false });
    useRateCrudMock.mockReturnValue(crudState());
    render(<RateList type="FIXED" />);

    expect(screen.getByText("+ Add Fixed Fee Rate")).toBeInTheDocument();
  });

  it("shows the create RateForm when showForm is true, hiding the add button", () => {
    useRatesMock.mockReturnValue({ rates: [], loading: false });
    useRateCrudMock.mockReturnValue(crudState({ showForm: true }));
    render(<RateList type="HOURLY" />);

    expect(screen.getByTestId("rate-form")).toBeInTheDocument();
    expect(screen.queryByText(/\+ Add/)).not.toBeInTheDocument();
  });

  it("clicking + Add opens the create form via setShowForm/setEditingId", () => {
    const setShowForm = vi.fn();
    const setEditingId = vi.fn();
    useRatesMock.mockReturnValue({ rates: [], loading: false });
    useRateCrudMock.mockReturnValue(crudState({ setShowForm, setEditingId }));
    render(<RateList type="HOURLY" />);

    fireEvent.click(screen.getByText("+ Add Hourly Rate"));

    expect(setEditingId).toHaveBeenCalledWith(null);
    expect(setShowForm).toHaveBeenCalledWith(true);
  });

  it("RateRow's onEdit switches to edit mode for that rate", () => {
    const setShowForm = vi.fn();
    const setEditingId = vi.fn();
    useRatesMock.mockReturnValue({
      rates: [makeRate({ id: 9 })],
      loading: false,
    });
    useRateCrudMock.mockReturnValue(crudState({ setShowForm, setEditingId }));
    render(<RateList type="HOURLY" />);

    (rateRowProps[0].onEdit as () => void)();

    expect(setShowForm).toHaveBeenCalledWith(false);
    expect(setEditingId).toHaveBeenCalledWith(9);
  });

  it("RateRow's onDelete calls deleteRate with the rate id", () => {
    const deleteRate = vi.fn();
    useRatesMock.mockReturnValue({
      rates: [makeRate({ id: 9 })],
      loading: false,
    });
    useRateCrudMock.mockReturnValue(crudState({ deleteRate }));
    render(<RateList type="HOURLY" />);

    (rateRowProps[0].onDelete as () => void)();

    expect(deleteRate).toHaveBeenCalledWith(9);
  });

  it("create RateForm's onSave calls handleCreate", () => {
    const handleCreate = vi.fn();
    useRatesMock.mockReturnValue({ rates: [], loading: false });
    useRateCrudMock.mockReturnValue(
      crudState({ showForm: true, handleCreate }),
    );
    render(<RateList type="HOURLY" />);

    (rateFormProps.onSave as (data: unknown) => void)({ name: "New" });

    expect(handleCreate).toHaveBeenCalledWith({ name: "New" });
  });

  it("edit RateForm's onSave calls handleUpdate with the rate id", () => {
    const handleUpdate = vi.fn();
    useRatesMock.mockReturnValue({
      rates: [makeRate({ id: 9 })],
      loading: false,
    });
    useRateCrudMock.mockReturnValue(crudState({ editingId: 9, handleUpdate }));
    render(<RateList type="HOURLY" />);

    (rateFormProps.onSave as (data: unknown) => void)({ name: "Renamed" });

    expect(handleUpdate).toHaveBeenCalledWith(9, { name: "Renamed" });
  });

  it("passes the type through to useRates", () => {
    useRatesMock.mockReturnValue({ rates: [], loading: false });
    useRateCrudMock.mockReturnValue(crudState());
    render(<RateList type="DAY" />);

    expect(useRatesMock).toHaveBeenCalledWith("DAY");
  });
});
