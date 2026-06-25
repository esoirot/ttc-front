import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { DashboardData } from "@/types/dashboard.types";
import { StatsGrid } from "./StatsGrid";

function makeDashboard(overrides: Partial<DashboardData> = {}): DashboardData {
  return {
    activeProjectCount: 3,
    unpaidInvoiceCount: 2,
    monthToDateSeconds: 5400,
    monthToDateRevenue: 1234.5,
    upcomingDeadlines: [],
    recentTimeEntries: [],
    prospectsToContact: [],
    ...overrides,
  };
}

describe("StatsGrid", () => {
  it("renders all four stat values", () => {
    render(<StatsGrid dashboard={makeDashboard()} />);

    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("1h 30m")).toBeInTheDocument();
    expect(screen.getByText("1234.50")).toBeInTheDocument();
  });

  it("formats minutes-only durations without an hours prefix", () => {
    render(
      <StatsGrid dashboard={makeDashboard({ monthToDateSeconds: 900 })} />,
    );

    expect(screen.getByText("15m")).toBeInTheDocument();
  });

  it("shows the currency label next to revenue", () => {
    render(<StatsGrid dashboard={makeDashboard()} />);

    expect(screen.getByText("EUR")).toBeInTheDocument();
  });
});
