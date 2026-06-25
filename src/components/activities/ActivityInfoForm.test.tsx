import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { gqlFetch, gqlMutate } = vi.hoisted(() => ({
  gqlFetch: vi.fn(),
  gqlMutate: vi.fn(),
}));

vi.mock("@/lib/apollo", () => ({ gqlFetch, gqlMutate }));

import { QueryClientProvider } from "@tanstack/react-query";
import { createQueryClient } from "@/test/queryClientWrapper";
import { ActivityInfoForm } from "./ActivityInfoForm";

function makeInitial(overrides = {}) {
  return {
    name: "Freelance",
    companyName: null,
    legalForm: null,
    professionalEmail: null,
    professionalPhone: null,
    website: null,
    timezone: null,
    ...overrides,
  };
}

function renderForm(initial = makeInitial()) {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <ActivityInfoForm activityId={5} initial={initial} />
    </QueryClientProvider>,
  );
}

describe("ActivityInfoForm", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("pre-fills text fields from initial", () => {
    renderForm(
      makeInitial({
        name: "Freelance",
        companyName: "Acme SARL",
        professionalEmail: "pro@acme.com",
        professionalPhone: "+33123456789",
        website: "https://acme.com",
      }),
    );

    expect(screen.getByLabelText("Activity name")).toHaveValue("Freelance");
    expect(screen.getByLabelText("Registered company name")).toHaveValue(
      "Acme SARL",
    );
    expect(screen.getByLabelText("Professional email")).toHaveValue(
      "pro@acme.com",
    );
    expect(screen.getByLabelText("Professional phone")).toHaveValue(
      "+33123456789",
    );
    expect(screen.getByLabelText("Website")).toHaveValue("https://acme.com");
  });

  it("falls back to empty strings when optional fields are null", () => {
    renderForm();

    expect(screen.getByLabelText("Registered company name")).toHaveValue("");
    expect(screen.getByLabelText("Professional email")).toHaveValue("");
  });

  it("submits trimmed values, converting blanks to null", async () => {
    gqlMutate.mockResolvedValueOnce({ updateActivity: { id: 5 } });
    renderForm();

    fireEvent.change(screen.getByLabelText("Activity name"), {
      target: { value: "  Renamed  " },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(gqlMutate).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          input: expect.objectContaining({
            id: 5,
            name: "Renamed",
            companyName: null,
            legalForm: null,
            professionalEmail: null,
            professionalPhone: null,
            website: null,
            timezone: null,
          }),
        }),
      ),
    );
  });

  it("shows 'Saved.' after a successful save", async () => {
    gqlMutate.mockResolvedValueOnce({ updateActivity: { id: 5 } });
    renderForm();

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByText("Saved.")).toBeInTheDocument();
  });

  it("disables submit and shows 'Saving…' while pending", async () => {
    let resolveMutate!: (v: { updateActivity: { id: number } }) => void;
    gqlMutate.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveMutate = resolve;
      }),
    );
    renderForm();

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(
      await screen.findByRole("button", { name: "Saving…" }),
    ).toBeDisabled();

    resolveMutate({ updateActivity: { id: 5 } });
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Save" })).not.toBeDisabled(),
    );
  });
});
