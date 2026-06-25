import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import type { DashboardDeadline } from "@/types/dashboard.types";
import { UpcomingDeadlines } from "./UpcomingDeadlines";

function makeDeadline(
  overrides: Partial<DashboardDeadline> = {},
): DashboardDeadline {
  return {
    id: 1,
    title: "Translate contract",
    deadline: "2026-06-20T00:00:00.000Z",
    status: "ACTIVE",
    ...overrides,
  };
}

describe("UpcomingDeadlines", () => {
  it("shows an empty state when there are no deadlines", () => {
    render(
      <MemoryRouter>
        <UpcomingDeadlines deadlines={[]} />
      </MemoryRouter>,
    );

    expect(
      screen.getByText("No deadlines in the next 7 days."),
    ).toBeInTheDocument();
  });

  it("renders the title, due date, and a link to the project", () => {
    render(
      <MemoryRouter>
        <UpcomingDeadlines deadlines={[makeDeadline()]} />
      </MemoryRouter>,
    );

    expect(screen.getByText("Translate contract")).toBeInTheDocument();
    expect(screen.getByText("Due 2026-06-20")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", "/projects/1");
  });

  it("falls back to the secondary badge variant for an unknown status", () => {
    render(
      <MemoryRouter>
        <UpcomingDeadlines
          deadlines={[makeDeadline({ status: "SOMETHING_NEW" })]}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText("SOMETHING_NEW")).toBeInTheDocument();
  });
});
