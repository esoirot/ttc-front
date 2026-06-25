import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryClient } from "@/test/queryClientWrapper";
import type { ClientRate } from "@/types/client-rates.types";

const { gqlFetch, gqlMutate } = vi.hoisted(() => ({
  gqlFetch: vi.fn(),
  gqlMutate: vi.fn(),
}));

vi.mock("@/lib/apollo", () => ({ gqlFetch, gqlMutate }));

import { ClientRatesTab } from "./ClientRatesTab";

function makeRate(overrides: Partial<ClientRate> = {}): ClientRate {
  return {
    id: 1,
    clientId: 5,
    userId: 1,
    type: "HOURLY",
    name: "Standard",
    amount: 40,
    currency: "EUR",
    description: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function renderTab(clientId = 5) {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <ClientRatesTab clientId={clientId} />
    </QueryClientProvider>,
  );
}

describe("ClientRatesTab", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("shows an empty state when there are no rates", async () => {
    gqlFetch.mockResolvedValueOnce({ clientRates: [] });

    renderTab();

    expect(
      await screen.findByText("No rates defined for this client yet."),
    ).toBeInTheDocument();
  });

  it("renders each rate's type, name, amount, and currency", async () => {
    gqlFetch.mockResolvedValueOnce({
      clientRates: [makeRate({ name: "Discounted", amount: 35.5 })],
    });

    renderTab();

    expect(await screen.findByText("Discounted")).toBeInTheDocument();
    expect(screen.getByText("35.50")).toBeInTheDocument();
    expect(screen.getByText("EUR")).toBeInTheDocument();
  });

  it("opens and cancels the add-rate form", async () => {
    gqlFetch.mockResolvedValueOnce({ clientRates: [] });

    renderTab();
    await screen.findByText("No rates defined for this client yet.");

    fireEvent.click(screen.getByText("+ Add Rate"));
    expect(screen.getByLabelText("Name")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Cancel"));
    expect(screen.queryByLabelText("Name")).not.toBeInTheDocument();
  });

  it("creates a new rate with the parsed amount", async () => {
    gqlFetch.mockResolvedValueOnce({ clientRates: [] });
    gqlMutate.mockResolvedValueOnce({ createClientRate: makeRate({ id: 2 }) });

    renderTab();
    await screen.findByText("No rates defined for this client yet.");

    fireEvent.click(screen.getByText("+ Add Rate"));
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "New rate" },
    });
    fireEvent.change(screen.getByLabelText(/Amount/), {
      target: { value: "42.5" },
    });
    fireEvent.click(screen.getByText("Add Rate"));

    await waitFor(() =>
      expect(gqlMutate.mock.calls[0][1]).toMatchObject({
        input: {
          type: "HOURLY",
          name: "New rate",
          amount: 42.5,
          currency: "EUR",
        },
      }),
    );
  });

  it("switches a rate to inline edit mode", async () => {
    gqlFetch.mockResolvedValueOnce({
      clientRates: [makeRate({ id: 3, name: "Editable" })],
    });

    renderTab();
    await screen.findByText("Editable");

    fireEvent.click(screen.getByText("Edit"));

    expect(screen.getByLabelText("Name")).toHaveValue("Editable");
  });

  it("deletes a rate after confirming", async () => {
    gqlFetch.mockResolvedValueOnce({
      clientRates: [makeRate({ id: 4, name: "ToDelete" })],
    });
    gqlMutate.mockResolvedValueOnce({ deleteClientRate: true });

    renderTab();
    await screen.findByText("ToDelete");

    fireEvent.click(screen.getByText("✕"));
    fireEvent.click(screen.getByText("Delete"));

    await waitFor(() =>
      expect(gqlMutate).toHaveBeenCalledWith(expect.anything(), { id: 4 }),
    );
  });
});
