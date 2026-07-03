import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { TaskActivity } from "@/types/tasks.types";
import { TaskActivityFeed } from "./TaskActivityFeed";

function makeActivity(overrides: Partial<TaskActivity> = {}): TaskActivity {
  return {
    id: 1,
    taskId: 1,
    userId: 1,
    type: "CREATED",
    payload: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    user: { id: 1, name: "Alice" },
    ...overrides,
  };
}

describe("TaskActivityFeed", () => {
  it("shows an empty state when there is no activity", () => {
    render(<TaskActivityFeed activities={[]} />);
    expect(screen.getByText("No activity yet.")).toBeInTheDocument();
  });

  it("shows the user name and reverses order (newest first)", () => {
    render(
      <TaskActivityFeed
        activities={[
          makeActivity({ id: 1, type: "CREATED" }),
          makeActivity({ id: 2, type: "COMMENT_ADDED" }),
        ]}
      />,
    );

    const items = screen.getAllByText(/Alice/);
    expect(items[0].closest("div")?.textContent).toContain("added a comment");
  });

  it("falls back to 'User <id>' when there is no user", () => {
    render(
      <TaskActivityFeed
        activities={[makeActivity({ user: null, userId: 9 })]}
      />,
    );
    expect(screen.getByText("User 9")).toBeInTheDocument();
  });

  it.each([
    ["CREATED", null, "created this task"],
    [
      "TITLE_CHANGED",
      JSON.stringify({ to: "New title" }),
      'renamed task to "New title"',
    ],
    ["DESCRIPTION_CHANGED", null, "updated description"],
    [
      "STATUS_CHANGED",
      JSON.stringify({ from: "TODO", to: "DONE" }),
      "changed status from TODO to DONE",
    ],
    ["ASSIGNED", JSON.stringify({ to: 5 }), "changed assignee"],
    ["ASSIGNED", JSON.stringify({ to: null }), "unassigned task"],
    [
      "CHECKLIST_CREATED",
      JSON.stringify({ title: "Review" }),
      'created checklist "Review"',
    ],
    ["COMMENT_ADDED", null, "added a comment"],
    ["COMMENT_DELETED", null, "deleted a comment"],
    ["LABEL_ADDED", JSON.stringify({ name: "Urgent" }), 'added label "Urgent"'],
  ] as const)("describes %s correctly", (type, payload, expected) => {
    render(<TaskActivityFeed activities={[makeActivity({ type, payload })]} />);
    expect(screen.getByText(expected, { exact: false })).toBeInTheDocument();
  });

  it("clears due date message when DUE_DATE_SET payload has no 'to'", () => {
    render(
      <TaskActivityFeed
        activities={[
          makeActivity({ type: "DUE_DATE_SET", payload: JSON.stringify({}) }),
        ]}
      />,
    );
    expect(
      screen.getByText("cleared due date", { exact: false }),
    ).toBeInTheDocument();
  });

  it("falls back to the raw type on unparseable JSON payload", () => {
    render(
      <TaskActivityFeed
        activities={[
          makeActivity({ type: "STATUS_CHANGED", payload: "not-json{" }),
        ]}
      />,
    );
    expect(
      screen.getByText("STATUS_CHANGED", { exact: false }),
    ).toBeInTheDocument();
  });

  it("humanizes unknown activity types", () => {
    render(
      <TaskActivityFeed
        activities={[makeActivity({ type: "SOME_NEW_TYPE", payload: null })]}
      />,
    );
    expect(
      screen.getByText("some new type", { exact: false }),
    ).toBeInTheDocument();
  });

  it.each([
    [
      "CHECKLIST_ADDED",
      JSON.stringify({ title: "Step 1" }),
      'added checklist item "Step 1"',
    ],
    [
      "CHECKLIST_RENAMED",
      JSON.stringify({ from: "Old", to: "New" }),
      'renamed checklist "Old" to "New"',
    ],
    [
      "CHECKLIST_ITEM_TOGGLED",
      JSON.stringify({ done: true, title: "Step 1", checklistTitle: "Setup" }),
      'checked "Step 1" in checklist "Setup"',
    ],
    [
      "CHECKLIST_ITEM_TOGGLED",
      JSON.stringify({ done: false, title: "Step 2", checklistTitle: "Setup" }),
      'unchecked "Step 2" in checklist "Setup"',
    ],
    [
      "CHECKLIST_UPDATED",
      JSON.stringify({ title: "Step 1" }),
      'updated checklist item "Step 1"',
    ],
    [
      "CHECKLIST_DELETED",
      JSON.stringify({ title: "Step 1" }),
      'removed checklist item "Step 1"',
    ],
    [
      "CHECKLIST_REMOVED",
      JSON.stringify({ title: "Setup" }),
      'deleted checklist "Setup"',
    ],
    [
      "ATTACHMENT_ADDED",
      JSON.stringify({ name: "doc.pdf" }),
      'attached "doc.pdf"',
    ],
    [
      "ATTACHMENT_UPDATED",
      JSON.stringify({ name: "doc.pdf" }),
      'updated attachment "doc.pdf"',
    ],
    [
      "ATTACHMENT_DELETED",
      JSON.stringify({ url: "https://x.com" }),
      'removed attachment "https://x.com"',
    ],
    ["COMMENT_EDITED", null, "edited a comment"],
    [
      "LABEL_REMOVED",
      JSON.stringify({ name: "Urgent" }),
      'removed label "Urgent"',
    ],
  ] as [string, string | null, string][])(
    "describes %s correctly",
    (type, payload, expected) => {
      render(
        <TaskActivityFeed activities={[makeActivity({ type, payload })]} />,
      );
      expect(screen.getByText(expected, { exact: false })).toBeInTheDocument();
    },
  );

  it.each([
    [
      "STARTED",
      JSON.stringify({ description: "translate chapter 3" }),
      'started time tracking on "translate chapter 3"',
    ],
    ["STARTED", null, "started time tracking"],
    [
      "STOPPED",
      JSON.stringify({ durationSeconds: 5400 }),
      "stopped time tracking (1h 30m)",
    ],
    ["STOPPED", null, "stopped time tracking"],
    [
      "STOPPED",
      JSON.stringify({
        durationSeconds: 5400,
        description: "translate chapter 3",
      }),
      'stopped time tracking on "translate chapter 3" (1h 30m)',
    ],
    [
      "STOPPED",
      JSON.stringify({ description: "translate chapter 3" }),
      'stopped time tracking on "translate chapter 3"',
    ],
    ["RESUMED", null, "resumed time tracking"],
    [
      "DELETED",
      JSON.stringify({ durationSeconds: 120 }),
      "deleted a time entry (2m)",
    ],
    ["DELETED", JSON.stringify({ durationSeconds: 0 }), "deleted a time entry"],
  ] as [string, string | null, string][])(
    "describes %s correctly",
    (type, payload, expected) => {
      render(
        <TaskActivityFeed activities={[makeActivity({ type, payload })]} />,
      );
      expect(screen.getByText(expected, { exact: false })).toBeInTheDocument();
    },
  );

  it("describes DUE_DATE_SET with a to value as a set-due-date message", () => {
    render(
      <TaskActivityFeed
        activities={[
          makeActivity({
            type: "DUE_DATE_SET",
            payload: JSON.stringify({ to: "2026-07-15T12:00:00.000Z" }),
          }),
        ]}
      />,
    );
    expect(
      screen.getByText(/set due date to/i, { exact: false }),
    ).toBeInTheDocument();
  });

  it("shows the first letter of the user name as the avatar initial", () => {
    render(
      <TaskActivityFeed
        activities={[makeActivity({ user: { id: 1, name: "Bob" } })]}
      />,
    );
    expect(screen.getByText("B")).toBeInTheDocument();
  });

  it("shows '?' as avatar initial when the user name is null", () => {
    render(
      <TaskActivityFeed
        activities={[
          makeActivity({ type: "CREATED", user: { id: 1, name: null } }),
        ]}
      />,
    );
    expect(screen.getByText("?")).toBeInTheDocument();
  });
});
