import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createIntlWrapper } from "@/test/intlWrapper";
import type { Locale } from "@/i18n/useLocale";

const useAllClientsMock = vi.fn();
vi.mock("@/hooks/clients/useClients", () => ({
  useAllClients: () => useAllClientsMock(),
}));

const useMyActivitiesMock = vi.fn();
vi.mock("@/hooks/activities/useActivities", () => ({
  useMyActivities: () => useMyActivitiesMock(),
}));

const useCurrentUserMock = vi.fn();
vi.mock("@/hooks/auth/useAuth", () => ({
  useCurrentUser: () => useCurrentUserMock(),
}));

import {
  defaultMatchRates,
  MATCH_RATE_ITEMS,
} from "@/constants/matchRateItems";
import type { RateSheet } from "@/types/rate-sheets.types";
import { RateSheetForm } from "./RateSheetForm";

const mockActivities = [
  { id: 1, name: "Translation", activityType: "TRANSLATOR" },
];
const mockClients = [{ id: 1, name: "Acme Corp" }];

function defaultHooks() {
  useAllClientsMock.mockReturnValue({ clients: mockClients });
  useMyActivitiesMock.mockReturnValue({ activities: mockActivities });
  useCurrentUserMock.mockReturnValue({ user: { defaultCurrency: "EUR" } });
}

