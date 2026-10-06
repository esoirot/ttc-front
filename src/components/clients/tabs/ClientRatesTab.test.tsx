import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { IntlProvider } from "react-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryClient } from "@/test/queryClientWrapper";
import { messages } from "@/i18n/messages";
import type { ClientRate } from "@/types/client-rates.types";
import type { RateSheet } from "@/types/rate-sheets.types";

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

function makeRateSheet(overrides: Partial<RateSheet> = {}): RateSheet {
  return {
    id: 1,
    userId: 1,
    occupationId: null,
    clientId: 5,
    name: "EN-FR standard",
    description: null,
    sourceLanguage: "EN",
    targetLanguage: "FR",
    currency: "EUR",
    pricePerWord: 0.12,
    matchRates: {} as RateSheet["matchRates"],
    isDefault: false,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function setupGqlFetch(
  overrides: {
    clientRates?: ClientRate[];
    rateSheets?: RateSheet[];
  } = {},
) {
  gqlFetch.mockImplementation((query: unknown) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const doc = query as any;
    const op = doc?.definitions?.find(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (d: any) => d.kind === "OperationDefinition",
    );
    const opName = op?.name?.value ?? String(query);
    switch (opName) {
      case "ClientRates":
        return Promise.resolve({ clientRates: overrides.clientRates ?? [] });
      case "RateSheets":
        return Promise.resolve({ rateSheets: overrides.rateSheets ?? [] });
      default:
        return Promise.resolve({});
    }
  });
}

function renderTab(clientId = 5) {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <IntlProvider locale="en" messages={messages.en}>
        <MemoryRouter>
          <ClientRatesTab clientId={clientId} />
        </MemoryRouter>
      </IntlProvider>
    </QueryClientProvider>,
  );
}

describe("ClientRatesTab", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
    setupGqlFetch();
  });

  it("shows an empty state when there are no rates", async () => {
    renderTab();

    expect(
      await screen.findByText("No rates defined for this client yet."),
    ).toBeInTheDocument();
  });

  it("renders each rate's type, name, amount, and currency", async () => {
    setupGqlFetch({
      clientRates: [makeRate({ name: "Discounted", amount: 35.5 })],
    });

    renderTab();

    expect(await screen.findByText("Discounted")).toBeInTheDocument();
    expect(screen.getByText("35.50")).toBeInTheDocument();
    expect(screen.getByText("EUR")).toBeInTheDocument();
  });

  it("opens and cancels the add-rate form", async () => {
    renderTab();
    await screen.findByText("No rates defined for this client yet.");

    fireEvent.click(screen.getByText("+ Add Rate"));
    expect(screen.getByLabelText("Name")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Cancel"));
    expect(screen.queryByLabelText("Name")).not.toBeInTheDocument();
  });

  it("creates a new rate with the parsed amount", async () => {
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
    setupGqlFetch({
      clientRates: [makeRate({ id: 3, name: "Editable" })],
    });

    renderTab();
    await screen.findByText("Editable");

    fireEvent.click(screen.getByText("Edit"));

    expect(screen.getByLabelText("Name")).toHaveValue("Editable");
  });

  it("deletes a rate after confirming", async () => {
    setupGqlFetch({
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

  it("shows a link to manage rate sheets", async () => {
    renderTab();

    await screen.findByText("No rates defined for this client yet.");
    expect(
      screen.getByRole("link", { name: /manage rate sheets/i }),
    ).toHaveAttribute("href", "/rates");
  });

  it("shows an empty state when the client has no rate sheets", async () => {
    renderTab();

    expect(
      await screen.findByText("No rate sheets for this client yet."),
    ).toBeInTheDocument();
  });

  it("shows only rate sheets belonging to this client, with language pair, price, and Default badge", async () => {
    setupGqlFetch({
      rateSheets: [
        makeRateSheet({
          id: 1,
          clientId: 5,
          name: "EN-FR standard",
          sourceLanguage: "EN",
          targetLanguage: "FR",
          pricePerWord: 0.12,
          currency: "EUR",
          isDefault: true,
        }),
        makeRateSheet({
          id: 2,
          clientId: 99,
          name: "Other client sheet",
        }),
      ],
    });

    renderTab(5);

    expect(await screen.findByText("EN-FR standard")).toBeInTheDocument();
    expect(screen.getByText("EN → FR")).toBeInTheDocument();
    expect(screen.getByText("0.1200 €")).toBeInTheDocument();
    expect(screen.getByText("Default")).toBeInTheDocument();
    expect(screen.queryByText("Other client sheet")).not.toBeInTheDocument();
  });
});
