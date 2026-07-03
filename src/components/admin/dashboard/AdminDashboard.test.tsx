import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AdminStats } from "@/types/admin.types";
import type { AuditLogEntry } from "@/types/hubspot.types";

const useAdminStatsMock = vi.fn();
const useAdminInvoicesMock = vi.fn();
const useAuditLogMock = vi.fn();
vi.mock("@/hooks/admin/useAdminStats", () => ({
  useAdminStats: () => useAdminStatsMock(),
}));
vi.mock("@/hooks/admin/useAdminInvoices", () => ({
  useAdminInvoices: () => useAdminInvoicesMock(),
}));
vi.mock("@/hooks/integrations/useHubspot", () => ({
  useAuditLog: (...args: unknown[]) => useAuditLogMock(...args),
}));

vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  AreaChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="area-chart">{children}</div>
  ),
  Area: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
}));

import { AdminDashboard } from "./AdminDashboard";

function makeStats(overrides: Partial<AdminStats> = {}): AdminStats {
  return {
    totalUsers: 5,
    totalClients: 10,
    totalProjects: 8,
    totalInvoices: 3,
    totalRevenue: 1234.5,
    totalTimeSeconds: 7200,
    ...overrides,
  };
}

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

function defaultMocks() {
  useAdminStatsMock.mockReturnValue({ stats: makeStats(), loading: false });
  useAdminInvoicesMock.mockReturnValue({ invoices: [] });
  useAuditLogMock.mockReturnValue({
    data: { pages: [{ items: [] as AuditLogEntry[] }] },
    isLoading: false,
  });
}

describe("AdminDashboard", () => {
  beforeEach(() => {
    useAdminStatsMock.mockReset();
    useAdminInvoicesMock.mockReset();
    useAuditLogMock.mockReset();
    defaultMocks();
  });

  it("shows stat card values", () => {
    render(<AdminDashboard />);
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("€1235")).toBeInTheDocument();
    expect(screen.getByText("2.0h")).toBeInTheDocument();
  });

  it("shows loading skeletons in stat cards while stats load", () => {
    useAdminStatsMock.mockReturnValue({ stats: undefined, loading: true });
    const { container } = render(<AdminDashboard />);
    expect(
      container.querySelectorAll('[data-slot="skeleton"]').length,
    ).toBeGreaterThan(0);
  });

  it("falls back to 0 stat values when stats is null", () => {
    useAdminStatsMock.mockReturnValue({ stats: null, loading: false });
    render(<AdminDashboard />);
    expect(screen.getByText("€0")).toBeInTheDocument();
    expect(screen.getByText("0.0h")).toBeInTheDocument();
  });

  it("shows 'No data' when there are no invoices to chart", () => {
    render(<AdminDashboard />);
    expect(screen.getByText("No data")).toBeInTheDocument();
  });

  it("renders the revenue chart when invoices exist", () => {
    useAdminInvoicesMock.mockReturnValue({
      invoices: [
        {
          createdAt: "2026-06-24T00:00:00.000Z",
          items: [{ total: 100 }, { total: 50 }],
        },
      ],
    });
    render(<AdminDashboard />);
    expect(screen.getByTestId("area-chart")).toBeInTheDocument();
  });

  it("groups and sums revenue by day, keeping only the most recent 30 days", () => {
    const invoices = Array.from({ length: 35 }, (_, i) => ({
      createdAt: `2026-0${1 + Math.floor(i / 28)}-${String((i % 28) + 1).padStart(2, "0")}T00:00:00.000Z`,
      items: [{ total: 10 }],
    }));
    useAdminInvoicesMock.mockReturnValue({ invoices });
    render(<AdminDashboard />);
    expect(screen.getByTestId("area-chart")).toBeInTheDocument();
  });

  it("shows loading skeletons for recent activity while audit log loads", () => {
    useAuditLogMock.mockReturnValue({ data: undefined, isLoading: true });
    const { container } = render(<AdminDashboard />);
    expect(
      container.querySelectorAll('[data-slot="skeleton"]').length,
    ).toBeGreaterThan(0);
  });

  it("shows 'No recent activity.' when there are no audit entries", () => {
    render(<AdminDashboard />);
    expect(screen.getByText("No recent activity.")).toBeInTheDocument();
  });

  it("renders up to 10 recent activity entries", () => {
    useAuditLogMock.mockReturnValue({
      data: { pages: [{ items: [makeEntry()] }] },
      isLoading: false,
    });
    render(<AdminDashboard />);
    expect(screen.getByText("CREATE")).toBeInTheDocument();
    expect(screen.getByText("Client#1")).toBeInTheDocument();
    expect(screen.getByText("jane@example.com")).toBeInTheDocument();
  });

  it("passes undefined userId and limit 10 to useAuditLog", () => {
    render(<AdminDashboard />);
    expect(useAuditLogMock).toHaveBeenCalledWith(undefined, 10);
  });
});
