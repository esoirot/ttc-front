import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryClient } from "@/test/queryClientWrapper";
import type { TaskDetail } from "@/types/tasks.types";

const { gqlFetch, gqlMutate } = vi.hoisted(() => ({
  gqlFetch: vi.fn(),
  gqlMutate: vi.fn(),
}));

vi.mock("@/lib/apollo", () => ({ gqlFetch, gqlMutate }));

import { TaskTimeSection } from "./TaskTimeSection";

type TimeEntryLike = import("@/types/time-entries.types").TimeEntry;

function makeTaskDetail(overrides: Partial<TaskDetail> = {}): TaskDetail {
  return {
    id: 4,
    projectId: 1,
    assigneeId: null,
    title: "Translate doc",
    description: "",
    status: "TODO",
    dueDate: null,
    startDate: null,
    recurring: null,
    reminderOffset: null,
    sortOrder: 0,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    checklistTitles: [],
    subtasks: [],
    comments: [],
    labels: [],
    activities: [],
    attachments: [],
    ...overrides,
  } as TaskDetail;
}

function setupGqlFetch(
  overrides: {
    activeTimer?: TimeEntryLike | null;
    timeEntries?: TimeEntryLike[];
  } = {},
) {
  gqlFetch.mockImplementation((query: unknown) => {
    const opName =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (query as any)?.definitions?.[0]?.name?.value ?? String(query);
    switch (opName) {
      case "Task":
        return Promise.resolve({ task: makeTaskDetail() });
      case "ActiveTimer":
        return Promise.resolve({ activeTimer: overrides.activeTimer ?? null });
      case "TimeEntries":
        return Promise.resolve({
          timeEntries: {
            items: overrides.timeEntries ?? [],
            nextCursor: null,
            total: (overrides.timeEntries ?? []).length,
          },
        });
      case "Project":
        return Promise.resolve({ project: null });
      case "Projects":
        return Promise.resolve({
          projects: { items: [], nextCursor: null, total: 0 },
        });
      case "Tags":
        return Promise.resolve({ tags: [] });
      default:
        return Promise.resolve({});
    }
  });
}

function renderSection(
  overrides: {
    activeTimer?: TimeEntryLike | null;
    timeEntries?: TimeEntryLike[];
  } = {},
) {
  setupGqlFetch(overrides);
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <TaskTimeSection taskId={4} projectId={1} taskTitle="Translate doc" />
    </QueryClientProvider>,
  );
}

describe("TaskTimeSection", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("shows a 'Time' toggle that reveals 'No time logged yet.' when opened", async () => {
    renderSection();
    await waitFor(() => expect(screen.getByText("show ▼")).toBeInTheDocument());

    expect(screen.queryByText("No time logged yet.")).not.toBeInTheDocument();
    fireEvent.click(screen.getByText("show ▼"));

    expect(await screen.findByText("No time logged yet.")).toBeInTheDocument();
    fireEvent.click(screen.getByText("hide ▲"));
    expect(screen.queryByText("No time logged yet.")).not.toBeInTheDocument();
  });

  it("clicking Start timer calls startTimer with a description derived from the task", async () => {
    gqlMutate.mockResolvedValueOnce({
      startTimer: {
        id: 1,
        userId: 1,
        projectId: 1,
        taskId: 4,
        description: "Task Translate doc",
        startTime: "2026-01-01T00:00:00.000Z",
        endTime: null,
        durationSeconds: null,
        billable: true,
        clockifyEntryId: null,
        tags: [],
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    });
    renderSection();
    await waitFor(() =>
      expect(screen.getByText("▶ Start timer")).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByText("▶ Start timer"));

    await waitFor(() =>
      expect(gqlMutate.mock.calls[0][1]).toMatchObject({
        input: expect.objectContaining({ taskId: 4, projectId: 1 }),
      }),
    );
  });

  it("shows the running timer and stops it on click", async () => {
    gqlMutate.mockResolvedValueOnce({
      stopTimer: {
        id: 1,
        userId: 1,
        projectId: 1,
        taskId: 4,
        description: "work",
        startTime: "2026-01-01T00:00:00.000Z",
        endTime: "2026-01-01T01:00:00.000Z",
        durationSeconds: 3600,
        billable: true,
        clockifyEntryId: null,
        tags: [],
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    });
    renderSection({
      activeTimer: {
        id: 1,
        userId: 1,
        projectId: 1,
        taskId: 4,
        description: "work",
        startTime: "2026-01-01T00:00:00.000Z",
        endTime: null,
        durationSeconds: null,
        billable: true,
        clockifyEntryId: null,
        tags: [],
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    });

    const stopButton = await screen.findByRole("button", { name: /Stop/ });
    fireEvent.click(stopButton);

    await waitFor(() => expect(gqlMutate).toHaveBeenCalled());
  });

  it("shows entry count in the Time label and renders entries once toggled open", async () => {
    renderSection({
      timeEntries: [
        {
          id: 1,
          userId: 1,
          projectId: 1,
          taskId: 4,
          description: "Translated pages",
          startTime: "2026-01-01T00:00:00.000Z",
          endTime: "2026-01-01T01:00:00.000Z",
          durationSeconds: 3600,
          billable: true,
          clockifyEntryId: null,
          tags: [],
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
      ],
    });

    expect(await screen.findByText("Time (1)")).toBeInTheDocument();
    fireEvent.click(screen.getByText("show ▼"));

    expect(await screen.findByText("Translated pages")).toBeInTheDocument();
  });
});
