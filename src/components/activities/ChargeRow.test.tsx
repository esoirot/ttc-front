import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { gqlFetch, gqlMutate } = vi.hoisted(() => ({
  gqlFetch: vi.fn(),
  gqlMutate: vi.fn(),
}));

vi.mock("@/lib/apollo", () => ({ gqlFetch, gqlMutate }));

import { QueryClientProvider } from "@tanstack/react-query";
import { createQueryClient } from "@/test/queryClientWrapper";
import type { Charge } from "@/types/activities.types";
import { ChargeRow } from "./ChargeRow";

function makeCharge(overrides: Partial<Charge> = {}): Charge {
  return {
    id: 1,
    activityId: 10,
    name: "Travel",
    amount: 2000,
    type: "FIXED",
    ...overrides,
  };
}

function renderRow(charge: Charge = makeCharge()) {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <ChargeRow charge={charge} activityId={10} />
    </QueryClientProvider>,
  );
}

describe("ChargeRow", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("shows the charge name in view mode", () => {
    renderRow();
    expect(screen.getByText("Travel")).toBeInTheDocument();
  });

  it("opens an edit form pre-filled with name and euro amount", () => {
    renderRow(makeCharge({ name: "Travel", amount: 2050 }));

    fireEvent.click(screen.getByText("✎"));

    expect(screen.getByDisplayValue("Travel")).toBeInTheDocument();
    expect(screen.getByDisplayValue("20.50")).toBeInTheDocument();
  });

  it("Cancel exits edit mode without saving", () => {
    renderRow();

    fireEvent.click(screen.getByText("✎"));
    fireEvent.change(screen.getByDisplayValue("Travel"), {
      target: { value: "Changed" },
    });
    fireEvent.click(screen.getByText("Cancel"));

    expect(gqlMutate).not.toHaveBeenCalled();
    expect(screen.getByText("Travel")).toBeInTheDocument();
  });

  it("saves the edited name/amount converted to cents and exits edit mode", async () => {
    gqlMutate.mockResolvedValueOnce({
      updateCharge: { id: 1, name: "Renamed", amount: 1550, type: "FIXED" },
    });
    renderRow();

    fireEvent.click(screen.getByText("✎"));
    fireEvent.change(screen.getByDisplayValue("Travel"), {
      target: { value: "Renamed" },
    });
    fireEvent.change(screen.getByDisplayValue("20.00"), {
      target: { value: "15.50" },
    });
    fireEvent.click(screen.getByText("Save"));

    await waitFor(() =>
      expect(gqlMutate).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          input: expect.objectContaining({
            id: 1,
            name: "Renamed",
            amount: 1550,
          }),
        }),
      ),
    );
    await waitFor(() =>
      expect(screen.queryByDisplayValue("Renamed")).not.toBeInTheDocument(),
    );
  });

  it("deletes the charge when the confirm dialog is accepted", async () => {
    gqlMutate.mockResolvedValueOnce({ deleteCharge: true });
    renderRow(makeCharge({ id: 7 }));

    fireEvent.click(screen.getByText("✕"));
    fireEvent.click(screen.getByText("Delete"));

    await waitFor(() =>
      expect(gqlMutate).toHaveBeenCalledWith(expect.anything(), { id: 7 }),
    );
  });

  it("does not delete when the dialog is cancelled", () => {
    renderRow();

    fireEvent.click(screen.getByText("✕"));
    fireEvent.click(screen.getByText("Cancel"));

    expect(gqlMutate).not.toHaveBeenCalled();
  });
});
