import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AuditLogEntry } from "@/types/hubspot.types";

const useAuditLogMock = vi.fn();
vi.mock("@/hooks/integrations/useHubspot", () => ({
  useAuditLog: () => useAuditLogMock(),
}));

const { exportCsv } = vi.hoisted(() => ({ exportCsv: vi.fn() }));
vi.mock("@/lib/csv", () => ({ exportCsv }));

import { AuditTable } from "./AuditTable";

function makeEntry(overrides: Partial<AuditLogEntry> = {}): AuditLogEntry {
  return {
    id: 1,
    userId: 1,
    action: "UPDATE",
    resource: "Invoice#4",
    payload: null,
    createdAt: "2026-06-24T09:00:00.000Z",
    user: { email: "jane@example.com" },
    ...overrides,
  };
}

function defaultReturn(overrides: Record<string, unknown> = {}) {
  return {
    data: { pages: [{ items: [] as AuditLogEntry[] }] },
    isLoading: false,
    hasNextPage: false,
    fetchNextPage: vi.fn(),
    isFetchingNextPage: false,
    ...overrides,
  };
}

describe("AuditTable", () => {
  beforeEach(() => {
    useAuditLogMock.mockReset();
    exportCsv.mockReset();
    useAuditLogMock.mockReturnValue(defaultReturn());
  });

  it("shows loading skeletons while loading", () => {
    useAuditLogMock.mockReturnValue(defaultReturn({ isLoading: true }));
    render(<AuditTable />);
    expect(screen.queryByText("Time")).not.toBeInTheDocument();
  });

  it("shows 'No audit entries yet' when there are no entries", () => {
    render(<AuditTable />);
    expect(screen.getByText("No audit entries yet")).toBeInTheDocument();
  });

  it("renders a row per entry", () => {
    useAuditLogMock.mockReturnValue(
      defaultReturn({ data: { pages: [{ items: [makeEntry()] }] } }),
    );
    render(<AuditTable />);
    expect(screen.getByText("jane@example.com")).toBeInTheDocument();
    expect(screen.getByText("UPDATE")).toBeInTheDocument();
    expect(screen.getByText("Invoice#4")).toBeInTheDocument();
  });

  it("shows Load more when hasNextPage and calls fetchNextPage on click", () => {
    const fetchNextPage = vi.fn();
    useAuditLogMock.mockReturnValue(
      defaultReturn({ hasNextPage: true, fetchNextPage }),
    );
    render(<AuditTable />);
    fireEvent.click(screen.getByRole("button", { name: "Load more" }));
    expect(fetchNextPage).toHaveBeenCalled();
  });

  it("shows Loading… and disables the button while fetching the next page", () => {
    useAuditLogMock.mockReturnValue(
      defaultReturn({ hasNextPage: true, isFetchingNextPage: true }),
    );
    render(<AuditTable />);
    expect(screen.getByRole("button", { name: "Loading…" })).toBeDisabled();
  });

  it("exports the flattened entries as CSV", () => {
    useAuditLogMock.mockReturnValue(
      defaultReturn({ data: { pages: [{ items: [makeEntry({ id: 3 })] }] } }),
    );
    render(<AuditTable />);
    fireEvent.click(screen.getByRole("button", { name: "Export CSV" }));
    expect(exportCsv).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ id: 3 })]),
      "audit-log.csv",
    );
  });
});
