import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AuditLogEntry } from "@/types/hubspot.types";

const useAuditLogMock = vi.fn();
vi.mock("@/hooks/integrations/useHubspot", () => ({
  useAuditLog: (...args: unknown[]) => useAuditLogMock(...args),
}));

const { exportCsv } = vi.hoisted(() => ({ exportCsv: vi.fn() }));
vi.mock("@/lib/csv", () => ({ exportCsv }));

import { AdminActivityLogTable } from "./AdminActivityLogTable";

function makeEntry(overrides: Partial<AuditLogEntry> = {}): AuditLogEntry {
  return {
    id: 1,
    userId: 1,
    action: "CREATE",
    resource: "Client#1",
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
    ...overrides,
  };
}

describe("AdminActivityLogTable", () => {
  beforeEach(() => {
    useAuditLogMock.mockReset();
    exportCsv.mockReset();
    useAuditLogMock.mockReturnValue(defaultReturn());
  });

  it("passes undefined userId and limit 50 to useAuditLog", () => {
    render(<AdminActivityLogTable />);
    expect(useAuditLogMock).toHaveBeenCalledWith(undefined, 50);
  });

  it("shows loading skeletons while loading", () => {
    useAuditLogMock.mockReturnValue(defaultReturn({ isLoading: true }));
    render(<AdminActivityLogTable />);
    expect(screen.queryByText("Timestamp")).not.toBeInTheDocument();
  });

  it("shows 'No activity yet.' when there are no entries", () => {
    render(<AdminActivityLogTable />);
    expect(screen.getByText("No activity yet.")).toBeInTheDocument();
  });

  it("renders a row per entry with user, action, and resource", () => {
    useAuditLogMock.mockReturnValue(
      defaultReturn({ data: { pages: [{ items: [makeEntry()] }] } }),
    );
    render(<AdminActivityLogTable />);
    expect(screen.getByText("jane@example.com")).toBeInTheDocument();
    expect(screen.getByText("CREATE")).toBeInTheDocument();
    expect(screen.getByText("Client#1")).toBeInTheDocument();
  });

  it("shows a Load more button when hasNextPage and calls fetchNextPage on click", () => {
    const fetchNextPage = vi.fn();
    useAuditLogMock.mockReturnValue(
      defaultReturn({ hasNextPage: true, fetchNextPage }),
    );
    render(<AdminActivityLogTable />);
    fireEvent.click(screen.getByRole("button", { name: "Load more" }));
    expect(fetchNextPage).toHaveBeenCalled();
  });

  it("exports the flattened entries as CSV when Export CSV is clicked", () => {
    useAuditLogMock.mockReturnValue(
      defaultReturn({ data: { pages: [{ items: [makeEntry({ id: 7 })] }] } }),
    );
    render(<AdminActivityLogTable />);
    fireEvent.click(screen.getByRole("button", { name: "Export CSV" }));
    expect(exportCsv).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ id: 7 })]),
      "activity-log.csv",
    );
  });
});
