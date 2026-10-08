import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryClient } from "@/test/queryClientWrapper";
import { IntlProvider } from "react-intl";
import { messages } from "@/i18n/messages";
import type { Client, ClientConnection } from "@/types/clients.types";

const { gqlFetch, gqlMutate } = vi.hoisted(() => ({
  gqlFetch: vi.fn(),
  gqlMutate: vi.fn(),
}));

vi.mock("@/lib/apollo", () => ({ gqlFetch, gqlMutate }));

import { ClientsList } from "./ClientsList";

function makeClient(overrides: Partial<Client> = {}): Client {
  return {
    id: 1,
    userId: 1,
    name: "Acme",
    legalName: null,
    email: null,
    phone: null,
    company: null,
    address: null,
    city: null,
    country: null,
    postalCode: null,
    vatNumber: null,
    notes: null,
    hubspotId: null,
    clientType: "COMPANY",
    firstName: null,
    lastName: null,
    paymentDelayDays: null,
    taxRate: null,
    billingEndOfMonth: false,
    website: null,
    industry: null,
    status: "CLIENT",
    contactedAt: null,
    tags: [],
    contacts: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  } as Client;
}

function makeConnection(items: Client[]): ClientConnection {
  return { items, nextCursor: null, total: items.length };
}

function renderList(locale: "en" | "fr" = "en") {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <IntlProvider locale={locale} messages={messages[locale]}>
        <MemoryRouter>
          <ClientsList />
        </MemoryRouter>
      </IntlProvider>
    </QueryClientProvider>,
  );
}

describe("ClientsList", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("shows an empty state when there are no clients", async () => {
    gqlFetch.mockResolvedValueOnce({ clients: makeConnection([]) });

    renderList();

    expect(
      await screen.findByText("No clients yet. Create one above."),
    ).toBeInTheDocument();
  });

  it("renders the client list and a count line", async () => {
    gqlFetch.mockResolvedValueOnce({
      clients: makeConnection([makeClient({ name: "Acme" })]),
    });

    renderList();

    expect(await screen.findByText("Acme")).toBeInTheDocument();
    expect(screen.getByText("1 of 1")).toBeInTheDocument();
  });

  it("toggles the new-client form open and closed", async () => {
    gqlFetch.mockResolvedValue({ clients: makeConnection([]) });

    renderList();
    await screen.findByText("No clients yet. Create one above.");

    fireEvent.click(screen.getByText("New client"));
    expect(screen.getByText("New client")).toBeInTheDocument();
    expect(screen.getByText("Create client")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Cancel"));
    expect(screen.queryByText("Create client")).not.toBeInTheDocument();
  });

  const lastVars = () =>
    gqlFetch.mock.calls[gqlFetch.mock.calls.length - 1][1] as Record<
      string,
      unknown
    >;

  it("filters by company name on the All and Companies tabs, after a pause", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    gqlFetch.mockResolvedValue({ clients: makeConnection([]) });
    renderList();

    expect(screen.queryByLabelText("Last name")).toBeNull();
    fireEvent.change(screen.getByLabelText("Company name"), {
      target: { value: "  acme  " },
    });
    expect(
      gqlFetch.mock.calls.some(
        (c) => (c[1] as Record<string, unknown>)?.companyName === "acme",
      ),
    ).toBe(false);

    await vi.advanceTimersByTimeAsync(300);
    await waitFor(() =>
      expect(lastVars()).toMatchObject({
        companyName: "acme",
        status: "CLIENT",
      }),
    );
    expect(lastVars().search).toBeUndefined();
    vi.useRealTimers();
  });

  it("filters people by last and first name on the Individuals tab", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    gqlFetch.mockResolvedValue({ clients: makeConnection([]) });
    renderList();

    fireEvent.change(screen.getByLabelText("Company name"), {
      target: { value: "acme" },
    });
    await vi.advanceTimersByTimeAsync(300);
    await waitFor(() => expect(lastVars().companyName).toBe("acme"));
    fireEvent.mouseDown(screen.getByRole("tab", { name: "Individuals" }));
    fireEvent.click(screen.getByRole("tab", { name: "Individuals" }));
    expect(screen.queryByLabelText("Company name")).toBeNull();
    // The new tab's first request already drops the company name.
    await waitFor(() =>
      expect(lastVars()).toMatchObject({ clientType: "INDIVIDUAL" }),
    );
    expect(lastVars().companyName).toBeUndefined();
    fireEvent.change(screen.getByLabelText("Last name"), {
      target: { value: "curie" },
    });
    fireEvent.change(screen.getByLabelText("First name"), {
      target: { value: "marie" },
    });

    await vi.advanceTimersByTimeAsync(300);
    await waitFor(() =>
      expect(lastVars()).toMatchObject({
        clientType: "INDIVIDUAL",
        lastName: "curie",
        firstName: "marie",
      }),
    );
    // Switching tab cleared the company name.
    expect(lastVars().companyName).toBeUndefined();
    vi.useRealTimers();
  });

  it("offers Translation agency in the industry filter", async () => {
    gqlFetch.mockResolvedValue({ clients: makeConnection([]) });
    renderList();
    fireEvent.click(screen.getByRole("combobox", { name: "Industry" }));
    expect(
      await screen.findByRole("option", { name: "Translation agency" }),
    ).toBeInTheDocument();
  });

  it("filters by industry, and All industries removes the filter", async () => {
    gqlFetch.mockResolvedValue({ clients: makeConnection([]) });
    renderList();

    expect(
      screen.getByRole("combobox", { name: "Industry" }),
    ).toHaveTextContent("All industries");
    fireEvent.click(screen.getByRole("combobox", { name: "Industry" }));
    fireEvent.click(await screen.findByRole("option", { name: "Legal" }));
    await waitFor(() =>
      expect(lastVars()).toMatchObject({ industry: "LEGAL", status: "CLIENT" }),
    );

    fireEvent.click(screen.getByRole("combobox", { name: "Industry" }));
    fireEvent.click(
      await screen.findByRole("option", { name: "All industries" }),
    );
    await waitFor(() => expect(lastVars().industry).toBeUndefined());
  });

  it("shows a Load more button when more pages are available", async () => {
    gqlFetch.mockResolvedValueOnce({
      clients: { items: [makeClient()], nextCursor: 5, total: 2 },
    });

    renderList();

    expect(await screen.findByText("Load more")).toBeInTheDocument();
  });

  it("always filters to status=CLIENT so prospects don't leak into the list", async () => {
    gqlFetch.mockResolvedValueOnce({ clients: makeConnection([]) });

    renderList();

    await waitFor(() => expect(gqlFetch).toHaveBeenCalled());
    const vars = gqlFetch.mock.calls[0][1] as Record<string, unknown>;
    expect(vars.status).toBe("CLIENT");
  });

  it("renders French copy when locale is fr", async () => {
    gqlFetch.mockResolvedValueOnce({ clients: makeConnection([]) });

    renderList("fr");

    expect(
      await screen.findByText(
        "Aucun client pour l'instant. Créez-en un ci-dessus.",
      ),
    ).toBeInTheDocument();
  });
});
