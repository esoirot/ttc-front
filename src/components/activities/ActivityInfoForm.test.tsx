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

  it("sends name: null when the name field is blank", async () => {
    gqlMutate.mockResolvedValueOnce({ updateActivity: { id: 5 } });
    renderForm();

    fireEvent.change(screen.getByLabelText("Activity name"), {
      target: { value: "   " },
    });
    // Activity name is `required` — a real click would be blocked by native
    // constraint validation before whitespace-only input reaches the JS
    // handler; fire the submit event directly to exercise the trim-to-null
    // branch regardless.
    fireEvent.submit(
      screen.getByRole("button", { name: "Save" }).closest("form")!,
    );

    await waitFor(() =>
      expect(gqlMutate).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          input: expect.objectContaining({ name: null }),
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

  it("updates companyName, professionalPhone, and website fields on change", () => {
    renderForm();

    fireEvent.change(screen.getByLabelText("Registered company name"), {
      target: { value: "New Co" },
    });
    fireEvent.change(screen.getByLabelText("Professional phone"), {
      target: { value: "+15550001111" },
    });
    fireEvent.change(screen.getByLabelText("Website"), {
      target: { value: "https://new-co.example" },
    });

    expect(screen.getByLabelText("Registered company name")).toHaveValue(
      "New Co",
    );
    expect(screen.getByLabelText("Professional phone")).toHaveValue(
      "+15550001111",
    );
    expect(screen.getByLabelText("Website")).toHaveValue(
      "https://new-co.example",
    );
  });

  it("submits truthy companyName/professionalPhone/website unchanged (not null)", async () => {
    gqlMutate.mockResolvedValueOnce({ updateActivity: { id: 5 } });
    renderForm(
      makeInitial({
        companyName: "Acme SARL",
        professionalPhone: "+33123456789",
        website: "https://acme.com",
      }),
    );

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(gqlMutate).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          input: expect.objectContaining({
            companyName: "Acme SARL",
            professionalPhone: "+33123456789",
            website: "https://acme.com",
          }),
        }),
      ),
    );
  });

  it("blocks submit and shows a validation error for a malformed professional email", async () => {
    renderForm();

    fireEvent.change(screen.getByLabelText("Professional email"), {
      target: { value: "not-an-email" },
    });
    // fireEvent.click on the submit button would trigger the browser's
    // native type="email" constraint validation first, short-circuiting
    // before our JS handler runs — fire the submit event directly instead.
    fireEvent.submit(
      screen.getByRole("button", { name: "Save" }).closest("form")!,
    );

    expect(
      await screen.findByText("Enter a valid professional email address"),
    ).toBeInTheDocument();
    expect(gqlMutate).not.toHaveBeenCalled();
  });

  it("blocks submit and shows a validation error for a javascript: website URL", async () => {
    renderForm();

    fireEvent.change(screen.getByLabelText("Website"), {
      target: { value: "javascript:alert(1)" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(
      await screen.findByText("Enter a valid website URL"),
    ).toBeInTheDocument();
    expect(gqlMutate).not.toHaveBeenCalled();
  });

  it("hides the 'Saved.' message again after the timeout elapses", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    gqlMutate.mockResolvedValueOnce({ updateActivity: { id: 5 } });
    renderForm();

    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(await screen.findByText("Saved.")).toBeInTheDocument();

    vi.advanceTimersByTime(3000);
    await waitFor(() =>
      expect(screen.queryByText("Saved.")).not.toBeInTheDocument(),
    );
    vi.useRealTimers();
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
