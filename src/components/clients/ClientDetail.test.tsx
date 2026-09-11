import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { Link, MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryClient } from "@/test/queryClientWrapper";
import { IntlProvider } from "react-intl";
import { messages } from "@/i18n/messages";
import type { Client } from "@/types/clients.types";
import type { Project } from "@/types/projects.types";
import type { Invoice } from "@/types/invoices.types";
import type { ClientRate } from "@/types/client-rates.types";
import type { RateSheet } from "@/types/rate-sheets.types";

const { gqlFetch, gqlMutate } = vi.hoisted(() => ({
  gqlFetch: vi.fn(),
  gqlMutate: vi.fn(),
}));

vi.mock("@/lib/apollo", () => ({ gqlFetch, gqlMutate }));

import { ClientDetail } from "./ClientDetail";

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
    contacts: [
      {
        id: 1,
        clientId: 1,
        firstName: "Jane",
        lastName: "Doe",
        email: null,
        phone: null,
        createdAt: "",
        updatedAt: "",
      },
    ],
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  } as Client;
}

function routeGqlFetch(
  vars: Record<string, unknown> = {},
  opts: { client: Client | null; projects: Project[]; invoices: Invoice[] },
) {
  if ("id" in vars && !("pagination" in vars)) {
    return Promise.resolve({ client: opts.client });
  }
  if ("pagination" in vars && "clientId" in vars) {
    return Promise.resolve({
      invoices: {
        items: opts.invoices,
        nextCursor: null,
        total: opts.invoices.length,
      },
    });
  }
  if ("pagination" in vars && "projectId" in vars) {
    return Promise.resolve({
      timeEntries: { items: [], nextCursor: null, total: 0 },
    });
  }
  if ("pagination" in vars) {
    return Promise.resolve({
      projects: {
        items: opts.projects,
        nextCursor: null,
        total: opts.projects.length,
      },
    });
  }
  return Promise.resolve({ tags: [] });
}

function renderAt(
  id: string,
  opts: { client: Client | null; projects?: Project[]; invoices?: Invoice[] },
  locale: "en" | "fr" = "en",
) {
  gqlFetch.mockImplementation((_doc: unknown, vars?: Record<string, unknown>) =>
    routeGqlFetch(vars, {
      client: opts.client,
      projects: opts.projects ?? [],
      invoices: opts.invoices ?? [],
    }),
  );

  return render(
    <QueryClientProvider client={createQueryClient()}>
      <IntlProvider locale={locale} messages={messages[locale]}>
        <MemoryRouter initialEntries={[`/clients/${id}`]}>
          <Routes>
            <Route path="/clients/:id" element={<ClientDetail />} />
          </Routes>
        </MemoryRouter>
      </IntlProvider>
    </QueryClientProvider>,
  );
}

