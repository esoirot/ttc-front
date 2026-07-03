import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryClient } from "@/test/queryClientWrapper";
import type { AdminClient } from "@/types/admin.types";

const { gqlFetch, gqlMutate } = vi.hoisted(() => ({
  gqlFetch: vi.fn(),
  gqlMutate: vi.fn(),
}));
const { exportCsv } = vi.hoisted(() => ({ exportCsv: vi.fn() }));

vi.mock("@/lib/apollo", () => ({ gqlFetch, gqlMutate }));
vi.mock("@/lib/csv", () => ({ exportCsv }));

vi.mock("../audits/ResourceAuditHistory", () => ({
  ResourceAuditHistory: ({
    resourceName,
    onClose,
  }: {
    resourceName: string;
    onClose: () => void;
  }) => (
    <div>
      <p>History — {resourceName}</p>
      <button onClick={onClose}>close-history</button>
    </div>
  ),
}));

import { AdminClientsTable } from "./AdminClientsTable";

function makeClient(overrides: Partial<AdminClient> = {}): AdminClient {
  return {
    id: 1,
    userId: 1,
    owner: { id: 1, email: "owner@example.com", name: "Owner" },
    name: "Acme",
    legalName: null,
    email: "acme@example.com",
    phone: null,
    company: null,
    address: null,
    city: "Paris",
    country: "France",
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
  } as AdminClient;
}

function makeConnection(items: AdminClient[]) {
  return { items, nextCursor: null, total: items.length };
}

function renderTable() {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <AdminClientsTable />
    </QueryClientProvider>,
  );
}

