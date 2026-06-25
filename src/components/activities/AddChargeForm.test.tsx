import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { gqlFetch, gqlMutate } = vi.hoisted(() => ({
  gqlFetch: vi.fn(),
  gqlMutate: vi.fn(),
}));

vi.mock("@/lib/apollo", () => ({ gqlFetch, gqlMutate }));

import { QueryClientProvider } from "@tanstack/react-query";
import { createQueryClient } from "@/test/queryClientWrapper";
import { AddChargeForm } from "./AddChargeForm";

function renderForm(type: "FIXED" | "VARIABLE" = "FIXED") {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <AddChargeForm activityId={10} type={type} />
    </QueryClientProvider>,
  );
}

describe("AddChargeForm", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("starts collapsed showing only the '+ Add' button", () => {
    renderForm();

    expect(screen.getByText("+ Add")).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("Name")).not.toBeInTheDocument();
  });

  it("expands to the form when '+ Add' is clicked", () => {
    renderForm();

    fireEvent.click(screen.getByText("+ Add"));

    expect(screen.getByPlaceholderText("Name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("0.00")).toBeInTheDocument();
  });

  it("Cancel collapses the form back", () => {
    renderForm();

    fireEvent.click(screen.getByText("+ Add"));
    fireEvent.click(screen.getByText("Cancel"));

    expect(screen.queryByPlaceholderText("Name")).not.toBeInTheDocument();
    expect(screen.getByText("+ Add")).toBeInTheDocument();
  });

  it("submits the charge with name/amount/type and collapses on success", async () => {
    gqlMutate.mockResolvedValueOnce({ createCharge: { id: 1 } });
    renderForm("VARIABLE");

    fireEvent.click(screen.getByText("+ Add"));
    fireEvent.change(screen.getByPlaceholderText("Name"), {
      target: { value: "Software" },
    });
    fireEvent.change(screen.getByPlaceholderText("0.00"), {
      target: { value: "12.5" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add" }));

    await waitFor(() =>
      expect(gqlMutate).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          input: expect.objectContaining({
            name: "Software",
            amount: 1250,
            type: "VARIABLE",
            activityId: 10,
          }),
        }),
      ),
    );
    await waitFor(() =>
      expect(screen.queryByPlaceholderText("Name")).not.toBeInTheDocument(),
    );
  });

  it("does not submit when name is blank", () => {
    renderForm();

    fireEvent.click(screen.getByText("+ Add"));
    fireEvent.change(screen.getByPlaceholderText("0.00"), {
      target: { value: "10" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add" }));

    expect(gqlMutate).not.toHaveBeenCalled();
  });

  it("does not submit when amount is not a valid number", () => {
    renderForm();

    fireEvent.click(screen.getByText("+ Add"));
    fireEvent.change(screen.getByPlaceholderText("Name"), {
      target: { value: "Travel" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add" }));

    expect(gqlMutate).not.toHaveBeenCalled();
  });
});
