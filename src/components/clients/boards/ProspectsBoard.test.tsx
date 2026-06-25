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

import { ProspectsBoard } from "./ProspectsBoard";

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
    status: "TO_CONTACT",
    contactedAt: null,
    tags: [],
    contacts: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  } as Client;
}

function makeConnection(
  items: Client[],
  nextCursor: number | null = null,
): ClientConnection {
  return { items, nextCursor, total: items.length };
}

function renderBoard() {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <MemoryRouter>
        <ProspectsBoard />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("ProspectsBoard", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("queries with excludeStatus=CLIENT so converted clients don't show up", async () => {
    gqlFetch.mockResolvedValueOnce({ clients: makeConnection([]) });

    renderBoard();

    await waitFor(() => expect(gqlFetch).toHaveBeenCalled());
    const vars = gqlFetch.mock.calls[0][1] as Record<string, unknown>;
    expect(vars.excludeStatus).toBe("CLIENT");
  });

  it("shows every column header", async () => {
    gqlFetch.mockResolvedValueOnce({ clients: makeConnection([]) });

    renderBoard();

    expect(await screen.findByText(/^Prospect \(/)).toBeInTheDocument();
    expect(screen.getByText(/1st Contact/)).toBeInTheDocument();
    expect(screen.getByText(/Follow up 1/)).toBeInTheDocument();
    expect(screen.getByText(/Follow up 2/)).toBeInTheDocument();
    expect(screen.getByText(/Follow up 3/)).toBeInTheDocument();
    expect(screen.getByText(/Recontact Later/)).toBeInTheDocument();
    expect(screen.getByText(/Talking/)).toBeInTheDocument();
  });

  it("buckets clients into the correct column by status", async () => {
    gqlFetch.mockResolvedValueOnce({
      clients: makeConnection([
        makeClient({ id: 1, name: "Lead A", status: "TO_CONTACT" }),
        makeClient({ id: 2, name: "Lead B", status: "FOLLOW_UP_2" }),
        makeClient({ id: 3, name: "Lead C", status: "RECONTACT_LATER" }),
      ]),
    });

    renderBoard();

    expect(await screen.findByText("Lead A")).toBeInTheDocument();
    expect(screen.getByText("Lead B")).toBeInTheDocument();
    expect(screen.getByText("Lead C")).toBeInTheDocument();
  });

  it("shows column counts in the header", async () => {
    gqlFetch.mockResolvedValueOnce({
      clients: makeConnection([
        makeClient({ id: 1, status: "TO_CONTACT" }),
        makeClient({ id: 2, status: "TO_CONTACT" }),
      ]),
    });

    renderBoard();

    expect(await screen.findByText("Prospect (2)")).toBeInTheDocument();
    expect(screen.getByText("1st Contact (0)")).toBeInTheDocument();
  });

  it("shows a Load more button when more pages are available", async () => {
    gqlFetch.mockResolvedValueOnce({
      clients: { items: [makeClient()], nextCursor: 5, total: 2 },
    });

    renderBoard();

    expect(await screen.findByText("Load more")).toBeInTheDocument();
  });

  it("toggles the new-prospect form open and closed", async () => {
    gqlFetch.mockResolvedValue({ clients: makeConnection([]) });

    renderBoard();
    await waitFor(() => expect(gqlFetch).toHaveBeenCalled());

    fireEvent.click(screen.getByText("New prospect"));
    expect(screen.getByText("Create client")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Cancel"));
    expect(screen.queryByText("Create client")).not.toBeInTheDocument();
  });

  it("renders the Prospects heading", async () => {
    gqlFetch.mockResolvedValueOnce({ clients: makeConnection([]) });
    renderBoard();
    expect(
      await screen.findByRole("heading", { name: "Prospects" }),
    ).toBeInTheDocument();
  });

  it("shows the visible count against the total", async () => {
    gqlFetch.mockResolvedValueOnce({
      clients: { items: [makeClient()], nextCursor: null, total: 5 },
    });
    renderBoard();
    expect(await screen.findByText("1 of 5")).toBeInTheDocument();
  });

  it("shows an Empty placeholder in every column that has no clients", async () => {
    gqlFetch.mockResolvedValueOnce({ clients: makeConnection([]) });
    renderBoard();
    const empties = await screen.findAllByText("Empty");
    expect(empties).toHaveLength(7);
  });

  it("shows Load more button which triggers another fetch when clicked", async () => {
    gqlFetch
      .mockResolvedValueOnce({
        clients: { items: [makeClient()], nextCursor: 1, total: 2 },
      })
      .mockResolvedValueOnce({
        clients: {
          items: [makeClient({ id: 2, name: "Lead B" })],
          nextCursor: null,
          total: 2,
        },
      });
    renderBoard();
    const loadMore = await screen.findByRole("button", { name: "Load more" });
    fireEvent.click(loadMore);
    await waitFor(() => expect(gqlFetch).toHaveBeenCalledTimes(2));
  });

  it("debounces the search input before refetching", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    gqlFetch.mockResolvedValue({ clients: makeConnection([]) });

    renderBoard();

    fireEvent.change(screen.getByLabelText("Search prospects"), {
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
});