describe("AdminClientsTable", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
    exportCsv.mockReset();
  });

  it("shows an empty state when there are no clients", async () => {
    gqlFetch.mockResolvedValueOnce({ adminClients: makeConnection([]) });
    renderTable();
    expect(await screen.findByText("No clients found.")).toBeInTheDocument();
  });

  it("renders client rows and the total count", async () => {
    gqlFetch.mockResolvedValueOnce({
      adminClients: makeConnection([makeClient({ name: "Acme" })]),
    });
    renderTable();

    expect(await screen.findByText("Acme")).toBeInTheDocument();
    expect(screen.getByText("1 total")).toBeInTheDocument();
  });

  it("search input is wired to the search query variable", async () => {
    gqlFetch.mockResolvedValue({ adminClients: makeConnection([]) });
    renderTable();
    await screen.findByText("No clients found.");

    fireEvent.change(screen.getByPlaceholderText("Search name or email..."), {
      target: { value: "acme" },
    });

    await waitFor(() =>
      expect(
        gqlFetch.mock.calls.some(
          (c) => (c[1] as Record<string, unknown>)?.search === "acme",
        ),
      ).toBe(true),
    );
  });

  it("exports the current rows as CSV", async () => {
    gqlFetch.mockResolvedValueOnce({
      adminClients: makeConnection([makeClient({ name: "Acme" })]),
    });
    renderTable();
    await screen.findByText("Acme");

    fireEvent.click(screen.getByText("Export CSV"));

    expect(exportCsv).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ name: "Acme" })]),
      "clients.csv",
    );
  });

  it("selects a row and bulk-deletes it via the confirm dialog", async () => {
    gqlFetch.mockResolvedValueOnce({
      adminClients: makeConnection([makeClient({ id: 7, name: "Acme" })]),
    });
    gqlMutate.mockResolvedValueOnce({ adminDeleteClient: { id: 7 } });
    renderTable();
    await screen.findByText("Acme");

    fireEvent.click(screen.getAllByRole("checkbox")[1]);
    expect(screen.getByText("1 selected")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Delete selected (1)"));
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() =>
      expect(gqlMutate.mock.calls[0][1]).toMatchObject({ id: 7 }),
    );
  });

  it("creates a client from the New Client dialog", async () => {
    gqlFetch.mockResolvedValueOnce({ adminClients: makeConnection([]) });
    gqlMutate.mockResolvedValueOnce({
      adminCreateClient: makeClient({ id: 9, name: "New Co" }),
    });
    renderTable();
    await screen.findByText("No clients found.");

    fireEvent.click(screen.getByText("+ New Client"));
    fireEvent.change(screen.getByPlaceholderText("Acme Corp"), {
      target: { value: "New Co" },
    });
    fireEvent.click(screen.getByText("Create"));

    await waitFor(() =>
      expect(gqlMutate.mock.calls[0][1]).toMatchObject({
        input: expect.objectContaining({ name: "New Co" }),
      }),
    );
  });

  it("opens Edit pre-filled with the row's data and saves an update", async () => {
    gqlFetch.mockResolvedValueOnce({
      adminClients: makeConnection([
        makeClient({ id: 3, name: "Acme", email: "old@acme.com" }),
      ]),
    });
    gqlMutate.mockResolvedValueOnce({
      adminUpdateClient: makeClient({ id: 3, name: "Acme Renamed" }),
    });
    renderTable();
    await screen.findByText("Acme");

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    const nameInput = screen.getByDisplayValue("Acme");
    expect(nameInput).toBeInTheDocument();
    expect(screen.getByDisplayValue("old@acme.com")).toBeInTheDocument();

    fireEvent.change(nameInput, {
      target: { value: "Acme Renamed" },
    });
    fireEvent.click(screen.getByText("Save"));

    await waitFor(() =>
      expect(gqlMutate.mock.calls[0][1]).toMatchObject({
        input: expect.objectContaining({ id: 3, name: "Acme Renamed" }),
      }),
    );
  });

  it("deletes a single client via its row confirm dialog", async () => {
    gqlFetch.mockResolvedValueOnce({
      adminClients: makeConnection([makeClient({ id: 4, name: "Acme" })]),
    });
    gqlMutate.mockResolvedValueOnce({ adminDeleteClient: { id: 4 } });
    renderTable();
    await screen.findByText("Acme");

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() =>
      expect(gqlMutate.mock.calls[0][1]).toMatchObject({ id: 4 }),
    );
  });

  it("shows a Load more button when more pages are available", async () => {
    gqlFetch.mockResolvedValueOnce({
      adminClients: { items: [makeClient()], nextCursor: 5, total: 2 },
    });
    renderTable();
    expect(await screen.findByText("Load more")).toBeInTheDocument();
  });

  it("selects all rows via the header checkbox and deselects a single row", async () => {
    gqlFetch.mockResolvedValueOnce({
      adminClients: makeConnection([
        makeClient({ id: 1, name: "Acme" }),
        makeClient({ id: 2, name: "Beta" }),
      ]),
    });
    renderTable();
    await screen.findByText("Acme");

    const [headerCheckbox, row1, row2] = screen.getAllByRole("checkbox");
    fireEvent.click(headerCheckbox);
    expect(screen.getByText("2 selected")).toBeInTheDocument();

    fireEvent.click(row1);
    expect(screen.getByText("1 selected")).toBeInTheDocument();

    fireEvent.click(row2);
    expect(screen.queryByText(/selected/)).not.toBeInTheDocument();
  });

  it("opens and closes the resource history dialog for a row", async () => {
    gqlFetch.mockResolvedValueOnce({
      adminClients: makeConnection([makeClient({ id: 5, name: "Acme" })]),
    });
    renderTable();
    await screen.findByText("Acme");

    fireEvent.click(screen.getByRole("button", { name: "History" }));
    expect(screen.getByText("History — Acme")).toBeInTheDocument();

    fireEvent.click(screen.getByText("close-history"));
    expect(screen.queryByText("History — Acme")).not.toBeInTheDocument();
  });

  it("cancels the New Client dialog without creating", async () => {
    gqlFetch.mockResolvedValueOnce({ adminClients: makeConnection([]) });
    renderTable();
    await screen.findByText("No clients found.");

    fireEvent.click(screen.getByText("+ New Client"));
    fireEvent.change(screen.getByPlaceholderText("Acme Corp"), {
      target: { value: "Should not save" },
    });
    fireEvent.click(screen.getByText("Cancel"));

    expect(screen.queryByPlaceholderText("Acme Corp")).not.toBeInTheDocument();
    expect(gqlMutate).not.toHaveBeenCalled();
  });

  it("cancels the Edit dialog without saving", async () => {
    gqlFetch.mockResolvedValueOnce({
      adminClients: makeConnection([makeClient({ id: 3, name: "Acme" })]),
    });
    renderTable();
    await screen.findByText("Acme");

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.click(screen.getByText("Cancel"));

    expect(screen.queryByText("Save")).not.toBeInTheDocument();
    expect(gqlMutate).not.toHaveBeenCalled();
  });
});
