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
import type { AdminRate } from "@/types/admin.types";

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

vi.mock("./RateForm", () => ({
  RateForm: ({
    form,
    onChange,
  }: {
    form: { name: string; amount: string; activityId: string };
    onChange: (f: { name: string; amount: string; activityId: string }) => void;
  }) => (
    <div>
      <input
        aria-label="rate-name"
        value={form.name}
        onChange={(e) => onChange({ ...form, name: e.target.value })}
      />
      <input
        aria-label="rate-amount"
        value={form.amount}
        onChange={(e) => onChange({ ...form, amount: e.target.value })}
      />
      <input
        aria-label="rate-activity"
        value={form.activityId}
        onChange={(e) => onChange({ ...form, activityId: e.target.value })}
      />
    </div>
  ),
}));

import { AdminRatesTable } from "./AdminRatesTable";

function makeRate(overrides: Partial<AdminRate> = {}): AdminRate {
  return {
    id: 1,
    userId: 1,
    owner: { id: 1, email: "owner@example.com", name: "Owner" },
    name: "Standard",
    amount: 0.05,
    currency: "EUR",
    type: "PER_WORD",
    description: null,
    activityId: null,
    clientId: null,
    sourceLanguage: null,
    targetLanguage: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  } as AdminRate;
}

function makeConnection(items: AdminRate[]) {
  return { items, nextCursor: null, total: items.length };
}

function renderTable() {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <AdminRatesTable />
    </QueryClientProvider>,
  );
}