function makeClientRate(overrides: Partial<ClientRate> = {}): ClientRate {
  return {
    id: 1,
    clientId: 1,
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
    activityId: null,
    clientId: 1,
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

function renderNavigable(
  clientsById: Record<number, Client>,
  opts: { clientRates?: ClientRate[]; rateSheets?: RateSheet[] } = {},
) {
  gqlFetch.mockImplementation(
    (query: unknown, vars: Record<string, unknown> = {}) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const doc = query as any;
      const op = doc?.definitions?.find(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (d: any) => d.kind === "OperationDefinition",
      );
      const opName = op?.name?.value ?? String(query);
      switch (opName) {
        case "Client":
          return Promise.resolve({
            client: clientsById[vars.id as number] ?? null,
          });
        case "MyActivities":
          return Promise.resolve({
            myActivities: [
              { id: 1, name: "Translation", activityType: "TRANSLATOR" },
              { id: 2, name: "Correction", activityType: "CORRECTOR" },
            ],
          });
        case "Projects":
          return Promise.resolve({
            projects: { items: [], nextCursor: null, total: 0 },
          });
        case "Invoices":
          return Promise.resolve({
            invoices: { items: [], nextCursor: null, total: 0 },
          });
        case "TimeEntries":
          return Promise.resolve({
            timeEntries: { items: [], nextCursor: null, total: 0 },
          });
        case "ClientRates":
          return Promise.resolve({ clientRates: opts.clientRates ?? [] });
        case "RateSheets":
          return Promise.resolve({ rateSheets: opts.rateSheets ?? [] });
        default:
          return Promise.resolve({ tags: [] });
      }
    },
  );

  return render(
    <QueryClientProvider client={createQueryClient()}>
      <IntlProvider locale="en" messages={messages.en}>
        <MemoryRouter initialEntries={["/clients/1"]}>
          <Link to="/clients/2">Go to client 2</Link>
          <Routes>
            <Route path="/clients/:id" element={<ClientDetail />} />
          </Routes>
        </MemoryRouter>
      </IntlProvider>
    </QueryClientProvider>,
  );
}

describe("ClientDetail", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("shows 'Client not found.' when the client does not exist", async () => {
    renderAt("999", { client: null });

    expect(await screen.findByText("Client not found.")).toBeInTheDocument();
  });

  it("renders French copy when locale is fr", async () => {
    renderAt("999", { client: null }, "fr");

    expect(await screen.findByText("Client introuvable.")).toBeInTheDocument();
  });

  it("shows skeleton placeholders while the client is loading", () => {
    gqlFetch.mockReturnValue(new Promise(() => {}));
    renderAt("1", { client: makeClient() });
    expect(screen.queryByText("Acme")).not.toBeInTheDocument();
    expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
    expect(screen.queryByText("Client not found.")).not.toBeInTheDocument();
  });

  it("renders the client header, tabs, and badge counts once loaded", async () => {
    renderAt("1", {
      client: makeClient(),
      projects: [
        {
          id: 1,
          userId: 1,
          clientId: 1,
          title: "P1",
          description: null,
          status: "ACTIVE",
          sourceLanguage: null,
          targetLanguage: null,
          wordCount: null,
          unitPrice: null,
          fixedFee: null,
          hourlyRate: null,
          perWordRate: null,
          useCustomRate: false,
          rateSheetId: null,
          currency: "EUR",
          deadline: null,
          startDate: null,
          createdAt: "",
          updatedAt: "",
        },
      ],
    });

    expect(await screen.findByText("Acme")).toBeInTheDocument();
    expect(screen.getByText("Contacts")).toBeInTheDocument();
    expect(screen.getByText("Projects")).toBeInTheDocument();
    expect(screen.getByText("Activity")).toBeInTheDocument();
    expect(screen.getByText("Rates")).toBeInTheDocument();

    await waitFor(() =>
      expect(screen.getByText("Jane Doe")).toBeInTheDocument(),
    );
  });

  it("shows the Contacts tab badge with the contact count", async () => {
    renderAt("1", { client: makeClient() });

    await screen.findByText("Acme");

    const contactsTab = screen.getByRole("tab", { name: /Contacts/ });
    expect(within(contactsTab).getByText("1")).toBeInTheDocument();
  });

  it("shows the Activity tab badge when invoices are present", async () => {
    renderAt("1", {
      client: makeClient({ contacts: [] }),
      invoices: [
        {
          id: 1,
          userId: 1,
          clientId: 1,
          number: "INV-001",
          status: "DRAFT" as const,
          currency: "EUR",
          issuedAt: null,
          dueDate: null,
          paidAt: null,
          notes: null,
          createdAt: "",
          updatedAt: "",
          items: [],
        } as Invoice,
        {
          id: 2,
          userId: 1,
          clientId: 1,
          number: "INV-002",
          status: "SENT" as const,
          currency: "EUR",
          issuedAt: null,
          dueDate: null,
          paidAt: null,
          notes: null,
          createdAt: "",
          updatedAt: "",
          items: [],
        } as Invoice,
      ],
    });

    await screen.findByText("Acme");

    await waitFor(() => {
      const activityTab = screen.getByRole("tab", { name: /Activity/ });
      expect(within(activityTab).getByText("2")).toBeInTheDocument();
    });
  });

  it("shows the newly-navigated client's own linked activities in the edit form, not the previous client's", async () => {
    renderNavigable({
      1: makeClient({
        id: 1,
        name: "Acme",
        activities: [
          { id: 1, name: "Translation", activityType: "TRANSLATOR" },
        ],
      }),
      2: makeClient({
        id: 2,
        name: "Globex",
        activities: [{ id: 2, name: "Correction", activityType: "CORRECTOR" }],
      }),
    });

    await screen.findByText("Acme");

    fireEvent.click(screen.getByText("Go to client 2"));
    await screen.findByText("Globex");

    fireEvent.click(screen.getByText("Edit"));

    expect(await screen.findByText("Correction")).toBeInTheDocument();
    expect(screen.queryByText("Translation")).not.toBeInTheDocument();
  });

  it("shows the Rates tab badge counting both client rates and this client's rate sheets", async () => {
    renderNavigable(
      { 1: makeClient({ id: 1, name: "Acme" }) },
      {
        clientRates: [
          makeClientRate({ id: 1, clientId: 1 }),
          makeClientRate({ id: 2, clientId: 1 }),
        ],
        rateSheets: [
          makeRateSheet({ id: 1, clientId: 1 }),
          makeRateSheet({ id: 2, clientId: 99 }),
        ],
      },
    );

    await screen.findByText("Acme");

    await waitFor(() => {
      const ratesTab = screen.getByRole("tab", { name: /Rates/ });
      expect(within(ratesTab).getByText("3")).toBeInTheDocument();
    });
  });

  it("hides the Rates tab badge when there are no client rates or rate sheets", async () => {
    renderNavigable({ 1: makeClient({ id: 1, name: "Acme" }) });

    await screen.findByText("Acme");

    const ratesTab = screen.getByRole("tab", { name: "Rates" });
    expect(within(ratesTab).queryByText(/\d/)).not.toBeInTheDocument();
  });
});
