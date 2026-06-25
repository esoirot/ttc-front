import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const useClientsMock = vi.fn();
vi.mock("@/hooks/clients/useClients", () => ({
  useClients: () => useClientsMock(),
}));

const useMyActivitiesMock = vi.fn();
vi.mock("@/hooks/activities/useActivities", () => ({
  useMyActivities: () => useMyActivitiesMock(),
}));

const useCurrentUserMock = vi.fn();
vi.mock("@/hooks/auth/useAuth", () => ({
  useCurrentUser: () => useCurrentUserMock(),
}));

import type { TranslationRate } from "@/types/rates.types";
import { RateForm } from "./RateForm";

const mockActivities = [
  { id: 1, name: "Translation", activityType: "TRANSLATOR" },
  { id: 2, name: "Consulting", activityType: "OTHER" },
];
const mockClients = [{ id: 1, name: "Acme Corp" }];

function defaultHooks() {
  useClientsMock.mockReturnValue({ clients: mockClients });
  useMyActivitiesMock.mockReturnValue({ activities: mockActivities });
  useCurrentUserMock.mockReturnValue({ user: { defaultCurrency: "EUR" } });
}

function makeInitial(
  overrides: Partial<TranslationRate> = {},
): TranslationRate {
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

function renderForm(props: Partial<Parameters<typeof RateForm>[0]> = {}) {
  const onSave = vi.fn();
  const onCancel = vi.fn();
  render(
    <RateForm
      type="HOURLY"
      onSave={onSave}
      onCancel={onCancel}
      saving={false}
      {...props}
    />,
  );
  return { onSave, onCancel };
}

describe("RateForm", () => {
  beforeEach(() => {
    useClientsMock.mockReset();
    useMyActivitiesMock.mockReset();
    useCurrentUserMock.mockReset();
    defaultHooks();
  });

  it("shows 'Add Rate' button in create mode", () => {
    renderForm();
    expect(
      screen.getByRole("button", { name: "Add Rate" }),
    ).toBeInTheDocument();
  });

  it("shows 'Save' button in edit mode", () => {
    renderForm({ initial: makeInitial() });
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it("pre-fills name from initial", () => {
    renderForm({ initial: makeInitial({ name: "Premium" }) });
    expect(screen.getByLabelText("Name")).toHaveValue("Premium");
  });

  it("pre-fills amount with 2dp for HOURLY", () => {
    renderForm({ initial: makeInitial({ amount: 55.5 }) });
    expect(screen.getByLabelText(/Amount/)).toHaveValue("55.50");
  });

  it("pre-fills amount with 4dp for PER_WORD", () => {
    renderForm({
      type: "PER_WORD",
      initial: makeInitial({ type: "PER_WORD", amount: 0.12 }),
    });
    expect(screen.getByLabelText(/Amount/)).toHaveValue("0.1200");
  });

  it("shows error when name is empty on submit", () => {
    renderForm();
    // fireEvent.submit bypasses browser constraint validation so handleSubmit runs
    fireEvent.submit(document.querySelector("form")!);
    expect(screen.getByText("Name is required.")).toBeInTheDocument();
  });

  it("shows error when amount is not a number", () => {
    renderForm();
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Test" },
    });
    fireEvent.change(screen.getByLabelText(/Amount/), {
      target: { value: "abc" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add Rate" }));
    expect(
      screen.getByText("Amount must be a valid number ≥ 0."),
    ).toBeInTheDocument();
  });

  it("shows error when amount is negative", () => {
    renderForm();
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Test" },
    });
    fireEvent.change(screen.getByLabelText(/Amount/), {
      target: { value: "-5" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add Rate" }));
    expect(
      screen.getByText("Amount must be a valid number ≥ 0."),
    ).toBeInTheDocument();
  });

  it("calls onSave with correct data on valid submit", () => {
    const { onSave } = renderForm();
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Standard" },
    });
    fireEvent.change(screen.getByLabelText(/Amount/), {
      target: { value: "75.00" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add Rate" }));
    expect(onSave).toHaveBeenCalledWith({
      name: "Standard",
      amount: 75,
      currency: "EUR",
      description: undefined,
      activityId: null,
      clientId: null,
      sourceLanguage: undefined,
      targetLanguage: undefined,
    });
  });

  it("trims leading/trailing whitespace from name on submit", () => {
    const { onSave } = renderForm();
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "  Padded  " },
    });
    fireEvent.change(screen.getByLabelText(/Amount/), {
      target: { value: "10" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add Rate" }));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Padded" }),
    );
  });

  it("treats comma as decimal separator for amount", () => {
    const { onSave } = renderForm();
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Rate" },
    });
    fireEvent.change(screen.getByLabelText(/Amount/), {
      target: { value: "10,5" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add Rate" }));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 10.5 }),
    );
  });

  it("calls onCancel when Cancel is clicked", () => {
    const { onCancel } = renderForm();
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onCancel).toHaveBeenCalled();
  });

  it("disables submit and shows 'Saving…' when saving=true", () => {
    renderForm({ saving: true });
    expect(screen.getByRole("button", { name: "Saving…" })).toBeDisabled();
  });

  it("shows EUR symbol when user defaultCurrency is EUR", () => {
    renderForm();
    expect(screen.getByText("€")).toBeInTheDocument();
  });

  it("shows $ symbol when user defaultCurrency is USD", () => {
    useCurrentUserMock.mockReturnValue({ user: { defaultCurrency: "USD" } });
    renderForm();
    expect(screen.getByText("$")).toBeInTheDocument();
  });

  it("does not show language fields when no activity selected", () => {
    renderForm();
    expect(screen.queryByText("Source language")).not.toBeInTheDocument();
    expect(screen.queryByText("Target language")).not.toBeInTheDocument();
  });

  it("shows language fields when initial has a TRANSLATOR activity", () => {
    // activity id 1 has activityType TRANSLATOR in mockActivities
    renderForm({ initial: makeInitial({ activityId: 1 }) });
    expect(screen.getByText("Source language")).toBeInTheDocument();
    expect(screen.getByText("Target language")).toBeInTheDocument();
  });

  it("does not show language fields when initial has a non-TRANSLATOR activity", () => {
    // activity id 2 has activityType OTHER in mockActivities
    renderForm({ initial: makeInitial({ activityId: 2 }) });
    expect(screen.queryByText("Source language")).not.toBeInTheDocument();
  });

  it("shows error when TRANSLATOR activity is set but sourceLanguage is missing", () => {
    renderForm({ initial: makeInitial({ activityId: 1, name: "Test" }) });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(
      screen.getByText("Source language is required."),
    ).toBeInTheDocument();
  });

  it("shows error when TRANSLATOR activity is set but targetLanguage is missing", () => {
    renderForm({
      initial: makeInitial({
        activityId: 1,
        name: "Test",
        sourceLanguage: "EN",
        targetLanguage: null,
      }),
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(
      screen.getByText("Target language is required."),
    ).toBeInTheDocument();
  });

  it("shows an extra combobox when Other currency checkbox is checked", () => {
    renderForm();
    const countBefore = screen.getAllByRole("combobox").length;
    fireEvent.click(screen.getByLabelText("Other currency"));
    expect(screen.getAllByRole("combobox")).toHaveLength(countBefore + 1);
  });
});