describe("AdminRatesTable", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
    exportCsv.mockReset();
  });

  it("shows an empty state when there are no rates", async () => {
    gqlFetch.mockResolvedValueOnce({ adminRates: makeConnection([]) });
    renderTable();
    expect(await screen.findByText("No rates found.")).toBeInTheDocument();
  });

  it("renders rate rows and the total count", async () => {
    gqlFetch.mockResolvedValueOnce({
      adminRates: makeConnection([makeRate({ name: "Rush job" })]),
    });
    renderTable();
    expect(await screen.findByText("Rush job")).toBeInTheDocument();
    expect(screen.getByText("1 total")).toBeInTheDocument();
  });

  it("formats PER_WORD amounts with 4 decimals and other types with 2", async () => {
    gqlFetch.mockResolvedValueOnce({
      adminRates: makeConnection([
        makeRate({ id: 1, name: "Per word", type: "PER_WORD", amount: 0.05 }),
        makeRate({ id: 2, name: "Hourly", type: "HOURLY", amount: 25 }),
      ]),
    });
    renderTable();
    await screen.findByText("Per word");
    expect(screen.getByText("0.0500")).toBeInTheDocument();
    expect(screen.getByText("25.00")).toBeInTheDocument();
  });

  it("changes the type filter and refetches with that type", async () => {
    gqlFetch.mockResolvedValue({ adminRates: makeConnection([]) });
    renderTable();
    await screen.findByText("No rates found.");

    fireEvent.click(screen.getAllByRole("combobox")[0]!);
    fireEvent.click(screen.getByRole("option", { name: "HOURLY" }));

    await waitFor(() =>
      expect(
        gqlFetch.mock.calls.some(
          (c) => (c[1] as Record<string, unknown>)?.type === "HOURLY",
        ),
      ).toBe(true),
    );
  });

  it("selects and deselects all rows via the header checkbox, and toggles a single row off", async () => {
    gqlFetch.mockResolvedValueOnce({
      adminRates: makeConnection([
        makeRate({ id: 1, name: "Rate A" }),
        makeRate({ id: 2, name: "Rate B" }),
      ]),
    });
    renderTable();
    await screen.findByText("Rate A");
    await screen.findByText("Rate B");

    const [headerCheckbox, rowCheckbox] = screen.getAllByRole("checkbox");
    fireEvent.click(rowCheckbox!);
    fireEvent.click(rowCheckbox!);
    expect(screen.queryByText(/selected/)).not.toBeInTheDocument();

    fireEvent.click(headerCheckbox!);
    expect(screen.getByText("2 selected")).toBeInTheDocument();

    fireEvent.click(headerCheckbox!);
    expect(screen.queryByText("2 selected")).not.toBeInTheDocument();
  });

  it("exports rows as CSV", async () => {
    gqlFetch.mockResolvedValueOnce({
      adminRates: makeConnection([makeRate({ name: "Rush job" })]),
    });
    renderTable();
    await screen.findByText("Rush job");

    fireEvent.click(screen.getByText("Export CSV"));

    expect(exportCsv).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ name: "Rush job" })]),
      "rates.csv",
    );
  });

  it("bulk-selects and deletes rates via the confirm dialog", async () => {
    gqlFetch.mockResolvedValueOnce({
      adminRates: makeConnection([makeRate({ id: 5 })]),
    });
    gqlMutate.mockResolvedValueOnce({ adminDeleteRate: { id: 5 } });
    renderTable();
    await screen.findByText("Standard");

    fireEvent.click(screen.getAllByRole("checkbox")[1]!);
    fireEvent.click(screen.getByText("Delete selected (1)"));
    const dialog = screen.getByRole("alertdialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Delete" }));

    await waitFor(() =>
      expect(gqlMutate.mock.calls[0][1]).toMatchObject({ id: 5 }),
    );
  });

  it("creates a rate from the New Rate dialog", async () => {
    gqlFetch.mockResolvedValueOnce({ adminRates: makeConnection([]) });
    gqlMutate.mockResolvedValueOnce({
      adminCreateRate: makeRate({ id: 9, name: "New rate" }),
    });
    renderTable();
    await screen.findByText("No rates found.");

    fireEvent.click(screen.getByRole("button", { name: "+ New Rate" }));
    fireEvent.change(screen.getByLabelText("rate-name"), {
      target: { value: "New rate" },
    });
    fireEvent.change(screen.getByLabelText("rate-amount"), {
      target: { value: "10" },
    });
    fireEvent.change(screen.getByLabelText("rate-activity"), {
      target: { value: "1" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create" }));

    await waitFor(() =>
      expect(gqlMutate.mock.calls[0][1]).toMatchObject({
        input: expect.objectContaining({ name: "New rate" }),
      }),
    );
  });

  it("cancels the New Rate dialog without creating", async () => {
    gqlFetch.mockResolvedValueOnce({ adminRates: makeConnection([]) });
    renderTable();
    await screen.findByText("No rates found.");

    fireEvent.click(screen.getByRole("button", { name: "+ New Rate" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.queryByText("New Rate")).not.toBeInTheDocument();
    expect(gqlMutate).not.toHaveBeenCalled();
  });

  it("closes the New Rate dialog via Escape without creating", async () => {
    gqlFetch.mockResolvedValueOnce({ adminRates: makeConnection([]) });
    renderTable();
    await screen.findByText("No rates found.");

    fireEvent.click(screen.getByRole("button", { name: "+ New Rate" }));
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

  it("opens Edit pre-filled and saves an update", async () => {
    gqlFetch.mockResolvedValueOnce({
      adminRates: makeConnection([makeRate({ id: 3, name: "Old rate" })]),
    });
    gqlMutate.mockResolvedValueOnce({
      adminUpdateRate: makeRate({ id: 3, name: "New name" }),
    });
    renderTable();
    await screen.findByText("Old rate");

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.change(screen.getByLabelText("rate-name"), {
      target: { value: "New name" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(gqlMutate.mock.calls[0][1]).toMatchObject({
        input: expect.objectContaining({ id: 3, name: "New name" }),
      }),
    );
  });

  it("sends activityId as a number when editing a rate that has one", async () => {
    gqlFetch.mockResolvedValueOnce({
      adminRates: makeConnection([
        makeRate({ id: 6, name: "Has activity", activityId: 7 }),
      ]),
    });
    gqlMutate.mockResolvedValueOnce({
      adminUpdateRate: makeRate({ id: 6 }),
    });
    renderTable();
    await screen.findByText("Has activity");

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(gqlMutate.mock.calls[0][1]).toMatchObject({
        input: expect.objectContaining({ id: 6, activityId: 7 }),
      }),
    );
  });

  it("cancels the Edit dialog without saving", async () => {
    gqlFetch.mockResolvedValueOnce({
      adminRates: makeConnection([makeRate({ id: 8, name: "Untouched" })]),
    });
    renderTable();
    await screen.findByText("Untouched");

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(gqlMutate).not.toHaveBeenCalled();
  });

  it("closes the Edit dialog via Escape without saving", async () => {
    gqlFetch.mockResolvedValueOnce({
      adminRates: makeConnection([makeRate({ id: 9, name: "Esc me" })]),
    });
    renderTable();
    await screen.findByText("Esc me");

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

  it("deletes a single rate via its row confirm dialog", async () => {
    gqlFetch.mockResolvedValueOnce({
      adminRates: makeConnection([makeRate({ id: 4 })]),
    });
    gqlMutate.mockResolvedValueOnce({ adminDeleteRate: { id: 4 } });
    renderTable();
    await screen.findByText("Standard");

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    const dialog = screen.getByRole("alertdialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Delete" }));

    await waitFor(() =>
      expect(gqlMutate.mock.calls[0][1]).toMatchObject({ id: 4 }),
    );
  });

  it("opens and closes the resource history dialog", async () => {
    gqlFetch.mockResolvedValueOnce({
      adminRates: makeConnection([makeRate({ id: 5, name: "Rush job" })]),
    });
    renderTable();
    await screen.findByText("Rush job");

    fireEvent.click(screen.getByRole("button", { name: "History" }));
    expect(screen.getByText("History — Rush job")).toBeInTheDocument();

    fireEvent.click(screen.getByText("close-history"));
    expect(screen.queryByText("History — Rush job")).not.toBeInTheDocument();
  });

  it("filters by type via the type Select query variable", async () => {
    gqlFetch.mockResolvedValue({ adminRates: makeConnection([]) });
    renderTable();
    await screen.findByText("No rates found.");
    expect(gqlFetch).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ type: undefined }),
    );
  });
});
