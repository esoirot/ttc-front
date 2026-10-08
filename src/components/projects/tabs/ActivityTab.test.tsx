import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TaskActivity } from "@/types/tasks.types";
import { createIntlWrapper } from "@/test/intlWrapper";

const useProjectActivitiesMock = vi.fn();
vi.mock("@/hooks/projects/useProjectActivities", () => ({
  useProjectActivities: (projectId: number) =>
    useProjectActivitiesMock(projectId),
}));

import { ActivityTab } from "./ActivityTab";

const wrapper = createIntlWrapper();

function makeActivity(overrides: Partial<TaskActivity> = {}): TaskActivity {
  return {
    id: 1,
    taskId: 1,
    userId: 1,
    type: "STATUS_CHANGED",
    payload: JSON.stringify({ from: "TODO", to: "IN_PROGRESS" }),
    createdAt: "2026-06-01T10:00:00.000Z",
    user: { id: 1, name: "Alice" },
    task: { id: 1, title: "Translate homepage" },
    ...overrides,
  };
}

function page(
  items: TaskActivity[],
  more: Partial<{ hasMore: boolean; loadMore: () => void }> = {},
) {
  return {
    items,
    loading: false,
    hasMore: false,
    loadMore: vi.fn(),
    ...more,
  };
}

describe("ActivityTab", () => {
  beforeEach(() => {
    useProjectActivitiesMock.mockReset();
  });

  it("reads the project's own activity, paged", () => {
    useProjectActivitiesMock.mockReturnValue(page([]));
    render(<ActivityTab projectId={7} />, { wrapper });
    expect(useProjectActivitiesMock).toHaveBeenCalledWith(7);
  });

  it("shows a loading skeleton while the first page loads", () => {
    useProjectActivitiesMock.mockReturnValue({ ...page([]), loading: true });
    render(<ActivityTab projectId={7} />, { wrapper });
    expect(screen.queryByText("All activity")).not.toBeInTheDocument();
  });

  it("shows empty states when the project has no activity", () => {
    useProjectActivitiesMock.mockReturnValue(page([]));
    render(<ActivityTab projectId={7} />, { wrapper });
    expect(screen.getByText("No activity yet.")).toBeInTheDocument();
    expect(screen.getByText("No task activity yet.")).toBeInTheDocument();
  });

  it("shows every loaded event in one feed", () => {
    useProjectActivitiesMock.mockReturnValue(
      page([
        makeActivity({ id: 2, type: "COMMENT_ADDED", payload: null }),
        makeActivity({
          id: 1,
          type: "CREATED",
          payload: null,
          task: { id: 2, title: "Proofread footer" },
        }),
      ]),
    );
    render(<ActivityTab projectId={7} />, { wrapper });

    expect(screen.getByText("All activity")).toBeInTheDocument();
    expect(screen.getByText("created this task")).toBeInTheDocument();
    expect(screen.getByText("added a comment")).toBeInTheDocument();
  });

  it("groups events by task, closed by default, expanding on click", () => {
    useProjectActivitiesMock.mockReturnValue(
      page([makeActivity({ id: 1, type: "CREATED", payload: null })]),
    );
    render(<ActivityTab projectId={7} />, { wrapper });

    expect(screen.getByText("By task")).toBeInTheDocument();
    expect(screen.getAllByText("created this task")).toHaveLength(1);
    fireEvent.click(screen.getByText("Translate homepage"));
    expect(screen.getAllByText("created this task")).toHaveLength(2);
  });

  it("lists the newest event first, and the most recently active task first", () => {
    useProjectActivitiesMock.mockReturnValue(
      page([
        makeActivity({
          id: 3,
          type: "COMMENT_ADDED",
          payload: null,
          task: { id: 2, title: "Proofread footer" },
        }),
        makeActivity({ id: 2, type: "CREATED", payload: null }),
      ]),
    );
    const { container } = render(<ActivityTab projectId={7} />, { wrapper });

    const text = container.textContent ?? "";
    expect(text.indexOf("added a comment")).toBeLessThan(
      text.indexOf("created this task"),
    );
    expect(text.indexOf("Proofread footer")).toBeLessThan(
      text.indexOf("Translate homepage"),
    );
  });

  it("keeps an event without a task in the feed only, and each group to its own events", () => {
    useProjectActivitiesMock.mockReturnValue(
      page([
        makeActivity({ id: 4, type: "COMMENT_ADDED", payload: null }),
        makeActivity({ id: 3, type: "CREATED", payload: null }),
        makeActivity({
          id: 2,
          type: "DESCRIPTION_CHANGED",
          payload: null,
          task: { id: 2, title: "Proofread footer" },
        }),
        makeActivity({ id: 1, type: "TIMER_NOTE", payload: null, task: null }),
      ]),
    );
    render(<ActivityTab projectId={7} />, { wrapper });

    expect(screen.getAllByText("timer note")).toHaveLength(1);
    fireEvent.click(screen.getByText("Translate homepage"));
    expect(screen.getAllByText("added a comment")).toHaveLength(2);
    expect(screen.getAllByText("updated description")).toHaveLength(1);
  });

  it("loads older activity on demand", () => {
    const loadMore = vi.fn();
    useProjectActivitiesMock.mockReturnValue(
      page([makeActivity()], { hasMore: true, loadMore }),
    );
    render(<ActivityTab projectId={7} />, { wrapper });

    fireEvent.click(screen.getByRole("button", { name: "Load more" }));
    expect(loadMore).toHaveBeenCalled();
  });

  it("offers no Load more on the last page", () => {
    useProjectActivitiesMock.mockReturnValue(page([makeActivity()]));
    render(<ActivityTab projectId={7} />, { wrapper });
    expect(
      screen.queryByRole("button", { name: "Load more" }),
    ).not.toBeInTheDocument();
  });

  it("renders French copy when locale is fr", () => {
    useProjectActivitiesMock.mockReturnValue(page([]));
    render(<ActivityTab projectId={7} />, {
      wrapper: createIntlWrapper("fr"),
    });
    expect(screen.getByText("Toute l'activité")).toBeInTheDocument();
    expect(
      screen.getByText("Aucune activité de tâche pour l'instant."),
    ).toBeInTheDocument();
  });
});
