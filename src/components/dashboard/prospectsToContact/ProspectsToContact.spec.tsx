import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ProspectsToContact } from "./ProspectsToContact";
import { formatTimeSinceContact } from "./formatTimeSinceContact";
import type { DashboardProspect } from "@/types/dashboard.types";

const daysAgoIso = (days: number) =>
  new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

function renderWidget(prospects: DashboardProspect[]) {
  return render(
    <MemoryRouter>
      <ProspectsToContact prospects={prospects} />
    </MemoryRouter>,
  );
}

describe("ProspectsToContact", () => {
  it("shows empty state when there are no prospects", () => {
    renderWidget([]);
    expect(
      screen.getByText("No prospects need follow-up right now."),
    ).toBeInTheDocument();
  });

  it("renders a row per prospect with name, status badge, and time since contact", () => {
    const prospects: DashboardProspect[] = [
      { id: 1, name: "Acme Corp", status: "TO_CONTACT", contactedAt: null },
      {
        id: 2,
        name: "Globex Inc",
        status: "FOLLOW_UP_1",
        contactedAt: daysAgoIso(14),
      },
    ];
    renderWidget(prospects);

    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    expect(screen.getByText("Prospect")).toBeInTheDocument();
    expect(screen.getByText("Never contacted")).toBeInTheDocument();

    expect(screen.getByText("Globex Inc")).toBeInTheDocument();
    expect(screen.getByText("Follow up 1")).toBeInTheDocument();
    expect(screen.getByText("2 weeks ago")).toBeInTheDocument();
  });

  it("links each row to the client detail page", () => {
    renderWidget([
      { id: 42, name: "Acme Corp", status: "TO_CONTACT", contactedAt: null },
    ]);
    expect(screen.getByRole("link", { name: /Acme Corp/ })).toHaveAttribute(
      "href",
      "/clients/42",
    );
  });
});

describe("formatTimeSinceContact", () => {
  it("returns 'Never contacted' for null", () => {
    expect(formatTimeSinceContact(null)).toBe("Never contacted");
  });

  it("returns 'Contacted this week' for under 7 days", () => {
    expect(formatTimeSinceContact(daysAgoIso(3))).toBe("Contacted this week");
  });

  it("returns singular week for exactly 1 week", () => {
    expect(formatTimeSinceContact(daysAgoIso(7))).toBe("1 week ago");
  });

  it("returns plural weeks for multiple weeks", () => {
    expect(formatTimeSinceContact(daysAgoIso(21))).toBe("3 weeks ago");
  });
});
