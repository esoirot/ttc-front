import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryWrapper } from "@/test/queryClientWrapper";
import { messages } from "@/i18n/messages";
import type { Locale } from "@/i18n/useLocale";
import type { Project } from "@/types/projects.types";
import type { TimeEntry } from "@/types/time-entries.types";
import { formatDuration } from "@/lib/time";

function createIntlQueryWrapper(locale: Locale = "en") {
  const QueryWrapper = createQueryWrapper();
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <IntlProvider locale={locale} messages={messages[locale]}>
        <QueryWrapper>{children}</QueryWrapper>
      </IntlProvider>
    );
  };
}

const { gqlFetch } = vi.hoisted(() => ({ gqlFetch: vi.fn() }));
vi.mock("@/lib/apollo", () => ({ gqlFetch }));

vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  PieChart: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  Pie: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Cell: () => null,
  Tooltip: ({
    formatter,
  }: {
    formatter: (value: number) => [string, string];
  }) => <div data-testid="tooltip-preview">{formatter(7325)[0]}</div>,
  Legend: ({
    formatter,
  }: {
    formatter: (
      value: string,
      entry: { payload: { name: string; value: number } },
    ) => string;
  }) => (
    <div data-testid="legend-preview">
      <span>
        {formatter("Short title", {
          payload: { name: "Short title", value: 1000 },
        })}
      </span>
      <span>
        {formatter("A Very Long Task Title Exceeding Eighteen Chars", {
          payload: {
            name: "A Very Long Task Title Exceeding Eighteen Chars",
            value: 2000,
          },
        })}
      </span>
    </div>
  ),
}));

import { OverviewTab } from "./OverviewTab";

/** Matches a paragraph by its whole text, even when split across spans. */
function paragraph(text: string) {
  return (_: string, el: Element | null) =>
    el?.tagName === "P" && el.textContent === text;
}

function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    id: 1,
    userId: 1,
    clientId: null,
    title: "P",
    description: null,
    status: "ACTIVE",
    sourceLanguage: null,
    targetLanguage: null,
    wordCount: null,
    unitPrice: null,
    fixedFee: null,
    hourlyRate: null,
    perWordRate: null,
    useCustomRate: false,
    rateSheetId: null,
    currency: "EUR",
    deadline: null,
    startDate: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function makeTimeEntry(overrides: Partial<TimeEntry> = {}): TimeEntry {
  return {
    id: 1,
    userId: 1,
    projectId: 1,
    taskId: null,
    task: null,
    subtaskId: null,
    subtask: null,
    description: null,
    startTime: "2026-06-10T00:00:00.000Z",
    endTime: "2026-06-10T01:00:00.000Z",
    durationSeconds: 1000,
    billable: true,
    clockifyEntryId: null,
    activityId: null,
    activity: null,
    tags: [],
    createdAt: "2026-06-10T00:00:00.000Z",
    updatedAt: "2026-06-10T00:00:00.000Z",
    ...overrides,
  };
}

function setupGqlFetch(
  overrides: {
    rateSheets?: unknown[];
    timeEntries?: TimeEntry[];
  } = {},
) {
  gqlFetch.mockImplementation((query: unknown) => {
    const opName =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (query as any)?.definitions?.[0]?.name?.value ?? String(query);
    switch (opName) {
      case "FirstTimeEntryStart":
        return Promise.resolve({
          firstTimeEntryStart: new Date(2025, 2, 4, 9).toISOString(),
        });
      case "RateSheets":
        return Promise.resolve({ rateSheets: overrides.rateSheets ?? [] });
      case "TimeEntries":
        return Promise.resolve({
          timeEntries: {
            items: overrides.timeEntries ?? [],
            nextCursor: null,
            total: (overrides.timeEntries ?? []).length,
          },
        });
      default:
        return Promise.resolve({});
    }
  });
}

