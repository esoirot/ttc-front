import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TranslationRate } from "@/types/rates.types";

const useCustomLineTabMock = vi.fn();
vi.mock("@/hooks/invoices/useCustomLineTab", () => ({
  useCustomLineTab: (...args: unknown[]) => useCustomLineTabMock(...args),
}));

import { CustomLineTab } from "./CustomLineTab";

function makeRate(overrides: Partial<TranslationRate> = {}): TranslationRate {
  return {
    id: 1,
    userId: 1,
    name: "Translation",
    amount: 0.05,
    currency: "EUR",
    type: "PER_WORD",
    description: null,
    activityId: null,
    clientId: null,
    sourceLanguage: null,
    targetLanguage: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function defaultState() {
  return {
    rates: [] as TranslationRate[],
    selectedRate: undefined as TranslationRate | undefined,
    selectedRateId: "",
    desc: "",
    qty: "1",
    price: "0",
    setDesc: vi.fn(),
    setQty: vi.fn(),
    setPrice: vi.fn(),
    handleRateSelect: vi.fn(),
    handleAdd: vi.fn().mockResolvedValue(undefined),
  };
}

function renderTab(
  stateOverrides: Partial<ReturnType<typeof defaultState>> = {},
  adding = false,
) {
  useCustomLineTabMock.mockReturnValue({
    ...defaultState(),
    ...stateOverrides,
  });
  return render(
    <CustomLineTab invoiceId={1} onAdd={vi.fn()} adding={adding} />,
  );
}

describe("CustomLineTab", () => {
  beforeEach(() => {
    useCustomLineTabMock.mockReset();
  });

  it("renders Description, Qty and Unit price inputs", () => {
    renderTab();
    expect(screen.getByLabelText("Description")).toBeInTheDocument();
    expect(screen.getByLabelText("Qty")).toBeInTheDocument();
    expect(screen.getByLabelText("Unit price")).toBeInTheDocument();
  });

  it("Add line button is disabled when desc is empty", () => {
    renderTab({ desc: "" });
    expect(screen.getByRole("button", { name: "Add line" })).toBeDisabled();
  });

  it("Add line button is enabled when desc has text", () => {
    renderTab({ desc: "Translation work" });
    expect(screen.getByRole("button", { name: "Add line" })).not.toBeDisabled();
  });

  it("shows Qty label when no rate selected", () => {
    renderTab({ selectedRate: undefined });
    expect(screen.getByLabelText("Qty")).toBeInTheDocument();
  });

  it("shows Words label when PER_WORD rate selected", () => {
    renderTab({ selectedRate: makeRate({ type: "PER_WORD" }) });
    expect(screen.getByLabelText("Words")).toBeInTheDocument();
  });

  it("shows Hours label when HOURLY rate selected", () => {
    renderTab({ selectedRate: makeRate({ type: "HOURLY" }) });
    expect(screen.getByLabelText("Hours")).toBeInTheDocument();
  });

  it("shows Day label when DAY rate selected", () => {
    renderTab({ selectedRate: makeRate({ type: "DAY" }) });
    expect(screen.getByLabelText("Day")).toBeInTheDocument();
  });

  it("shows total preview when desc and price are set", () => {
    renderTab({ desc: "Work", qty: "2", price: "3.50" });
    expect(screen.getByText("Total: 7.00")).toBeInTheDocument();
  });

  it("does not show total preview when desc is empty", () => {
    renderTab({ desc: "", qty: "2", price: "3.50" });
    expect(screen.queryByText(/Total:/)).not.toBeInTheDocument();
  });

  it("does not show total preview when price is empty string", () => {
    renderTab({ desc: "Work", qty: "2", price: "" });
    expect(screen.queryByText(/Total:/)).not.toBeInTheDocument();
  });

  it("shows Adding… and disables button when adding=true", () => {
    renderTab({ desc: "Work" }, true);
    expect(screen.getByRole("button", { name: "Adding…" })).toBeDisabled();
  });

  it("calls handleAdd when Enter is pressed in Description input", () => {
    const handleAdd = vi.fn().mockResolvedValue(undefined);
    renderTab({ desc: "Work", handleAdd });
    fireEvent.keyDown(screen.getByLabelText("Description"), { key: "Enter" });
    expect(handleAdd).toHaveBeenCalled();
  });

  it("calls handleAdd when Enter is pressed in Unit price input", () => {
    const handleAdd = vi.fn().mockResolvedValue(undefined);
    renderTab({ desc: "Work", handleAdd });
    fireEvent.keyDown(screen.getByLabelText("Unit price"), { key: "Enter" });
    expect(handleAdd).toHaveBeenCalled();
  });

  it("calls setDesc, setQty, and setPrice as the inputs change", () => {
    const setDesc = vi.fn();
    const setQty = vi.fn();
    const setPrice = vi.fn();
    renderTab({ setDesc, setQty, setPrice });

    fireEvent.change(screen.getByLabelText("Description"), {
      target: { value: "New desc" },
    });
    fireEvent.change(screen.getByLabelText("Qty"), {
      target: { value: "5" },
    });
    fireEvent.change(screen.getByLabelText("Unit price"), {
      target: { value: "9.99" },
    });

    expect(setDesc).toHaveBeenCalledWith("New desc");
    expect(setQty).toHaveBeenCalledWith("5");
    expect(setPrice).toHaveBeenCalledWith("9.99");
  });

  it("calls handleAdd when the Add line button is clicked", () => {
    const handleAdd = vi.fn().mockResolvedValue(undefined);
    renderTab({ desc: "Work", handleAdd });
    fireEvent.click(screen.getByRole("button", { name: "Add line" }));
    expect(handleAdd).toHaveBeenCalled();
  });

  it("passes invoiceId and onAdd args to useCustomLineTab", () => {
    const onAdd = vi.fn();
    useCustomLineTabMock.mockReturnValue(defaultState());
    render(<CustomLineTab invoiceId={42} onAdd={onAdd} adding={false} />);
    expect(useCustomLineTabMock).toHaveBeenCalledWith(42, onAdd);
  });
});
