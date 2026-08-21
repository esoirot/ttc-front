import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { TaskActivity } from "@/types/tasks.types";
import { TaskActivityGroup } from "./TaskActivityGroup";

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

describe("TaskActivityGroup", () => {
  it("shows the task title and activity count", () => {
    render(
      <TaskActivityGroup
        taskTitle="Translate homepage"
        activities={[makeActivity(), makeActivity({ id: 2 })]}
      />,
    );

    expect(screen.getByText("Translate homepage")).toBeInTheDocument();
    expect(screen.getByText("×2")).toBeInTheDocument();
  });

  it("starts collapsed and shows no activity rows", () => {
    render(
      <TaskActivityGroup
        taskTitle="Translate homepage"
        activities={[makeActivity()]}
      />,
    );

    expect(
      screen.queryByText("changed status from TODO to IN_PROGRESS"),
    ).not.toBeInTheDocument();
  });

  it("expands to show activity rows when clicked, collapses on second click", () => {
    render(
      <TaskActivityGroup
        taskTitle="Translate homepage"
        activities={[makeActivity()]}
      />,
    );

    fireEvent.click(screen.getByText("Translate homepage"));
    expect(
      screen.getByText("changed status from TODO to IN_PROGRESS"),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByText("Translate homepage"));
    expect(
      screen.queryByText("changed status from TODO to IN_PROGRESS"),
    ).not.toBeInTheDocument();
  });
});