function makeInitial(overrides: Partial<RateSheet> = {}): RateSheet {
  return {
    id: 1,
    userId: 1,
    activityId: null,
    clientId: null,
    name: "EN→FR General",
    description: null,
    sourceLanguage: "EN",
    targetLanguage: "FR",
    currency: "EUR",
    pricePerWord: 0.08,
    matchRates: defaultMatchRates(),
    isDefault: false,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function renderForm(
  props: Partial<Parameters<typeof RateSheetForm>[0]> = {},
  locale: Locale = "en",
) {
  const onSave = vi.fn();
  const onCancel = vi.fn();
  render(
    <RateSheetForm
      onSave={onSave}
      onCancel={onCancel}
      saving={false}
      {...props}
    />,
    { wrapper: createIntlWrapper(locale) },
  );
  return { onSave, onCancel };
}

describe("RateSheetForm", () => {
  beforeEach(() => {
    useAllClientsMock.mockReset();
    useMyActivitiesMock.mockReset();
    useCurrentUserMock.mockReset();
    defaultHooks();
  });

  it("renders name input", () => {
    renderForm();
    expect(screen.getByLabelText("Name")).toBeInTheDocument();
  });

  it("shows 'Save' button", () => {
    renderForm();
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it("pre-fills name from initial", () => {
    renderForm({ initial: makeInitial({ name: "EN→DE Premium" }) });
    expect(screen.getByLabelText("Name")).toHaveValue("EN→DE Premium");
  });

  it("pre-fills price per word with 4dp from initial", () => {
    renderForm({ initial: makeInitial({ pricePerWord: 0.05 }) });
    expect(screen.getByLabelText("Price per word")).toHaveValue("0.0500");
  });

  it("pre-fills description from initial", () => {
    renderForm({ initial: makeInitial({ description: "My desc" }) });
    expect(screen.getByLabelText("Description")).toHaveValue("My desc");
  });

  it("shows error when name is empty on submit", () => {
    renderForm();
    // fireEvent.submit bypasses browser constraint validation so handleSubmit runs
    fireEvent.submit(document.querySelector("form")!);
    expect(screen.getByText("Name is required.")).toBeInTheDocument();
  });

  it("shows error when pricePerWord is invalid", () => {
    renderForm();
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Sheet" },
    });
    fireEvent.change(screen.getByLabelText("Price per word"), {
      target: { value: "abc" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(
      screen.getByText("Price per word must be a valid number ≥ 0."),
    ).toBeInTheDocument();
  });

  it("shows error when activity selected but sourceLanguage is missing", () => {
    // activityId set ⇒ showLanguageFields=true; empty sourceLanguage fails validation
    renderForm({
      initial: makeInitial({
        activityId: 1,
        sourceLanguage: "",
        name: "Sheet",
      }),
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(
      screen.getByText("Source language is required."),
    ).toBeInTheDocument();
  });

  it("shows error when activity selected but targetLanguage is missing", () => {
    renderForm({
      initial: makeInitial({
        activityId: 1,
        sourceLanguage: "EN",
        targetLanguage: "",
        name: "Sheet",
      }),
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(
      screen.getByText("Target language is required."),
    ).toBeInTheDocument();
  });

  it("calls onSave with correct data on valid submit", () => {
    const { onSave } = renderForm();
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Test Sheet" },
    });
    fireEvent.change(screen.getByLabelText("Price per word"), {
      target: { value: "0.0500" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onSave).toHaveBeenCalledWith({
      activityId: null,
      clientId: null,
      name: "Test Sheet",
      description: null,
      sourceLanguage: "",
      targetLanguage: "",
      currency: "EUR",
      pricePerWord: 0.05,
      matchRates: defaultMatchRates(),
      isDefault: false,
    });
  });

  it("clearing the description of an existing sheet sends null so it is erased", () => {
    const { onSave } = renderForm({
      initial: makeInitial({ description: "My desc" }),
    });
    fireEvent.change(screen.getByLabelText("Description"), {
      target: { value: "" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ description: null }),
    );
  });

  it("treats a whitespace-only description as empty", () => {
    const { onSave } = renderForm({
      initial: makeInitial({ description: "My desc" }),
    });
    fireEvent.change(screen.getByLabelText("Description"), {
      target: { value: "   " },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ description: null }),
    );
  });

  it("keeps a sheet's own currency when editing it, even if it differs from the user default", () => {
    const { onSave } = renderForm({
      initial: makeInitial({ currency: "USD" }),
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ currency: "USD" }),
    );
  });

  it("keeps the default-sheet flag and custom match rates when editing", () => {
    const matchRates = { ...defaultMatchRates(), perfectMatch: 15 };
    const { onSave } = renderForm({
      initial: makeInitial({ clientId: 1, isDefault: true, matchRates }),
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ isDefault: true, matchRates }),
    );
  });

  it("caps a match percentage at 100", () => {
    const { onSave } = renderForm({ initial: makeInitial() });
    fireEvent.change(screen.getAllByRole("spinbutton")[0], {
      target: { value: "150" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        matchRates: expect.objectContaining({ perfectMatch: 100 }),
      }),
    );
  });

  it("only offers translator activities, since rate sheets are per-word", () => {
    useMyActivitiesMock.mockReturnValue({
      activities: [
        ...mockActivities,
        { id: 2, name: "Consulting", activityType: "CUSTOM" },
      ],
    });
    renderForm();
    fireEvent.click(screen.getByLabelText("Activity (optional)"));
    expect(
      screen.getByRole("option", { name: "Translation" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("option", { name: "Consulting" }),
    ).not.toBeInTheDocument();
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

  it("renders all match rate category labels", () => {
    renderForm();
    for (const { label } of MATCH_RATE_ITEMS) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it("renders one spinbutton input per match rate row", () => {
    renderForm();
    expect(screen.getAllByRole("spinbutton")).toHaveLength(
      MATCH_RATE_ITEMS.length,
    );
  });

  it("shows 0.0000€ price preview for every row at default state", () => {
    renderForm();
    // default: pricePerWord=0.0000 and all pct=0 → price=0 for every row
    const previews = screen.getAllByText("0.0000€");
    expect(previews).toHaveLength(MATCH_RATE_ITEMS.length);
  });

  it("updates price preview when pct changes", () => {
    renderForm();
    fireEvent.change(screen.getByLabelText("Price per word"), {
      target: { value: "1.0000" },
    });
    // change first match rate (perfectMatch) to 100%
    const pctInputs = screen.getAllByRole("spinbutton");
    fireEvent.change(pctInputs[0], { target: { value: "100" } });
    // price = 1.0000 * (100/100) = 1.0000€
    expect(screen.getByText("1.0000€")).toBeInTheDocument();
  });

  it("does not show language fields when no activity selected", () => {
    renderForm();
    expect(screen.queryByText("Source language")).not.toBeInTheDocument();
    expect(screen.queryByText("Target language")).not.toBeInTheDocument();
  });

  it("shows language fields when initial has activityId set", () => {
    // showLanguageFields = activityId !== "__none__"
    renderForm({ initial: makeInitial({ activityId: 1 }) });
    expect(screen.getByText("Source language")).toBeInTheDocument();
    expect(screen.getByText("Target language")).toBeInTheDocument();
  });

  it("shows EUR symbol in price per word area by default", () => {
    renderForm();
    expect(screen.getByText("€")).toBeInTheDocument();
  });

  it("shows an extra combobox when Other currency checkbox is checked", () => {
    renderForm();
    const countBefore = screen.getAllByRole("combobox").length;
    fireEvent.click(screen.getByLabelText("Other currency"));
    expect(screen.getAllByRole("combobox")).toHaveLength(countBefore + 1);
  });

  it("hides the default-rate-sheet checkbox when no client is selected", () => {
    renderForm();
    expect(
      screen.queryByText("Default rate sheet for this client"),
    ).not.toBeInTheDocument();
  });

  it("shows the default-rate-sheet checkbox once a client is selected and sends isDefault on save", () => {
    const { onSave } = renderForm({
      initial: makeInitial({ clientId: 1, name: "Sheet" }),
    });
    fireEvent.click(
      screen.getByRole("checkbox", {
        name: "Default rate sheet for this client",
      }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ clientId: 1, isDefault: true }),
    );
  });

  it("does not send isDefault true when the client is cleared back to none", () => {
    const { onSave } = renderForm({
      initial: makeInitial({ clientId: 1, isDefault: true, name: "Sheet" }),
    });
    fireEvent.click(screen.getByLabelText("Client (optional)"));
    fireEvent.click(screen.getByRole("option", { name: "No client" }));
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ clientId: null, isDefault: false }),
    );
  });

  it("renders French copy when locale is fr", () => {
    renderForm({}, "fr");

    expect(screen.getByLabelText("Nom")).toBeInTheDocument();
    expect(screen.getByLabelText("Prix au mot")).toBeInTheDocument();
    expect(screen.getByText("Taux de correspondance")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Enregistrer" }),
    ).toBeInTheDocument();
  });
});
