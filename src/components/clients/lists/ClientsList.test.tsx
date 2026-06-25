import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryClient } from "@/test/queryClientWrapper";
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

function renderList() {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <MemoryRouter>
        <ClientsList />
      </MemoryRouter>
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

  it("debounces the search input before refetching", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    gqlFetch.mockResolvedValue({ clients: makeConnection([]) });

    renderList();

    fireEvent.change(screen.getByLabelText("Search clients"), {
      target: { value: "acme" },
    });

    expect(
      gqlFetch.mock.calls.some(
        (c) => (c[1] as Record<string, unknown>)?.search === "acme",
      ),
    ).toBe(false);

    await vi.advanceTimersByTimeAsync(300);

    await waitFor(() =>
      expect(
        gqlFetch.mock.calls.some(
          (c) => (c[1] as Record<string, unknown>)?.search === "acme",
        ),
      ).toBe(true),
    );
    vi.useRealTimers();
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
});
