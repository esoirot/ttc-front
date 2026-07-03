import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AuditLogEntry } from "@/types/hubspot.types";

const useAuditLogMock = vi.fn();
vi.mock("@/hooks/integrations/useHubspot", () => ({
  useAuditLog: (...args: unknown[]) => useAuditLogMock(...args),
}));

import { ResourceAuditHistory } from "./ResourceAuditHistory";

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

describe("ResourceAuditHistory", () => {
  beforeEach(() => {
    useAuditLogMock.mockReset();
    useAuditLogMock.mockReturnValue(defaultReturn());
  });

  it("passes undefined userId and limit 20 to useAuditLog", () => {
    render(
      <ResourceAuditHistory
        open={true}
        onClose={vi.fn()}
        resourceName="Acme"
      />,
    );
    expect(useAuditLogMock).toHaveBeenCalledWith(undefined, 20);
  });

  it("shows the resource name in the dialog title", () => {
    render(
      <ResourceAuditHistory
        open={true}
        onClose={vi.fn()}
        resourceName="Acme"
      />,
    );
    expect(screen.getByText("History — Acme")).toBeInTheDocument();
  });

  it("renders nothing when open is false", () => {
    render(
      <ResourceAuditHistory
        open={false}
        onClose={vi.fn()}
        resourceName="Acme"
      />,
    );
    expect(screen.queryByText("History — Acme")).not.toBeInTheDocument();
  });

  it("shows loading skeletons while loading", () => {
    useAuditLogMock.mockReturnValue(defaultReturn({ isLoading: true }));
    render(
      <ResourceAuditHistory
        open={true}
        onClose={vi.fn()}
        resourceName="Acme"
      />,
    );
    expect(screen.queryByText("No history found.")).not.toBeInTheDocument();
  });

  it("shows 'No history found.' when there are no entries", () => {
    render(
      <ResourceAuditHistory
        open={true}
        onClose={vi.fn()}
        resourceName="Acme"
      />,
    );
    expect(screen.getByText("No history found.")).toBeInTheDocument();
  });

  it("renders an entry with action, resource, user, and timestamp", () => {
    useAuditLogMock.mockReturnValue(
      defaultReturn({ data: { pages: [{ items: [makeEntry()] }] } }),
    );
    render(
      <ResourceAuditHistory
        open={true}
        onClose={vi.fn()}
        resourceName="Acme"
      />,
    );
    expect(screen.getByText("CREATE")).toBeInTheDocument();
    expect(screen.getByText("Client#1")).toBeInTheDocument();
    expect(screen.getByText(/jane@example\.com/)).toBeInTheDocument();
  });

  it("does not render a connecting line after the last entry", () => {
    useAuditLogMock.mockReturnValue(
      defaultReturn({
        data: {
          pages: [{ items: [makeEntry({ id: 1 }), makeEntry({ id: 2 })] }],
        },
      }),
    );
    render(
      <ResourceAuditHistory
        open={true}
        onClose={vi.fn()}
        resourceName="Acme"
      />,
    );
    expect(document.querySelectorAll(".bg-border.mt-1").length).toBe(1);
  });

  it("shows Load more when hasNextPage and calls fetchNextPage on click", () => {
    const fetchNextPage = vi.fn();
    useAuditLogMock.mockReturnValue(
      defaultReturn({ hasNextPage: true, fetchNextPage }),
    );
    render(
      <ResourceAuditHistory
        open={true}
        onClose={vi.fn()}
        resourceName="Acme"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Load more" }));
    expect(fetchNextPage).toHaveBeenCalled();
  });

  it("calls onClose when the dialog is dismissed", () => {
    const onClose = vi.fn();
    render(
      <ResourceAuditHistory
        open={true}
        onClose={onClose}
        resourceName="Acme"
      />,
    );
    fireEvent.keyDown(document.body, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });
});
