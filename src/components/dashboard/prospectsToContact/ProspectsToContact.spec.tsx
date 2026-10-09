import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { createIntl } from "react-intl";
import { createIntlWrapper } from "@/test/intlWrapper";
import { messages } from "@/i18n/messages";
import { ProspectsToContact } from "./ProspectsToContact";
import { formatTimeSinceContact } from "./formatTimeSinceContact";
import type { DashboardProspect } from "@/types/dashboard.types";

const IntlWrapper = createIntlWrapper();
const intl = createIntl({ locale: "en", messages: messages.en });
const intlFr = createIntl({ locale: "fr", messages: messages.fr });

const daysAgoIso = (days: number) =>
  new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

function makeProspect(
  overrides: Partial<DashboardProspect> = {},
): DashboardProspect {
  return {
    id: 1,
    name: "Acme Corp",
    status: "TO_CONTACT",
    contactedAt: null,
    dueAt: null,
    ...overrides,
  };
}

const iconOf = (name: string, label: string) =>
  within(screen.getByRole("link", { name: new RegExp(name) })).getByRole(
    "img",
    { name: label },
  );

function renderWidget(prospects: DashboardProspect[]) {
  return render(
    <IntlWrapper>
      <MemoryRouter>
        <ProspectsToContact prospects={prospects} />
      </MemoryRouter>
    </IntlWrapper>,
  );
}

describe("ProspectsToContact", () => {
  it("shows empty state when there are no prospects", () => {
    renderWidget([]);
    expect(
      screen.getByText("No prospects to contact in the next 30 days."),
    ).toBeInTheDocument();
  });

  it("renders a row per prospect with name, status badge, and time since contact", () => {
    const prospects: DashboardProspect[] = [
      makeProspect(),
      makeProspect({
        id: 2,
        name: "Globex Inc",
        status: "FOLLOW_UP_1",
        contactedAt: daysAgoIso(14),
        dueAt: daysAgoIso(0),
      }),
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
    renderWidget([makeProspect({ id: 42 })]);
    expect(screen.getByRole("link", { name: /Acme Corp/ })).toHaveAttribute(
      "href",
      "/clients/42",
    );
  });

  it("marks a prospect to contact now with a red warning triangle", () => {
    renderWidget([makeProspect({ name: "Lead", dueAt: null })]);
    expect(iconOf("Lead", "Late")).toHaveClass("text-destructive");
  });

  it("marks an overdue follow-up with a red warning triangle", () => {
    renderWidget([
      makeProspect({
        name: "Overdue",
        status: "FOLLOW_UP_1",
        dueAt: daysAgoIso(3),
      }),
    ]);
    expect(iconOf("Overdue", "Late")).toHaveClass("text-destructive");
  });

  it("marks a follow-up due within a week with a yellow clock", () => {
    renderWidget([
      makeProspect({
        name: "Soon",
        status: "CONTACTED",
        dueAt: daysAgoIso(-4),
      }),
    ]);
    expect(iconOf("Soon", "Due within a week")).toHaveClass("text-amber-500");
  });

  it("marks a follow-up due later with a green calendar", () => {
    renderWidget([
      makeProspect({
        name: "Later",
        status: "FOLLOW_UP_2",
        dueAt: daysAgoIso(-20),
      }),
    ]);
    expect(iconOf("Later", "Upcoming")).toHaveClass("text-emerald-600");
  });

  it("renders French copy when locale is fr", () => {
    const FrWrapper = createIntlWrapper("fr");
    render(
      <FrWrapper>
        <MemoryRouter>
          <ProspectsToContact prospects={[]} />
        </MemoryRouter>
      </FrWrapper>,
    );
    expect(
      screen.getByText(
        "Aucun prospect à contacter dans les 30 prochains jours.",
      ),
    ).toBeInTheDocument();
  });
});

describe("formatTimeSinceContact", () => {
  it("returns 'Never contacted' for null", () => {
    expect(formatTimeSinceContact(null, intl)).toBe("Never contacted");
  });

  it("returns 'Contacted this week' for under 7 days", () => {
    expect(formatTimeSinceContact(daysAgoIso(3), intl)).toBe(
      "Contacted this week",
    );
  });

  it("returns singular week for exactly 1 week", () => {
    expect(formatTimeSinceContact(daysAgoIso(7), intl)).toBe("1 week ago");
  });

  it("returns plural weeks for multiple weeks", () => {
    expect(formatTimeSinceContact(daysAgoIso(21), intl)).toBe("3 weeks ago");
  });

  it("returns French copy when locale is fr", () => {
    expect(formatTimeSinceContact(null, intlFr)).toBe("Jamais contacté");
    expect(formatTimeSinceContact(daysAgoIso(21), intlFr)).toBe(
      "il y a 3 semaines",
    );
  });
});
