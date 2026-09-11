import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { IntlProvider } from "react-intl";
import { describe, expect, it } from "vitest";
import type { ReactElement } from "react";
import { messages } from "@/i18n/messages";
import type { Locale } from "@/i18n/useLocale";
import type { DashboardDeadline } from "@/types/dashboard.types";
import { UpcomingDeadlines } from "./UpcomingDeadlines";

function renderWithProviders(ui: ReactElement, locale: Locale = "en") {
  return render(
    <IntlProvider locale={locale} messages={messages[locale]}>
      <MemoryRouter>{ui}</MemoryRouter>
    </IntlProvider>,
  );
}

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
    renderWithProviders(<UpcomingDeadlines deadlines={[]} />);

    expect(
      screen.getByText("No deadlines in the next 7 days."),
    ).toBeInTheDocument();
  });

  it("renders the title, due date, and a link to the project", () => {
    renderWithProviders(<UpcomingDeadlines deadlines={[makeDeadline()]} />);

    expect(screen.getByText("Translate contract")).toBeInTheDocument();
    expect(screen.getByText("Due 2026-06-20")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", "/projects/1");
  });

  it("falls back to the secondary badge variant for an unknown status", () => {
    renderWithProviders(
      <UpcomingDeadlines
        deadlines={[makeDeadline({ status: "SOMETHING_NEW" })]}
      />,
    );

    expect(screen.getByText("SOMETHING_NEW")).toBeInTheDocument();
  });

  it("renders French copy when locale is fr", () => {
    renderWithProviders(<UpcomingDeadlines deadlines={[]} />, "fr");

    expect(
      screen.getByText("Aucune échéance dans les 7 prochains jours."),
    ).toBeInTheDocument();
  });
});
