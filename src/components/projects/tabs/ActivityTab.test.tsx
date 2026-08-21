import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Task, TaskActivity } from "@/types/tasks.types";
import { ActivityTab } from "./ActivityTab";

function makeActivity(overrides: Partial<TaskActivity> = {}): TaskActivity {
  return {
    id: 1,
    taskId: 1,
    userId: 1,
    type: "STATUS_CHANGED",
    payload: JSON.stringify({ from: "TODO", to: "IN_PROGRESS" }),
    createdAt: "2026-06-01T10:00:00.000Z",
    user: { id: 1, name: "Alice" },
    ...overrides,
  };
}

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 1,
    projectId: 1,
    assigneeId: null,
    title: "Translate homepage",
    description: null,
    status: "TODO",
    dueDate: null,
    startDate: null,
    recurring: null,
    reminderOffset: null,
    sortOrder: 0,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("ActivityTab", () => {
  it("shows a loading skeleton while tasksLoading is true", () => {
    render(<ActivityTab tasks={[]} tasksLoading={true} />);
    expect(screen.queryByText("All activity")).not.toBeInTheDocument();
  });

  it("shows empty states when no task has any activity", () => {
    render(
      <ActivityTab
        tasks={[makeTask({ activities: [] })]}
        tasksLoading={false}
      />,
    );
    expect(screen.getByText("No activity yet.")).toBeInTheDocument();
    expect(screen.getByText("No task activity yet.")).toBeInTheDocument();
  });

  it("shows a flat chronological feed of all tasks' activities", () => {
    render(
      <ActivityTab
        tasks={[
          makeTask({
            id: 1,
            title: "Translate homepage",
            activities: [
              makeActivity({
                id: 1,
                taskId: 1,
                type: "CREATED",
                payload: null,
                createdAt: "2026-06-01T09:00:00.000Z",
              }),
            ],
          }),
          makeTask({
            id: 2,
            title: "Proofread footer",
            activities: [
              makeActivity({
                id: 2,
                taskId: 2,
                type: "COMMENT_ADDED",
                payload: null,
                createdAt: "2026-06-01T10:00:00.000Z",
              }),
            ],
          }),
        ]}
        tasksLoading={false}
      />,
    );

    expect(screen.getByText("All activity")).toBeInTheDocument();
    expect(screen.getByText("created this task")).toBeInTheDocument();
    expect(screen.getByText("added a comment")).toBeInTheDocument();
  });

  it("groups activity by task, closed by default, expanding on click", () => {
    render(
      <ActivityTab
        tasks={[
          makeTask({
            id: 1,
            title: "Translate homepage",
            activities: [
              makeActivity({
                id: 1,
                taskId: 1,
                type: "CREATED",
                payload: null,
              }),
            ],
          }),
          makeTask({ id: 2, title: "Task with no activity", activities: [] }),
        ]}
        tasksLoading={false}
      />,
    );

    expect(screen.getByText("By task")).toBeInTheDocument();
    expect(screen.getByText("Translate homepage")).toBeInTheDocument();
    expect(screen.queryByText("Task with no activity")).not.toBeInTheDocument();

    // Two "created this task" texts would exist (flat feed + group), so
    // scope to confirm the group starts collapsed via getAllByText count.
    expect(screen.getAllByText("created this task")).toHaveLength(1);

    fireEvent.click(screen.getByText("Translate homepage"));
    expect(screen.getAllByText("created this task")).toHaveLength(2);
  });
});
