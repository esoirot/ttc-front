import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryWrapper } from "@/test/queryClientWrapper";
import type { Project } from "@/types/projects.types";
import type { TimeEntry } from "@/types/time-entries.types";

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
  Tooltip: () => null,
  Legend: () => null,
}));

import { ProjectsOverviewCharts } from "./ProjectsOverviewCharts";

function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    id: 1,
    userId: 1,
    clientId: null,
    title: "Website copy",
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
    totalTimeSeconds: null,
    totalWordsProcessed: null,
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
    wordsProcessed: null,
    tags: [],
    createdAt: "2026-06-10T00:00:00.000Z",
    updatedAt: "2026-06-10T00:00:00.000Z",
    ...overrides,
  };
}

function setupGqlFetch(
  overrides: { projects?: Project[]; timeEntries?: TimeEntry[] } = {},
) {
  gqlFetch.mockImplementation((query: unknown) => {
    const opName =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (query as any)?.definitions?.[0]?.name?.value ?? String(query);
    switch (opName) {
      case "Projects":
        return Promise.resolve({
          projects: {
            items: overrides.projects ?? [],
            nextCursor: null,
            total: (overrides.projects ?? []).length,
          },
        });
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

describe("ProjectsOverviewCharts", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
  });

  it("always shows all 4 chart cards, with empty-state messages when there is no data", async () => {
    setupGqlFetch();
    render(<ProjectsOverviewCharts />, {
      wrapper: createQueryWrapper(),
    });

    expect(await screen.findAllByText("Time per project")).toHaveLength(2);
    expect(screen.getAllByText("Words per project")).toHaveLength(2);
    expect(
      screen.getByText("No time logged yet this month."),
    ).toBeInTheDocument();
    expect(screen.getByText("No time logged yet.")).toBeInTheDocument();
    expect(
      screen.getByText("No words logged yet this month."),
    ).toBeInTheDocument();
    expect(screen.getByText("No words logged yet.")).toBeInTheDocument();
  });

  it("shows the all-time Time and Words per project charts from project totals", async () => {
    setupGqlFetch({
      projects: [
        makeProject({
          id: 1,
          title: "Website copy",
          totalTimeSeconds: 3600,
          totalWordsProcessed: 500,
        }),
        makeProject({
          id: 2,
          title: "App localization",
          totalTimeSeconds: 0,
          totalWordsProcessed: 0,
        }),
      ],
    });
    render(<ProjectsOverviewCharts />, { wrapper: createQueryWrapper() });

    const timeCharts = await screen.findAllByText("Time per project");
    expect(timeCharts).toHaveLength(2);
    expect(screen.getAllByText("All time").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Words per project")).toHaveLength(2);
    expect(
      screen.getByText("No time logged yet this month."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("No words logged yet this month."),
    ).toBeInTheDocument();
  });

  it("shows the monthly Time and Words per project charts grouped by projectId, labeled from the projects list", async () => {
    setupGqlFetch({
      projects: [makeProject({ id: 1, title: "Website copy" })],
      timeEntries: [
        makeTimeEntry({
          id: 1,
          projectId: 1,
          durationSeconds: 1000,
          wordsProcessed: 200,
        }),
        makeTimeEntry({
          id: 2,
          projectId: null,
          durationSeconds: 500,
          wordsProcessed: null,
        }),
      ],
    });
    render(<ProjectsOverviewCharts />, { wrapper: createQueryWrapper() });

    const monthLabel = new Date().toLocaleDateString(undefined, {
      month: "long",
      year: "numeric",
    });
    expect(await screen.findAllByText("Time per project")).toHaveLength(2);
    expect(screen.getAllByText(monthLabel).length).toBeGreaterThan(0);
    expect(screen.getAllByText("Words per project")).toHaveLength(2);
    expect(screen.getByText("No time logged yet.")).toBeInTheDocument();
    expect(screen.getByText("No words logged yet.")).toBeInTheDocument();
  });
});
