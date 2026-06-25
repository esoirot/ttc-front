import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryClient } from "@/test/queryClientWrapper";
import type { Subtask } from "@/types/tasks.types";

const { gqlFetch, gqlMutate } = vi.hoisted(() => ({
  gqlFetch: vi.fn(),
  gqlMutate: vi.fn(),
}));

vi.mock("@/lib/apollo", () => ({ gqlFetch, gqlMutate }));

import { TaskChecklist } from "./TaskChecklist";

function makeSubtask(overrides: Partial<Subtask> = {}): Subtask {
  return {
    id: 1,
    taskId: 4,
    checklistTitle: null,
    title: "Review draft",
    done: false,
    dueDate: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function renderChecklist(
  props: Partial<Parameters<typeof TaskChecklist>[0]> = {},
) {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <TaskChecklist
        taskId={4}
        subtasks={[]}
        checklistTitles={[]}
        addingChecklist={false}
        onAddingChecklistChange={vi.fn()}
        {...props}
      />
    </QueryClientProvider>,
  );
}

describe("TaskChecklist", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("groups ungrouped subtasks under a default 'Checklist' heading", () => {
    renderChecklist({ subtasks: [makeSubtask({ checklistTitle: null })] });
    expect(screen.getByText("Checklist")).toBeInTheDocument();
    expect(screen.getByText("Review draft")).toBeInTheDocument();
  });

  it("shows named checklist groups with a done/total progress count", () => {
    renderChecklist({
      subtasks: [
        makeSubtask({ id: 1, checklistTitle: "Setup", done: true }),
        makeSubtask({ id: 2, checklistTitle: "Setup", done: false }),
      ],
    });
    expect(screen.getByText("Setup")).toBeInTheDocument();
    expect(screen.getByText("1/2")).toBeInTheDocument();
  });

  it("renders an empty checklist group for a known title with no items yet", () => {
    renderChecklist({ checklistTitles: ["Empty group"] });
    expect(screen.getByText("Empty group")).toBeInTheDocument();
    expect(screen.getByText("0/0")).toBeInTheDocument();
  });

  it("toggles a subtask's done state", async () => {
    gqlMutate.mockResolvedValueOnce({
      updateSubtask: makeSubtask({ id: 1, done: true }),
    });
    renderChecklist({
      subtasks: [makeSubtask({ id: 1, checklistTitle: "Setup" })],
    });

    fireEvent.click(screen.getByRole("checkbox"));

    await waitFor(() =>
      expect(gqlMutate.mock.calls[0][1]).toMatchObject({
        input: { id: 1, done: true },
      }),
    );
  });

  it("creates a new checklist when addingChecklist is true", async () => {
    gqlMutate.mockResolvedValueOnce({ createChecklist: true });
    const onAddingChecklistChange = vi.fn();
    renderChecklist({ addingChecklist: true, onAddingChecklistChange });

    fireEvent.change(screen.getByPlaceholderText("Checklist title…"), {
      target: { value: "Review" },
    });
    fireEvent.click(screen.getByText("Create"));

    expect(onAddingChecklistChange).toHaveBeenCalledWith(false);
    await waitFor(() =>
      expect(gqlMutate).toHaveBeenCalledWith(expect.anything(), {
        taskId: 4,
        title: "Review",
      }),
    );
  });

  it("opens the new-item dialog and creates a subtask", async () => {
    gqlMutate.mockResolvedValueOnce({
      createSubtask: makeSubtask({ id: 9, title: "New item" }),
    });
    renderChecklist({
      subtasks: [makeSubtask({ id: 1, checklistTitle: "Setup" })],
    });

    fireEvent.change(screen.getByPlaceholderText("Add an item…"), {
      target: { value: "New item" },
    });
    fireEvent.click(screen.getByText("Add"));

    expect(screen.getByText("New checklist item")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(gqlMutate.mock.calls[0][1]).toMatchObject({
        input: { checklistTitle: "Setup", title: "New item" },
      }),
    );
  });

  it("deletes a checklist after confirming", async () => {
    gqlMutate.mockResolvedValueOnce({ deleteChecklist: true });
    renderChecklist({
      subtasks: [makeSubtask({ id: 1, checklistTitle: "Setup" })],
    });

    fireEvent.click(screen.getByText("✕"));
    fireEvent.click(screen.getByText("Delete"));

    await waitFor(() =>
      expect(gqlMutate).toHaveBeenCalledWith(expect.anything(), {
        taskId: 4,
        title: "Setup",
      }),
    );
  });

  it("Cancel button in the new-checklist form hides the form without creating", () => {
    const onAddingChecklistChange = vi.fn();
    renderChecklist({ addingChecklist: true, onAddingChecklistChange });

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onAddingChecklistChange).toHaveBeenCalledWith(false);
    expect(gqlMutate).not.toHaveBeenCalled();
  });

  it("Escape key in the checklist title input cancels without creating", () => {
    const onAddingChecklistChange = vi.fn();
    renderChecklist({ addingChecklist: true, onAddingChecklistChange });

    fireEvent.keyDown(screen.getByPlaceholderText("Checklist title…"), {
      key: "Escape",
    });

    expect(onAddingChecklistChange).toHaveBeenCalledWith(false);
    expect(gqlMutate).not.toHaveBeenCalled();
  });

  it("clicking a subtask title opens the edit dialog", () => {
    renderChecklist({
      subtasks: [
        makeSubtask({ id: 1, checklistTitle: "Setup", title: "Review draft" }),
      ],
    });

    fireEvent.click(screen.getByText("Review draft"));

    expect(screen.getByText("Edit checklist item")).toBeInTheDocument();
  });

  it("Remove button in the edit dialog calls deleteSubtask", async () => {
    gqlMutate.mockResolvedValueOnce({ deleteSubtask: true });
    renderChecklist({
      subtasks: [
        makeSubtask({ id: 5, checklistTitle: "Setup", title: "Review draft" }),
      ],
    });

    fireEvent.click(screen.getByText("Review draft"));
    expect(screen.getByText("Edit checklist item")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Remove" }));

    await waitFor(() =>
      expect(gqlMutate).toHaveBeenCalledWith(expect.anything(), { id: 5 }),
    );
  });

  it("renders multiple named checklist groups", () => {
    renderChecklist({
      subtasks: [
        makeSubtask({ id: 1, checklistTitle: "Alpha", title: "A1" }),
        makeSubtask({ id: 2, checklistTitle: "Beta", title: "B1" }),
      ],
    });

    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Beta")).toBeInTheDocument();
    expect(screen.getByText("A1")).toBeInTheDocument();
    expect(screen.getByText("B1")).toBeInTheDocument();
  });
});
