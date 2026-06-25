import { render, screen, waitFor, within } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryClient } from "@/test/queryClientWrapper";
import type { Client } from "@/types/clients.types";
import type { Project } from "@/types/projects.types";
import type { Invoice } from "@/types/invoices.types";

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
      <MemoryRouter initialEntries={[`/clients/${id}`]}>
        <Routes>
          <Route path="/clients/:id" element={<ClientDetail />} />
        </Routes>
      </MemoryRouter>
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
});