describe("OverviewTab", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 9, 15));
    gqlFetch.mockReset();
    setupGqlFetch();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("always shows time logged, formatted", () => {
    render(<OverviewTab project={makeProject()} totalSeconds={3661} />, {
      wrapper: createIntlQueryWrapper(),
    });
    expect(screen.getByText("1:01:01")).toBeInTheDocument();
  });

  it("does not claim 'No client rate sheet for this project' while rate sheets are still loading", async () => {
    let resolveRateSheets!: (v: { rateSheets: unknown[] }) => void;
    const rateSheetsPromise = new Promise<{ rateSheets: unknown[] }>(
      (resolve) => {
        resolveRateSheets = resolve;
      },
    );
    gqlFetch.mockImplementation((query: unknown) => {
      const opName =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (query as any)?.definitions?.[0]?.name?.value ?? String(query);
      if (opName === "RateSheets") return rateSheetsPromise;
      return Promise.resolve({
        timeEntries: { items: [], nextCursor: null, total: 0 },
      });
    });

    render(
      <OverviewTab
        project={makeProject({
          clientId: 3,
          sourceLanguage: "EN",
          targetLanguage: "FR",
        })}
        totalSeconds={0}
      />,
      { wrapper: createIntlQueryWrapper() },
    );

    expect(
      screen.queryByText("No client rate sheet for this project"),
    ).not.toBeInTheDocument();

    resolveRateSheets({ rateSheets: [] });
    await rateSheetsPromise;

    expect(
      await screen.findByText("No client rate sheet for this project"),
    ).toBeInTheDocument();
  });

  it("hides word count card and shows the no-rate-sheet fallback when unset", async () => {
    render(<OverviewTab project={makeProject()} totalSeconds={0} />, {
      wrapper: createIntlQueryWrapper(),
    });
    expect(screen.queryByText("Word count")).not.toBeInTheDocument();
    expect(
      await screen.findByText("No client rate sheet for this project"),
    ).toBeInTheDocument();
  });

  it("shows word count and only the custom pricing lines that are set when useCustomRate is on", () => {
    render(
      <OverviewTab
        project={makeProject({
          wordCount: 1000,
          fixedFee: null,
          hourlyRate: 50,
          perWordRate: 0.1,
          useCustomRate: true,
          currency: "USD",
        })}
        totalSeconds={0}
      />,
      { wrapper: createIntlQueryWrapper() },
    );
    expect(screen.getByText(paragraph("0 / 1,000"))).toBeInTheDocument();
    expect(screen.getByText("Pricing")).toBeInTheDocument();
    expect(screen.queryByText(/^Fixed /)).not.toBeInTheDocument();
    expect(screen.getByText("50 USD/hr")).toBeInTheDocument();
    expect(screen.getByText("0.1 USD/word")).toBeInTheDocument();
  });

  it("shows only the fixed fee when it is the only custom rate set", () => {
    render(
      <OverviewTab
        project={makeProject({
          fixedFee: 300,
          hourlyRate: null,
          perWordRate: null,
          useCustomRate: true,
          currency: "USD",
        })}
        totalSeconds={0}
      />,
      { wrapper: createIntlQueryWrapper() },
    );
    expect(screen.getByText("Fixed 300 USD")).toBeInTheDocument();
    expect(screen.queryByText(/\/hr$/)).not.toBeInTheDocument();
    expect(screen.queryByText(/\/word$/)).not.toBeInTheDocument();
  });

  it("shows the wordsProcessed sum over the wordCount target", () => {
    render(
      <OverviewTab
        project={makeProject({ wordCount: 1000, totalWordsProcessed: 400 })}
        totalSeconds={0}
      />,
      { wrapper: createIntlQueryWrapper() },
    );
    expect(screen.getByText(paragraph("400 / 1,000"))).toBeInTheDocument();
  });

  it("shortens a word count target of a million or more", () => {
    render(
      <OverviewTab
        project={makeProject({
          wordCount: 2_500_000,
          totalWordsProcessed: 400,
        })}
        totalSeconds={0}
      />,
      { wrapper: createIntlQueryWrapper() },
    );
    expect(screen.getByText(paragraph("400 / 2.5M"))).toBeInTheDocument();
    expect(screen.getByTitle("2,500,000")).toBeInTheDocument();
  });

  it("shows the client rate sheet price per word when useCustomRate is off and a sheet matches", async () => {
    setupGqlFetch({
      rateSheets: [
        {
          id: 1,
          userId: 1,
          activityId: null,
          clientId: 5,
          name: "EN-FR standard",
          description: null,
          sourceLanguage: "EN",
          targetLanguage: "FR",
          currency: "EUR",
          pricePerWord: 0.12,
          matchRates: {
            perfectMatch: 0,
            cm: 0,
            repetitions: 0,
            repetitionsBetweenFiles: 0,
            match100: 0,
            match95_99: 0,
            match85_94: 0,
            match75_84: 0,
            match50_74: 0,
            referenceAdaptativeMT: 0,
            adaptativeMTWithLearning: 0,
            newWordsTA: 0,
          },
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
      ],
    });
    render(
      <OverviewTab
        project={makeProject({
          clientId: 5,
          sourceLanguage: "EN",
          targetLanguage: "FR",
          useCustomRate: false,
        })}
        totalSeconds={0}
      />,
      { wrapper: createIntlQueryWrapper() },
    );
    expect(await screen.findByText("0.12 EUR/word")).toBeInTheDocument();
    expect(
      screen.getByText("Client rate sheet — EN-FR standard"),
    ).toBeInTheDocument();
  });

  it("prefers the explicitly selected rateSheetId over a language-pair match", async () => {
    setupGqlFetch({
      rateSheets: [
        {
          id: 1,
          userId: 1,
          activityId: null,
          clientId: 5,
          name: "EN-FR language match",
          description: null,
          sourceLanguage: "EN",
          targetLanguage: "FR",
          currency: "EUR",
          pricePerWord: 0.12,
          matchRates: {},
          isDefault: false,
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
        {
          id: 2,
          userId: 1,
          activityId: null,
          clientId: 5,
          name: "Explicitly chosen sheet",
          description: null,
          sourceLanguage: "DE",
          targetLanguage: "IT",
          currency: "USD",
          pricePerWord: 0.2,
          matchRates: {},
          isDefault: true,
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
      ],
    });
    render(
      <OverviewTab
        project={makeProject({
          clientId: 5,
          sourceLanguage: "EN",
          targetLanguage: "FR",
          useCustomRate: false,
          rateSheetId: 2,
        })}
        totalSeconds={0}
      />,
      { wrapper: createIntlQueryWrapper() },
    );
    expect(await screen.findByText("0.2 USD/word")).toBeInTheDocument();
    expect(
      screen.getByText("Client rate sheet — Explicitly chosen sheet"),
    ).toBeInTheDocument();
  });

  it("hides the Revenue card when the project has no TRANSLATOR activity", () => {
    render(
      <OverviewTab
        project={makeProject({
          activities: [
            { id: 1, name: "Correction", activityType: "CORRECTOR" },
          ],
          totalWordsProcessed: 1000,
          useCustomRate: true,
          perWordRate: 0.1,
        })}
        totalSeconds={0}
      />,
      { wrapper: createIntlQueryWrapper() },
    );
    expect(screen.queryByText("Revenue")).not.toBeInTheDocument();
  });

  it("hides the Revenue card when totalWordsProcessed is 0", () => {
    render(
      <OverviewTab
        project={makeProject({
          activities: [
            { id: 1, name: "Translation", activityType: "TRANSLATOR" },
          ],
          totalWordsProcessed: 0,
          useCustomRate: true,
          perWordRate: 0.1,
        })}
        totalSeconds={0}
      />,
      { wrapper: createIntlQueryWrapper() },
    );
    expect(screen.queryByText("Revenue")).not.toBeInTheDocument();
  });

  it("shows Revenue summing fixed + hourly + per-word custom rates", () => {
    render(
      <OverviewTab
        project={makeProject({
          activities: [
            { id: 1, name: "Translation", activityType: "TRANSLATOR" },
          ],
          totalWordsProcessed: 1000,
          useCustomRate: true,
          fixedFee: 300,
          hourlyRate: 50,
          perWordRate: 0.1,
          currency: "USD",
        })}
        totalSeconds={7200}
      />,
      { wrapper: createIntlQueryWrapper() },
    );
    expect(screen.getByText("Revenue")).toBeInTheDocument();
    expect(
      screen.getByText("Revenue").closest('[data-slot="card"]'),
    ).toHaveTextContent(/500\.00\s*USD/);
  });

  it("shows Revenue from the client rate sheet price per word when useCustomRate is off", async () => {
    setupGqlFetch({
      rateSheets: [
        {
          id: 1,
          userId: 1,
          activityId: null,
          clientId: 5,
          name: "EN-FR standard",
          description: null,
          sourceLanguage: "EN",
          targetLanguage: "FR",
          currency: "EUR",
          pricePerWord: 0.12,
          matchRates: {},
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
      ],
    });
    render(
      <OverviewTab
        project={makeProject({
          activities: [
            { id: 1, name: "Translation", activityType: "TRANSLATOR" },
          ],
          clientId: 5,
          sourceLanguage: "EN",
          targetLanguage: "FR",
          useCustomRate: false,
          totalWordsProcessed: 1000,
        })}
        totalSeconds={0}
      />,
      { wrapper: createIntlQueryWrapper() },
    );
    await waitFor(() =>
      expect(
        screen.getByText("Revenue").closest('[data-slot="card"]'),
      ).toHaveTextContent(/120\.00\s*EUR/),
    );
    expect(screen.getByText("Revenue")).toBeInTheDocument();
  });

  it("shows a Time per task pie scoped to the current month, grouped by task title", async () => {
    setupGqlFetch({
      timeEntries: [
        makeTimeEntry({
          id: 1,
          task: { id: 1, title: "Short title" },
          durationSeconds: 1000,
        }),
        makeTimeEntry({
          id: 2,
          task: {
            id: 2,
            title: "A Very Long Task Title Exceeding Eighteen Chars",
          },
          durationSeconds: 2000,
        }),
      ],
    });
    render(<OverviewTab project={makeProject()} totalSeconds={3000} />, {
      wrapper: createIntlQueryWrapper(),
    });

    const monthLabel = "October 2026";
    expect(
      (await screen.findAllByTestId("tooltip-preview"))[0],
    ).toHaveTextContent("2:02:05");
    expect(screen.getByText("Time per task")).toBeInTheDocument();
    expect(screen.getAllByText(monthLabel).length).toBeGreaterThan(0);
    const [legend] = screen.getAllByTestId("legend-preview");
    expect(legend).toHaveTextContent(`Short title — ${formatDuration(1000)}`);
    expect(legend).toHaveTextContent(
      `A Very Long Task… — ${formatDuration(2000)}`,
    );
  });

  it("still renders the task pie when an entry has no task (grouped as 'No task')", async () => {
    setupGqlFetch({
      timeEntries: [makeTimeEntry({ id: 1, task: null, durationSeconds: 500 })],
    });
    render(<OverviewTab project={makeProject()} totalSeconds={500} />, {
      wrapper: createIntlQueryWrapper(),
    });

    await screen.findAllByTestId("tooltip-preview");
    expect(screen.getByText("Time per task")).toBeInTheDocument();
    expect(
      screen.queryByText("No time logged in October 2026."),
    ).not.toBeInTheDocument();
  });

  it("shows a Time per activity pie grouped by activity name", async () => {
    setupGqlFetch({
      timeEntries: [
        makeTimeEntry({
          id: 1,
          activity: { id: 1, name: "Short title", activityType: "CUSTOM" },
          durationSeconds: 1000,
        }),
        makeTimeEntry({
          id: 2,
          activity: {
            id: 2,
            name: "A Very Long Task Title Exceeding Eighteen Chars",
            activityType: "CUSTOM",
          },
          durationSeconds: 2000,
        }),
      ],
    });
    render(<OverviewTab project={makeProject()} totalSeconds={3000} />, {
      wrapper: createIntlQueryWrapper(),
    });

    await screen.findAllByTestId("tooltip-preview");
    expect(screen.getByText("Time per activity")).toBeInTheDocument();
    const legends = screen.getAllByTestId("legend-preview");
    expect(legends[legends.length - 1]).toHaveTextContent(
      `Short title — ${formatDuration(1000)}`,
    );
  });

  it("still shows both pie cards, with an empty-state message, when there are no time entries this month", async () => {
    render(<OverviewTab project={makeProject()} totalSeconds={0} />, {
      wrapper: createIntlQueryWrapper(),
    });
    expect(await screen.findByText("Time per task")).toBeInTheDocument();
    expect(screen.getByText("Time per activity")).toBeInTheDocument();
    expect(screen.getAllByText("No time logged in October 2026.")).toHaveLength(
      2,
    );
  });

  it("renders French copy when locale is fr", async () => {
    render(<OverviewTab project={makeProject()} totalSeconds={0} />, {
      wrapper: createIntlQueryWrapper("fr"),
    });
    expect(await screen.findByText("Temps par tâche")).toBeInTheDocument();
    expect(
      screen.getAllByText("Aucun temps enregistré en octobre 2026."),
    ).toHaveLength(2);
  });

  it("loads every time entry of this project for the selected month", async () => {
    render(<OverviewTab project={makeProject({ id: 7 })} totalSeconds={0} />, {
      wrapper: createIntlQueryWrapper(),
    });

    await screen.findByText("Time per task");
    await waitFor(() =>
      expect(gqlFetch).toHaveBeenCalledWith(expect.anything(), {
        projectId: 7,
        start: new Date(2026, 9, 1).toISOString(),
        end: new Date(2026, 9, 31, 23, 59, 59, 999).toISOString(),
        pagination: { limit: 1000 },
      }),
    );
  });

  it("switches the pies to the month picked in the filter", async () => {
    render(<OverviewTab project={makeProject({ id: 7 })} totalSeconds={0} />, {
      wrapper: createIntlQueryWrapper(),
    });

    const previous = await screen.findByRole("button", {
      name: "Previous month",
    });
    await waitFor(() => expect(previous).toBeEnabled());
    fireEvent.click(previous);

    expect(
      await screen.findAllByText("No time logged in September 2026."),
    ).toHaveLength(2);
    await waitFor(() =>
      expect(gqlFetch).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          projectId: 7,
          start: new Date(2026, 8, 1).toISOString(),
        }),
      ),
    );
  });

  it("offers years from this project's first logged entry to now", async () => {
    render(<OverviewTab project={makeProject({ id: 7 })} totalSeconds={0} />, {
      wrapper: createIntlQueryWrapper(),
    });

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Previous month" }),
      ).toBeEnabled(),
    );
    expect(gqlFetch).toHaveBeenCalledWith(expect.anything(), { projectId: 7 });
    fireEvent.click(screen.getByRole("combobox", { name: "Year" }));
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual([
      "2025",
      "2026",
    ]);
  });

  it("keeps the KPIs on all-time totals whatever the month", async () => {
    render(<OverviewTab project={makeProject()} totalSeconds={7200} />, {
      wrapper: createIntlQueryWrapper(),
    });

    const previous = await screen.findByRole("button", {
      name: "Previous month",
    });
    await waitFor(() => expect(previous).toBeEnabled());
    fireEvent.click(previous);

    expect(screen.getByText(formatDuration(7200))).toBeInTheDocument();
  });

  it("shows the Task words KPI on translation projects", () => {
    render(
      <OverviewTab
        project={makeProject({
          activities: [
            { id: 1, name: "Translation", activityType: "TRANSLATOR" },
          ],
          totalTaskWords: 1000,
        })}
        totalSeconds={0}
      />,
      { wrapper: createIntlQueryWrapper() },
    );
    expect(
      screen.getByText("Task words").closest('[data-slot="card"]'),
    ).toHaveTextContent("1,000");
  });

  it("shows 0 Task words on a translation project with no words set", () => {
    render(
      <OverviewTab
        project={makeProject({
          activities: [
            { id: 1, name: "Translation", activityType: "TRANSLATOR" },
          ],
          totalTaskWords: null,
        })}
        totalSeconds={0}
      />,
      { wrapper: createIntlQueryWrapper() },
    );
    expect(
      screen.getByText("Task words").closest('[data-slot="card"]'),
    ).toHaveTextContent(/Task words\s*0$/);
  });

  it("hides the Task words KPI on non-translation projects", () => {
    render(
      <OverviewTab
        project={makeProject({ activities: [], totalTaskWords: 1000 })}
        totalSeconds={0}
      />,
      { wrapper: createIntlQueryWrapper() },
    );
    expect(screen.queryByText("Task words")).not.toBeInTheDocument();
  });
});
