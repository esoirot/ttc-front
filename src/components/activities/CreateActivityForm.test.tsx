import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { gqlFetch, gqlMutate } = vi.hoisted(() => ({
  gqlFetch: vi.fn(),
  gqlMutate: vi.fn(),
}));

vi.mock("@/lib/apollo", () => ({ gqlFetch, gqlMutate }));

const navigateMock = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom",
    );
  return { ...actual, useNavigate: () => navigateMock };
});

import { QueryClientProvider } from "@tanstack/react-query";
import { createQueryClient } from "@/test/queryClientWrapper";
import { CreateActivityForm } from "./CreateActivityForm";

function renderForm(onCancel = vi.fn()) {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <CreateActivityForm onCancel={onCancel} />
    </QueryClientProvider>,
  );
}

describe("CreateActivityForm", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
    navigateMock.mockReset();
  });

  it("defaults to the Custom type with custom fields section shown", () => {
    renderForm();

    expect(screen.getByText("Custom fields")).toBeInTheDocument();
    expect(screen.getByLabelText("Activity name")).toHaveValue("");
  });

  it("disables Create until a name is entered", () => {
    renderForm();

    expect(screen.getByRole("button", { name: "Create" })).toBeDisabled();

    fireEvent.change(screen.getByLabelText("Activity name"), {
      target: { value: "My activity" },
    });

    expect(screen.getByRole("button", { name: "Create" })).not.toBeDisabled();
  });

  it("Cancel calls onCancel", () => {
    const onCancel = vi.fn();
    renderForm(onCancel);

    fireEvent.click(screen.getByText("Cancel"));
    expect(onCancel).toHaveBeenCalled();
  });

  it("submits with trimmed name and null customFields, then navigates to the new activity", async () => {
    gqlMutate.mockResolvedValueOnce({
      createActivity: { id: 42, name: "My activity", activityType: "CUSTOM" },
    });
    renderForm();

    fireEvent.change(screen.getByLabelText("Activity name"), {
      target: { value: "  My activity  " },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create" }));

    await waitFor(() =>
      expect(gqlMutate).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          input: expect.objectContaining({
            name: "My activity",
            activityType: "CUSTOM",
            languagePairs: null,
            customFields: null,
          }),
        }),
      ),
    );
    await waitFor(() =>
      expect(navigateMock).toHaveBeenCalledWith("/activities/42"),
    );
  });

  it("includes custom fields in the submission when added and filled in", async () => {
    gqlMutate.mockResolvedValueOnce({
      createActivity: { id: 1, name: "X", activityType: "CUSTOM" },
    });
    renderForm();

    fireEvent.change(screen.getByLabelText("Activity name"), {
      target: { value: "X" },
    });
    fireEvent.click(screen.getByText("+ Add field"));
    fireEvent.change(screen.getByPlaceholderText("Field name"), {
      target: { value: "Rate" },
    });
    fireEvent.change(screen.getByPlaceholderText("Value"), {
      target: { value: "0.10" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create" }));

    await waitFor(() =>
      expect(gqlMutate).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          input: expect.objectContaining({
            customFields: [{ key: "Rate", value: "0.10" }],
          }),
        }),
      ),
    );
  });

  function selectActivityType(name: string) {
    fireEvent.click(screen.getAllByRole("combobox")[0]);
    fireEvent.click(screen.getByRole("option", { name }));
  }

  it("shows the Languages section and sends languagePairs: null for Translator type with no pairs added", async () => {
    gqlMutate.mockResolvedValueOnce({
      createActivity: { id: 7, name: "Y", activityType: "TRANSLATOR" },
    });
    renderForm();

    selectActivityType("Translator");
    expect(screen.getByText("Languages")).toBeInTheDocument();
    expect(screen.queryByText("Custom fields")).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Activity name"), {
      target: { value: "Y" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create" }));

    await waitFor(() =>
      expect(gqlMutate).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          input: expect.objectContaining({
            activityType: "TRANSLATOR",
            languagePairs: null,
          }),
        }),
      ),
    );
  });

  it("sends the filled language pairs array for Translator type when a pair is added", async () => {
    gqlMutate.mockResolvedValueOnce({
      createActivity: { id: 8, name: "Z", activityType: "TRANSLATOR" },
    });
    renderForm();

    selectActivityType("Translator");
    fireEvent.change(screen.getByLabelText("Activity name"), {
      target: { value: "Z" },
    });
    fireEvent.click(screen.getByText("+ Add pair"));

    const [, fromTrigger, toTrigger] = screen.getAllByRole("combobox");
    fireEvent.click(fromTrigger);
    fireEvent.click(screen.getByRole("option", { name: /English \(EN\)/ }));
    fireEvent.click(toTrigger);
    fireEvent.click(screen.getByRole("option", { name: /French \(FR\)/ }));

    fireEvent.click(screen.getByRole("button", { name: "Create" }));

    await waitFor(() =>
      expect(gqlMutate).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          input: expect.objectContaining({
            languagePairs: [{ fromLanguage: "EN", toLanguage: "FR" }],
          }),
        }),
      ),
    );
  });

  it("does not call createActivity when the form is invalid on submit", async () => {
    renderForm();

    // name is required — bypass native constraint validation to exercise
    // the isValid() early-return guard directly.
    fireEvent.submit(
      screen.getByRole("button", { name: "Create" }).closest("form")!,
    );

    await new Promise((r) => setTimeout(r, 0));
    expect(gqlMutate).not.toHaveBeenCalled();
  });

  it("does not navigate when the mutation resolves without a created activity", async () => {
    gqlMutate.mockResolvedValueOnce({ createActivity: null });
    renderForm();

    fireEvent.change(screen.getByLabelText("Activity name"), {
      target: { value: "X" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create" }));

    await waitFor(() => expect(gqlMutate).toHaveBeenCalled());
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it("shows 'Creating…' and disables submit while the mutation is pending", async () => {
    let resolveMutate!: (v: {
      createActivity: { id: number; name: string };
    }) => void;
    gqlMutate.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveMutate = resolve;
      }),
    );
    renderForm();

    fireEvent.change(screen.getByLabelText("Activity name"), {
      target: { value: "X" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create" }));

    expect(
      await screen.findByRole("button", { name: "Creating…" }),
    ).toBeDisabled();

    resolveMutate({ createActivity: { id: 1, name: "X" } });
    await waitFor(() => expect(navigateMock).toHaveBeenCalled());
  });
});
