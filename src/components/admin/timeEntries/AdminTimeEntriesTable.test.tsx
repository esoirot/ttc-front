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
import type { AdminTimeEntry } from "@/types/admin.types";

const { gqlFetch, gqlMutate } = vi.hoisted(() => ({
  gqlFetch: vi.fn(),
  gqlMutate: vi.fn(),
}));
vi.mock("@/lib/apollo", () => ({ gqlFetch, gqlMutate }));

const { exportCsv } = vi.hoisted(() => ({ exportCsv: vi.fn() }));
vi.mock("@/lib/csv", () => ({ exportCsv }));

import { AdminTimeEntriesTable } from "./AdminTimeEntriesTable";

function makeEntry(overrides: Partial<AdminTimeEntry> = {}): AdminTimeEntry {
  return {
    id: 1,
    userId: 1,
    owner: { id: 1, email: "owner@example.com", name: "Owner" },
    projectId: null,
    subtaskId: null,
    description: "Translation work",
    startTime: "2026-06-24T09:00:00.000Z",
    endTime: "2026-06-24T10:00:00.000Z",
    durationSeconds: 3600,
    billable: true,
    clockifyEntryId: null,
    tags: [],
    createdAt: "2026-06-24T09:00:00.000Z",
    updatedAt: "2026-06-24T10:00:00.000Z",
    ...overrides,
  } as AdminTimeEntry;
}

function makeConnection(items: AdminTimeEntry[]) {
  return { items, nextCursor: null, total: items.length };
}

function renderTable() {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <AdminTimeEntriesTable />
    </QueryClientProvider>,
  );
}

describe("AdminTimeEntriesTable", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
    exportCsv.mockReset();
  });

  it("shows an empty state when there are no time entries", async () => {
    gqlFetch.mockResolvedValueOnce({ adminTimeEntries: makeConnection([]) });
    renderTable();
    expect(
      await screen.findByText("No time entries found."),
    ).toBeInTheDocument();
  });

  it("renders entry rows and the total count", async () => {
    gqlFetch.mockResolvedValueOnce({
      adminTimeEntries: makeConnection([makeEntry()]),
    });
    renderTable();
    expect(await screen.findByText("Translation work")).toBeInTheDocument();
    expect(screen.getByText("1 total")).toBeInTheDocument();
    expect(screen.getByText("1h 0m")).toBeInTheDocument();
  });

  it("shows italic — for a null description", async () => {
    gqlFetch.mockResolvedValueOnce({
      adminTimeEntries: makeConnection([makeEntry({ description: null })]),
    });
    renderTable();
    expect(await screen.findByText("owner@example.com")).toBeInTheDocument();
    expect(screen.getAllByText("—").length).toBeGreaterThan(0);
  });

  it("shows — for a null durationSeconds", async () => {
    gqlFetch.mockResolvedValueOnce({
      adminTimeEntries: makeConnection([makeEntry({ durationSeconds: null })]),
    });
    renderTable();
    await screen.findByText("Translation work");
    expect(screen.getAllByText("—").length).toBeGreaterThan(0);
  });

  it("shows $ for billable and — for non-billable entries", async () => {
    gqlFetch.mockResolvedValueOnce({
      adminTimeEntries: makeConnection([
        makeEntry({ id: 1, description: "Billable work", billable: true }),
        makeEntry({ id: 2, description: "Free work", billable: false }),
      ]),
    });
    renderTable();
    await screen.findByText("Billable work");
    expect(screen.getByText("$")).toBeInTheDocument();
  });

  it("exports rows as CSV", async () => {
    gqlFetch.mockResolvedValueOnce({
      adminTimeEntries: makeConnection([makeEntry()]),
    });
    renderTable();
    await screen.findByText("Translation work");

    fireEvent.click(screen.getByText("Export CSV"));

    expect(exportCsv).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ description: "Translation work" }),
      ]),
      "time-entries.csv",
    );
  });

  it("bulk-selects and deletes entries via the confirm dialog", async () => {
    gqlFetch.mockResolvedValueOnce({
      adminTimeEntries: makeConnection([makeEntry({ id: 5 })]),
    });
    gqlMutate.mockResolvedValueOnce({ adminDeleteTimeEntry: { id: 5 } });
    renderTable();
    await screen.findByText("Translation work");

    fireEvent.click(screen.getAllByRole("checkbox")[1]!);
    fireEvent.click(screen.getByText("Delete selected (1)"));
    const dialog = screen.getByRole("alertdialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Delete" }));

    await waitFor(() =>
      expect(gqlMutate.mock.calls[0][1]).toMatchObject({ id: 5 }),
    );
  });

  it("selects and deselects all rows via the header checkbox", async () => {
    gqlFetch.mockResolvedValueOnce({
      adminTimeEntries: makeConnection([
        makeEntry({ id: 1, description: "Entry one" }),
        makeEntry({ id: 2, description: "Entry two" }),
      ]),
    });
    renderTable();
    await screen.findByText("Entry one");

    const [headerCheckbox] = screen.getAllByRole("checkbox");
    fireEvent.click(headerCheckbox);
    expect(screen.getByText("2 selected")).toBeInTheDocument();

    fireEvent.click(headerCheckbox);
    expect(screen.queryByText(/selected/)).not.toBeInTheDocument();
  });

  it("deletes a single entry via its row confirm dialog", async () => {
    gqlFetch.mockResolvedValueOnce({
      adminTimeEntries: makeConnection([makeEntry({ id: 4 })]),
    });
    gqlMutate.mockResolvedValueOnce({ adminDeleteTimeEntry: { id: 4 } });
    renderTable();
    await screen.findByText("Translation work");

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    const dialog = screen.getByRole("alertdialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Delete" }));

    await waitFor(() =>
      expect(gqlMutate.mock.calls[0][1]).toMatchObject({ id: 4 }),
    );
  });

  it("shows a Load more button when more pages are available", async () => {
    gqlFetch.mockResolvedValueOnce({
      adminTimeEntries: { items: [makeEntry()], nextCursor: 5, total: 2 },
    });
    renderTable();
    expect(await screen.findByText("Load more")).toBeInTheDocument();
  });
});
