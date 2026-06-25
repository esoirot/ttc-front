import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { gqlFetch, gqlMutate } = vi.hoisted(() => ({
  gqlFetch: vi.fn(),
  gqlMutate: vi.fn(),
}));

vi.mock("@/lib/apollo", () => ({ gqlFetch, gqlMutate }));

import { QueryClientProvider } from "@tanstack/react-query";
import { createQueryClient } from "@/test/queryClientWrapper";
import { ObjectivesForm } from "./ObjectivesForm";

function renderForm(
  initial: {
    objectiveQ1?: number | null;
    objectiveQ2?: number | null;
    objectiveQ3?: number | null;
    objectiveQ4?: number | null;
  } = {},
) {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <ObjectivesForm activityId={3} initial={initial} />
    </QueryClientProvider>,
  );
}

describe("ObjectivesForm", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("pre-fills each quarter input from initial cents converted to euros", () => {
    renderForm({
      objectiveQ1: 100000,
      objectiveQ2: 200000,
      objectiveQ3: null,
      objectiveQ4: 400000,
    });

    const inputs = screen.getAllByRole("spinbutton");
    expect(inputs[0]).toHaveValue(1000);
    expect(inputs[1]).toHaveValue(2000);
    expect(inputs[2]).toHaveValue(null);
    expect(inputs[3]).toHaveValue(4000);
  });

  it("submits all four quarters converted to cents", async () => {
    gqlMutate.mockResolvedValueOnce({ updateActivity: { id: 3 } });
    renderForm();

    const inputs = screen.getAllByRole("spinbutton");
    fireEvent.change(inputs[0], { target: { value: "1000" } });
    fireEvent.change(inputs[1], { target: { value: "2000" } });
    fireEvent.click(screen.getByRole("button", { name: "Save objectives" }));

    await waitFor(() =>
      expect(gqlMutate).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          input: expect.objectContaining({
            id: 3,
            objectiveQ1: 100000,
            objectiveQ2: 200000,
            objectiveQ3: null,
            objectiveQ4: null,
          }),
        }),
      ),
    );
  });

  it("shows the saved confirmation after a successful save", async () => {
    gqlMutate.mockResolvedValueOnce({ updateActivity: { id: 3 } });
    renderForm();

    fireEvent.click(screen.getByRole("button", { name: "Save objectives" }));

    expect(await screen.findByText("Objectives saved.")).toBeInTheDocument();
  });

  it("shows the save error message when the mutation rejects", async () => {
    gqlMutate.mockRejectedValueOnce(new Error("Server error"));
    renderForm();

    fireEvent.click(screen.getByRole("button", { name: "Save objectives" }));

    expect(await screen.findByText("Server error")).toBeInTheDocument();
  });

  it("disables submit and shows 'Saving…' while the mutation is pending", async () => {
    let resolveMutate!: (v: { updateActivity: { id: number } }) => void;
    gqlMutate.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveMutate = resolve;
      }),
    );
    renderForm();

    fireEvent.click(screen.getByRole("button", { name: "Save objectives" }));

    expect(
      await screen.findByRole("button", { name: "Saving…" }),
    ).toBeDisabled();

    resolveMutate({ updateActivity: { id: 3 } });
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Save objectives" }),
      ).not.toBeDisabled(),
    );
  });
});
