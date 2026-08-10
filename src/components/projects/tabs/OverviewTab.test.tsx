import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryWrapper } from "@/test/queryClientWrapper";
import type { Project } from "@/types/projects.types";
import type { Task } from "@/types/tasks.types";
import { formatDuration } from "@/lib/time";

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
    currency: "EUR",
    deadline: null,
    startDate: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 1,
    projectId: 1,
    assigneeId: null,
    title: "Translate doc",
    description: null,
    status: "TODO",
    dueDate: null,
    startDate: null,
    recurring: null,
    reminderOffset: null,
    sortOrder: 0,
    totalTimeSeconds: 0,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  } as Task;
}

describe("OverviewTab", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlFetch.mockResolvedValue({ rateSheets: [] });
  });

  it("always shows time logged, formatted", () => {
    render(
      <OverviewTab project={makeProject()} totalSeconds={3661} tasks={[]} />,
      { wrapper: createQueryWrapper() },
    );
    expect(screen.getByText("1:01:01")).toBeInTheDocument();
  });

  it("hides word count card and shows the no-rate-sheet fallback when unset", () => {
    render(
      <OverviewTab project={makeProject()} totalSeconds={0} tasks={[]} />,
      {
        wrapper: createQueryWrapper(),
      },
    );
    expect(screen.queryByText("Word count")).not.toBeInTheDocument();
    expect(
      screen.getByText("No client rate sheet for this language pair"),
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
        tasks={[]}
      />,
      { wrapper: createQueryWrapper() },
    );
    expect(screen.getByText("1,000")).toBeInTheDocument();
    expect(screen.getByText("Pricing")).toBeInTheDocument();
    expect(screen.queryByText(/^Fixed /)).not.toBeInTheDocument();
    expect(screen.getByText("50 USD/hr")).toBeInTheDocument();
    expect(screen.getByText("0.1 USD/word")).toBeInTheDocument();
  });

  it("shows the client rate sheet price per word when useCustomRate is off and a sheet matches", async () => {
    gqlFetch.mockResolvedValue({
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
        tasks={[]}
      />,
      { wrapper: createQueryWrapper() },
    );
    expect(await screen.findByText("0.12 EUR/word")).toBeInTheDocument();
    expect(
      screen.getByText("Client rate sheet — EN-FR standard"),
    ).toBeInTheDocument();
  });

  it("shows a pie breakdown with an Untracked slice when tasks don't cover total time", () => {
    render(
      <OverviewTab
        project={makeProject()}
        totalSeconds={3661}
        tasks={[
          makeTask({ id: 1, title: "Task A", totalTimeSeconds: 1000 }),
          makeTask({ id: 2, title: "Task B", totalTimeSeconds: 0 }),
        ]}
      />,
      { wrapper: createQueryWrapper() },
    );
    expect(screen.getByText("Time by task")).toBeInTheDocument();
    expect(screen.getByTestId("tooltip-preview")).toHaveTextContent("2:02:05");
    const legend = screen.getByTestId("legend-preview");
    expect(legend).toHaveTextContent(`Short title — ${formatDuration(1000)}`);
    expect(legend).toHaveTextContent(
      `A Very Long Task… — ${formatDuration(2000)}`,
    );
  });

  it("omits the Untracked slice when tracked time matches total, and hides the chart with no tracked time", () => {
    const { rerender } = render(
      <OverviewTab
        project={makeProject()}
        totalSeconds={1000}
        tasks={[makeTask({ id: 1, title: "Task A", totalTimeSeconds: 1000 })]}
      />,
      { wrapper: createQueryWrapper() },
    );
    expect(screen.getByText("Time by task")).toBeInTheDocument();

    rerender(
      <OverviewTab
        project={makeProject()}
        totalSeconds={0}
        tasks={[makeTask({ id: 1, title: "Task A", totalTimeSeconds: 0 })]}
      />,
    );
    expect(screen.queryByText("Time by task")).not.toBeInTheDocument();
  });
});
