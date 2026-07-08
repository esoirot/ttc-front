import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryClient } from "@/test/queryClientWrapper";
import type { AdminInvoice } from "@/types/admin.types";

const { gqlFetch, gqlMutate } = vi.hoisted(() => ({
  gqlFetch: vi.fn(),
  gqlMutate: vi.fn(),
}));
vi.mock("@/lib/apollo", () => ({ gqlFetch, gqlMutate }));

const { exportCsv } = vi.hoisted(() => ({ exportCsv: vi.fn() }));
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

import { AdminInvoicesTable } from "./AdminInvoicesTable";

function makeInvoice(overrides: Partial<AdminInvoice> = {}): AdminInvoice {
  return {
    id: 1,
    userId: 1,
    owner: { id: 1, email: "owner@example.com", name: "Owner" },
    clientId: null,
    number: "INV-001",
    status: "DRAFT",
    currency: "EUR",
    issuedAt: null,
    dueDate: null,
    paidAt: null,
    notes: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    items: [],
    ...overrides,
  } as AdminInvoice;
}

function makeConnection(items: AdminInvoice[]) {
  return { items, nextCursor: null, total: items.length };
}

function renderTable() {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <AdminInvoicesTable />
    </QueryClientProvider>,
  );
}

describe("AdminInvoicesTable", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
    exportCsv.mockReset();
  });

  it("shows an empty state when there are no invoices", async () => {
    gqlFetch.mockResolvedValueOnce({ adminInvoices: makeConnection([]) });
    renderTable();
    expect(await screen.findByText("No invoices found.")).toBeInTheDocument();
  });

  it("renders invoice rows with total and the invoice count", async () => {
    gqlFetch.mockResolvedValueOnce({
      adminInvoices: makeConnection([
        makeInvoice({
          number: "INV-007",
          items: [
            {
              id: 1,
              invoiceId: 1,
              projectId: null,
              timeEntryId: null,
              description: "x",
              quantity: 2,
              unitPrice: 10,
              total: 20,
            },
          ],
        }),
      ]),
    });
    renderTable();
    expect(await screen.findByText("INV-007")).toBeInTheDocument();
    expect(screen.getByText("20.00 EUR")).toBeInTheDocument();
    expect(screen.getByText("1 total")).toBeInTheDocument();
  });

  it("filters by search text wired to the search query variable", async () => {
    gqlFetch.mockResolvedValue({ adminInvoices: makeConnection([]) });
    renderTable();
    await screen.findByText("No invoices found.");

    fireEvent.change(screen.getByPlaceholderText("Search number..."), {
      target: { value: "INV-9" },
    });

    await waitFor(() =>
      expect(
        gqlFetch.mock.calls.some(
          (c) => (c[1] as Record<string, unknown>)?.search === "INV-9",
        ),
      ).toBe(true),
    );
  });

  it("changes the status filter and refetches with that status", async () => {
    gqlFetch.mockResolvedValue({ adminInvoices: makeConnection([]) });
    renderTable();
    await screen.findByText("No invoices found.");

    fireEvent.click(screen.getAllByRole("combobox")[0]!);
    fireEvent.click(screen.getByRole("option", { name: "SENT" }));

    await waitFor(() =>
      expect(
        gqlFetch.mock.calls.some(
          (c) => (c[1] as Record<string, unknown>)?.status === "SENT",
        ),
      ).toBe(true),
    );
  });

  it("selects and deselects all rows via the header checkbox", async () => {
    gqlFetch.mockResolvedValueOnce({
      adminInvoices: makeConnection([
        makeInvoice({ id: 1, number: "INV-001" }),
        makeInvoice({ id: 2, number: "INV-002" }),
      ]),
    });
    renderTable();
    await screen.findByText("INV-001");
    await screen.findByText("INV-002");

    const headerCheckbox = screen.getAllByRole("checkbox")[0]!;
    fireEvent.click(headerCheckbox);
    expect(screen.getByText("2 selected")).toBeInTheDocument();

    fireEvent.click(headerCheckbox);
    expect(screen.queryByText("2 selected")).not.toBeInTheDocument();
  });

  it("exports rows as CSV", async () => {
    gqlFetch.mockResolvedValueOnce({
      adminInvoices: makeConnection([makeInvoice({ number: "INV-002" })]),
    });
    renderTable();
    await screen.findByText("INV-002");

    fireEvent.click(screen.getByText("Export CSV"));

    expect(exportCsv).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ number: "INV-002" })]),
      "invoices.csv",
    );
  });

  it("bulk-selects and deletes invoices via the confirm dialog", async () => {
    gqlFetch.mockResolvedValueOnce({
      adminInvoices: makeConnection([makeInvoice({ id: 5 })]),
    });
    gqlMutate.mockResolvedValueOnce({ adminDeleteInvoice: { id: 5 } });
    renderTable();
    await screen.findByText("INV-001");

    const rowCheckbox = screen.getAllByRole("checkbox")[1]!;
    fireEvent.click(rowCheckbox);
    fireEvent.click(rowCheckbox);
    expect(screen.queryByText("1 selected")).not.toBeInTheDocument();

    fireEvent.click(rowCheckbox);
    fireEvent.click(screen.getByText("Delete selected (1)"));
    const dialog = screen.getByRole("alertdialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Delete" }));

    await waitFor(() =>
      expect(gqlMutate.mock.calls[0][1]).toMatchObject({ id: 5 }),
    );
  });

  it("opens Edit pre-filled with status/notes/dueDate and saves", async () => {
    gqlFetch.mockResolvedValueOnce({
      adminInvoices: makeConnection([
        makeInvoice({
          id: 3,
          notes: "Old note",
          dueDate: "2026-06-01T00:00:00.000Z",
        }),
      ]),
    });
    gqlMutate.mockResolvedValueOnce({
      adminUpdateInvoice: makeInvoice({ id: 3, status: "SENT" }),
    });
    renderTable();
    await screen.findByText("INV-001");

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    expect(screen.getByDisplayValue("Old note")).toBeInTheDocument();

    fireEvent.change(screen.getByDisplayValue("Old note"), {
      target: { value: "New note" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(gqlMutate.mock.calls[0][1]).toMatchObject({
        input: expect.objectContaining({ id: 3, notes: "New note" }),
      }),
    );
  });

  it("changes status and due date fields within the Edit dialog before saving", async () => {
    gqlFetch.mockResolvedValueOnce({
      adminInvoices: makeConnection([makeInvoice({ id: 3 })]),
    });
    gqlMutate.mockResolvedValueOnce({
      adminUpdateInvoice: makeInvoice({ id: 3, status: "PAID" }),
    });
    renderTable();
    await screen.findByText("INV-001");

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    const dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByRole("combobox"));
    fireEvent.click(screen.getByRole("option", { name: "PAID" }));

    const dueDateInput = dialog.querySelector('input[type="date"]')!;
    fireEvent.change(dueDateInput, { target: { value: "2026-07-01" } });

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(gqlMutate.mock.calls[0][1]).toMatchObject({
        input: expect.objectContaining({
          id: 3,
          status: "PAID",
          dueDate: "2026-07-01",
        }),
      }),
    );
  });

  it("saves with notes/dueDate left blank, sending undefined for both", async () => {
    gqlFetch.mockResolvedValueOnce({
      adminInvoices: makeConnection([
        makeInvoice({ id: 3, notes: null, dueDate: null }),
      ]),
    });
    gqlMutate.mockResolvedValueOnce({
      adminUpdateInvoice: makeInvoice({ id: 3 }),
    });
    renderTable();
    await screen.findByText("INV-001");

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(gqlMutate.mock.calls[0][1]).toMatchObject({
        input: expect.objectContaining({
          id: 3,
          notes: undefined,
          dueDate: undefined,
        }),
      }),
    );
  });

  it("closes the Edit dialog via Escape without saving", async () => {
    gqlFetch.mockResolvedValueOnce({
      adminInvoices: makeConnection([makeInvoice({ id: 3 })]),
    });
    renderTable();
    await screen.findByText("INV-001");

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    fireEvent.keyDown(screen.getByRole("dialog"), {
      key: "Escape",
      code: "Escape",
    });

    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(gqlMutate).not.toHaveBeenCalled();
  });

  it("cancels the Edit dialog without saving", async () => {
    gqlFetch.mockResolvedValueOnce({
      adminInvoices: makeConnection([makeInvoice({ id: 3 })]),
    });
    renderTable();
    await screen.findByText("INV-001");

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(gqlMutate).not.toHaveBeenCalled();
  });

  it("deletes a single invoice via its row confirm dialog", async () => {
    gqlFetch.mockResolvedValueOnce({
      adminInvoices: makeConnection([makeInvoice({ id: 4 })]),
    });
    gqlMutate.mockResolvedValueOnce({ adminDeleteInvoice: { id: 4 } });
    renderTable();
    await screen.findByText("INV-001");

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    const dialog = screen.getByRole("alertdialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Delete" }));

    await waitFor(() =>
      expect(gqlMutate.mock.calls[0][1]).toMatchObject({ id: 4 }),
    );
  });

  it("opens and closes the resource history dialog", async () => {
    gqlFetch.mockResolvedValueOnce({
      adminInvoices: makeConnection([
        makeInvoice({ id: 5, number: "INV-005" }),
      ]),
    });
    renderTable();
    await screen.findByText("INV-005");

    fireEvent.click(screen.getByRole("button", { name: "History" }));
    expect(screen.getByText("History — INV-005")).toBeInTheDocument();

    fireEvent.click(screen.getByText("close-history"));
    expect(screen.queryByText("History — INV-005")).not.toBeInTheDocument();
  });

  it("shows a Load more button when more pages are available", async () => {
    gqlFetch.mockResolvedValueOnce({
      adminInvoices: { items: [makeInvoice()], nextCursor: 5, total: 2 },
    });
    renderTable();
    expect(await screen.findByText("Load more")).toBeInTheDocument();
  });
});
