import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { DashboardData } from "@/types/dashboard.types";
import type { AuthUser } from "@/types/auth.types";

const useCurrentUserMock = vi.fn();
const useDashboardMock = vi.fn();
vi.mock("@/hooks/auth/useAuth", () => ({
  useCurrentUser: () => useCurrentUserMock(),
}));
vi.mock("@/hooks/account/useDashboard", () => ({
  useDashboard: () => useDashboardMock(),
}));

vi.mock("./2FA/TwoFactorPromptCard", () => ({
  TwoFactorPromptCard: () => <div>2FA prompt</div>,
}));
vi.mock("./deadlines/UpcomingDeadlines", () => ({
  UpcomingDeadlines: () => <div>Upcoming deadlines</div>,
}));
vi.mock("./recentTimeEntries/RecentTimeEntries", () => ({
  RecentTimeEntries: () => <div>Recent time entries</div>,
}));
vi.mock("./statsGrid/StatsGrid", () => ({
  StatsGrid: () => <div>Stats grid</div>,
}));
vi.mock("./prospectsToContact/ProspectsToContact", () => ({
  ProspectsToContact: () => <div>Prospects to contact</div>,
}));

import { AccountDashboard } from "./AccountDashboard";

function makeDashboard(overrides: Partial<DashboardData> = {}): DashboardData {
  return {
    activeProjectCount: 1,
    unpaidInvoiceCount: 0,
    monthToDateSeconds: 0,
    monthToDateRevenue: 0,
    upcomingDeadlines: [],
    recentTimeEntries: [],
    prospectsToContact: [],
    ...overrides,
  };
}

function makeUser(overrides: Partial<AuthUser> = {}): AuthUser {
  return {
    id: "1",
    email: "jane@example.com",
    name: "Jane Doe",
    role: "USER",
    twoFactorEnabled: false,
    logoUrl: null,
    defaultCurrency: "EUR",
    ...overrides,
  };
}

describe("AccountDashboard", () => {
  beforeEach(() => {
    useCurrentUserMock.mockReset();
    useDashboardMock.mockReset();
  });

  it("shows a loading skeleton when user is loading and no user is cached", () => {
    useCurrentUserMock.mockReturnValue({ user: null, loading: true });
    useDashboardMock.mockReturnValue({ dashboard: null, loading: false });
    render(<AccountDashboard />);
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
  });

  it("shows a loading skeleton when dashboard is loading", () => {
    useCurrentUserMock.mockReturnValue({ user: makeUser(), loading: false });
    useDashboardMock.mockReturnValue({ dashboard: null, loading: true });
    render(<AccountDashboard />);
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
  });

  it("does not show the loading skeleton when user is loading but a cached user exists", () => {
    useCurrentUserMock.mockReturnValue({ user: makeUser(), loading: true });
    useDashboardMock.mockReturnValue({ dashboard: null, loading: false });
    render(<AccountDashboard />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("greets the user by name", () => {
    useCurrentUserMock.mockReturnValue({
      user: makeUser({ name: "Jane Doe" }),
      loading: false,
    });
    useDashboardMock.mockReturnValue({ dashboard: null, loading: false });
    render(<AccountDashboard />);
    expect(screen.getByText(/Welcome back, Jane Doe\./)).toBeInTheDocument();
  });

  it("falls back to email when the user has no name", () => {
    useCurrentUserMock.mockReturnValue({
      user: makeUser({ name: null, email: "jane@example.com" }),
      loading: false,
    });
    useDashboardMock.mockReturnValue({ dashboard: null, loading: false });
    render(<AccountDashboard />);
    expect(
      screen.getByText(/Welcome back, jane@example\.com\./),
    ).toBeInTheDocument();
  });

  it("shows the 2FA prompt when the user has not enabled 2FA", () => {
    useCurrentUserMock.mockReturnValue({
      user: makeUser({ twoFactorEnabled: false }),
      loading: false,
    });
    useDashboardMock.mockReturnValue({ dashboard: null, loading: false });
    render(<AccountDashboard />);
    expect(screen.getByText("2FA prompt")).toBeInTheDocument();
  });

  it("hides the 2FA prompt when the user has enabled 2FA", () => {
    useCurrentUserMock.mockReturnValue({
      user: makeUser({ twoFactorEnabled: true }),
      loading: false,
    });
    useDashboardMock.mockReturnValue({ dashboard: null, loading: false });
    render(<AccountDashboard />);
    expect(screen.queryByText("2FA prompt")).not.toBeInTheDocument();
  });

  it("does not render dashboard sections when dashboard is null", () => {
    useCurrentUserMock.mockReturnValue({ user: makeUser(), loading: false });
    useDashboardMock.mockReturnValue({ dashboard: null, loading: false });
    render(<AccountDashboard />);
    expect(screen.queryByText("Stats grid")).not.toBeInTheDocument();
  });

  it("renders StatsGrid, UpcomingDeadlines, RecentTimeEntries, ProspectsToContact when dashboard is loaded", () => {
    useCurrentUserMock.mockReturnValue({ user: makeUser(), loading: false });
    useDashboardMock.mockReturnValue({
      dashboard: makeDashboard(),
      loading: false,
    });
    render(<AccountDashboard />);
    expect(screen.getByText("Stats grid")).toBeInTheDocument();
    expect(screen.getByText("Upcoming deadlines")).toBeInTheDocument();
    expect(screen.getByText("Recent time entries")).toBeInTheDocument();
    expect(screen.getByText("Prospects to contact")).toBeInTheDocument();
  });
});
