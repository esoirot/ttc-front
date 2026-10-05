import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { gqlFetch, gqlMutate } = vi.hoisted(() => ({
  gqlFetch: vi.fn(),
  gqlMutate: vi.fn(),
}));

vi.mock("@/lib/apollo", () => ({ gqlFetch, gqlMutate }));

import { QueryClientProvider } from "@tanstack/react-query";
import { IntlProvider } from "react-intl";
import { createQueryClient } from "@/test/queryClientWrapper";
import { messages } from "@/i18n/messages";
import type { CustomField } from "@/types/activities.types";
import { CustomFieldsSection } from "./CustomFieldsSection";

function makeField(overrides: Partial<CustomField> = {}): CustomField {
  return {
    id: 1,
    activityId: 5,
    key: "Platform",
    value: "Upwork",
    ...overrides,
  };
}

function renderSection(initialFields: CustomField[] = []) {
  return render(
    <IntlProvider locale="en" messages={messages.en}>
      <QueryClientProvider client={createQueryClient()}>
        <CustomFieldsSection activityId={5} initialFields={initialFields} />
      </QueryClientProvider>
    </IntlProvider>,
  );
}

describe("CustomFieldsSection", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("pre-fills one row per existing custom field", () => {
    renderSection([
      makeField({ id: 1 }),
      makeField({ id: 2, key: "Rate basis", value: "Hourly" }),
    ]);

    expect(screen.getByDisplayValue("Platform")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Upwork")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Rate basis")).toBeInTheDocument();
    expect(screen.getAllByLabelText("Remove field")).toHaveLength(2);
  });

  it("saves the edited list, trimming field names and values", async () => {
    gqlMutate.mockResolvedValueOnce({ updateActivity: { id: 5 } });
    renderSection([makeField()]);

    fireEvent.change(screen.getByDisplayValue("Upwork"), {
      target: { value: "  Malt  " },
    });
    fireEvent.click(screen.getByText("+ Add field"));
    const names = screen.getAllByPlaceholderText("Field name");
    const values = screen.getAllByPlaceholderText("Value");
    fireEvent.change(names[1], { target: { value: " Currency " } });
    fireEvent.change(values[1], { target: { value: "EUR" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(gqlMutate).toHaveBeenCalledWith(expect.anything(), {
        input: {
          id: 5,
          customFields: [
            { key: "Platform", value: "Malt" },
            { key: "Currency", value: "EUR" },
          ],
        },
      }),
    );
    expect(await screen.findByText("Saved.")).toBeInTheDocument();
  });

  it("removing every field and saving clears them", async () => {
    gqlMutate.mockResolvedValueOnce({ updateActivity: { id: 5 } });
    renderSection([makeField()]);

    fireEvent.click(screen.getByLabelText("Remove field"));
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(gqlMutate).toHaveBeenCalledWith(expect.anything(), {
        input: { id: 5, customFields: [] },
      }),
    );
  });

  it("disables Save while a field has no name", () => {
    renderSection([]);

    fireEvent.click(screen.getByText("+ Add field"));
    fireEvent.change(screen.getByPlaceholderText("Value"), {
      target: { value: "orphan value" },
    });

    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
  });

  it("does not claim Saved. before anything is saved", () => {
    renderSection([makeField()]);

    expect(screen.queryByText("Saved.")).not.toBeInTheDocument();
  });

  it("hides the Saved. confirmation after 3 seconds", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    gqlMutate.mockResolvedValueOnce({ updateActivity: { id: 5 } });
    renderSection([makeField()]);

    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(await screen.findByText("Saved.")).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(3_000);
    });
    expect(screen.queryByText("Saved.")).not.toBeInTheDocument();
  });

  it("does not reload the page when the form is submitted", () => {
    gqlMutate.mockResolvedValueOnce({ updateActivity: { id: 5 } });
    renderSection([makeField()]);

    const form = screen.getByRole("button", { name: "Save" }).closest("form")!;
    expect(fireEvent.submit(form)).toBe(false);
  });

  it("treats a name made only of spaces as missing and does not save it", () => {
    renderSection([]);

    fireEvent.click(screen.getByText("+ Add field"));
    fireEvent.change(screen.getByPlaceholderText("Field name"), {
      target: { value: "   " },
    });

    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
    fireEvent.submit(
      screen.getByRole("button", { name: "Save" }).closest("form")!,
    );
    expect(gqlMutate).not.toHaveBeenCalled();
  });

  it("adds a new empty row", () => {
    renderSection([]);

    fireEvent.click(screen.getByText("+ Add field"));

    expect(screen.getByPlaceholderText("Field name")).toHaveValue("");
    expect(screen.getByPlaceholderText("Value")).toHaveValue("");
  });

  it("removes only the row whose remove button was clicked", () => {
    renderSection([
      makeField({ id: 1 }),
      makeField({ id: 2, key: "Rate basis", value: "Hourly" }),
    ]);

    fireEvent.click(screen.getAllByLabelText("Remove field")[0]);

    expect(screen.queryByDisplayValue("Platform")).not.toBeInTheDocument();
    expect(screen.getByDisplayValue("Rate basis")).toBeInTheDocument();
  });
});
