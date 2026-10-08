import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { IntlProvider } from "react-intl";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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

// Local dates, so "today" doesn't depend on the test machine's time zone.
const on = (y: number, m: number, d: number) =>
  new Date(y, m - 1, d, 9, 0).toISOString();

function makeDeadline(
  overrides: Partial<DashboardDeadline> = {},
): DashboardDeadline {
  return {
    kind: "PROJECT",
    id: 7,
    title: "Translate contract",
    deadline: on(2026, 6, 20),
    projectId: 7,
    projectTitle: "Translate contract",
    taskId: null,
    taskTitle: null,
    ...overrides,
  };
}

const rowOf = (title: string) => screen.getByText(title).closest("a")!;

describe("UpcomingDeadlines", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 5, 15, 15, 0)); // 15 June 2026, afternoon
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows an empty state when nothing is due", () => {
    renderWithProviders(<UpcomingDeadlines deadlines={[]} />);
    expect(
      screen.getByText("Nothing overdue or due in the next 30 days."),
    ).toBeInTheDocument();
  });

  it("marks a late item with a red warning triangle", () => {
    renderWithProviders(
      <UpcomingDeadlines
        deadlines={[makeDeadline({ title: "Late", deadline: on(2026, 6, 14) })]}
      />,
    );
    const icon = within(rowOf("Late")).getByRole("img", { name: "Late" });
    expect(icon).toHaveClass("text-destructive");
  });

  it("marks an item due today or within a week with a yellow clock", () => {
    renderWithProviders(
      <UpcomingDeadlines
        deadlines={[
          makeDeadline({ id: 1, title: "Today", deadline: on(2026, 6, 15) }),
          makeDeadline({
            id: 2,
            title: "In 7 days",
            deadline: on(2026, 6, 22),
          }),
        ]}
      />,
    );
    for (const title of ["Today", "In 7 days"]) {
      const icon = within(rowOf(title)).getByRole("img", {
        name: "Due within a week",
      });
      expect(icon).toHaveClass("text-amber-500");
    }
  });

  it("marks anything further away with a green calendar", () => {
    renderWithProviders(
      <UpcomingDeadlines
        deadlines={[
          makeDeadline({ title: "Later", deadline: on(2026, 6, 23) }),
        ]}
      />,
    );
    const icon = within(rowOf("Later")).getByRole("img", { name: "Upcoming" });
    expect(icon).toHaveClass("text-emerald-600");
  });

  it("says what each item is, where it belongs, and when it is due", () => {
    renderWithProviders(
      <UpcomingDeadlines
        deadlines={[
          makeDeadline({ title: "Book" }),
          makeDeadline({
            kind: "TASK",
            id: 3,
            title: "Chapter 1",
            projectTitle: "Book",
            taskId: 3,
            taskTitle: "Chapter 1",
          }),
          makeDeadline({
            kind: "CHECKLIST_ITEM",
            id: 9,
            title: "Proofread",
            projectTitle: "Book",
            taskId: 3,
            taskTitle: "Chapter 1",
          }),
        ]}
      />,
    );
    expect(rowOf("Book")).toHaveTextContent(/^BookProject — Due/);
    expect(rowOf("Chapter 1")).toHaveTextContent("Task · Book");
    expect(rowOf("Proofread")).toHaveTextContent(
      "Checklist item · Chapter 1 · Book",
    );
    expect(rowOf("Book")).toHaveTextContent("Due 2026-06-20");
  });

  it("links a project to its page, and a task or checklist item to its task", () => {
    renderWithProviders(
      <UpcomingDeadlines
        deadlines={[
          makeDeadline({ title: "Book", projectId: 7 }),
          makeDeadline({
            kind: "TASK",
            id: 3,
            title: "Chapter 1",
            taskId: 3,
          }),
          makeDeadline({
            kind: "CHECKLIST_ITEM",
            id: 9,
            title: "Proofread",
            taskId: 3,
          }),
        ]}
      />,
    );
    expect(rowOf("Book")).toHaveAttribute("href", "/projects/7");
    expect(rowOf("Chapter 1")).toHaveAttribute("href", "/projects/7?task=3");
    expect(rowOf("Proofread")).toHaveAttribute("href", "/projects/7?task=3");
  });

  it("renders French copy when locale is fr", () => {
    renderWithProviders(<UpcomingDeadlines deadlines={[]} />, "fr");
    expect(screen.getByText("Échéances à venir")).toBeInTheDocument();
  });
});
