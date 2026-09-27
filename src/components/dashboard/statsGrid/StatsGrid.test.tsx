import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import type { DashboardData } from "@/types/dashboard.types";
import { StatsGrid } from "./StatsGrid";
import { createIntlWrapper } from "@/test/intlWrapper";

function makeWrapper(locale?: "en" | "fr") {
  const IntlWrapper = createIntlWrapper(locale);
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <IntlWrapper>
        <MemoryRouter>{children}</MemoryRouter>
      </IntlWrapper>
    );
  };
}

const wrapper = makeWrapper();

function makeDashboard(overrides: Partial<DashboardData> = {}): DashboardData {
  return {
    activeProjectCount: 3,
    monthToDateSeconds: 5400,
    monthToDateRevenue: 1234.5,
    yearToDateWords: 12345,
    upcomingDeadlines: [],
    recentTimeEntries: [],
    prospectsToContact: [],
    ...overrides,
  };
}

describe("StatsGrid", () => {
  it("renders all four stat values", () => {
    render(<StatsGrid dashboard={makeDashboard()} />, { wrapper });

    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("1h 30m")).toBeInTheDocument();
    expect(screen.getByText("1234.50")).toBeInTheDocument();
    expect(screen.getByText("12,345")).toBeInTheDocument();
  });

  it("formats minutes-only durations without an hours prefix", () => {
    render(
      <StatsGrid dashboard={makeDashboard({ monthToDateSeconds: 900 })} />,
      { wrapper },
    );

    expect(screen.getByText("15m")).toBeInTheDocument();
  });

  it("does not show an unpaid invoices KPI", () => {
    // given the dashboard stats grid
    render(<StatsGrid dashboard={makeDashboard()} />, { wrapper });

    // then no unpaid invoices card is rendered
    expect(screen.queryByText("Unpaid Invoices")).not.toBeInTheDocument();
  });

  it("shows the currency label next to revenue", () => {
    render(<StatsGrid dashboard={makeDashboard()} />, { wrapper });

    expect(screen.getByText("EUR")).toBeInTheDocument();
  });

  it("renders French copy when locale is fr", () => {
    render(<StatsGrid dashboard={makeDashboard()} />, {
      wrapper: makeWrapper("fr"),
    });
    expect(screen.getByText("Projets actifs")).toBeInTheDocument();
    expect(screen.getByText("12 345")).toBeInTheDocument();
  });

  it("navigates to the projects list when the Active Projects card is clicked", () => {
    // given the dashboard stats grid on the home route
    const IntlOnly = createIntlWrapper();
    render(
      <IntlOnly>
        <MemoryRouter initialEntries={["/"]}>
          <Routes>
            <Route
              path="/"
              element={<StatsGrid dashboard={makeDashboard()} />}
            />
            <Route path="/projects" element={<p>Projects list page</p>} />
          </Routes>
        </MemoryRouter>
      </IntlOnly>,
    );

    // when the user clicks anywhere on the Active Projects card
    fireEvent.click(screen.getByText("3"));

    // then the projects list page is shown
    expect(screen.getByText("Projects list page")).toBeInTheDocument();
  });
});
