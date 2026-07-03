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

  it("renames a checklist title on blur", async () => {
    gqlMutate.mockResolvedValueOnce({ renameChecklist: true });
    renderChecklist({
      subtasks: [makeSubtask({ id: 1, checklistTitle: "Setup" })],
    });

    fireEvent.click(screen.getByText("Setup"));
    const input = screen.getByDisplayValue("Setup");
    fireEvent.change(input, { target: { value: "Prep" } });
    fireEvent.blur(input);

    await waitFor(() =>
      expect(gqlMutate).toHaveBeenCalledWith(expect.anything(), {
        taskId: 4,
        oldTitle: "Setup",
        newTitle: "Prep",
      }),
    );
  });

  it("renames a checklist title on Enter", async () => {
    gqlMutate.mockResolvedValueOnce({ renameChecklist: true });
    renderChecklist({
      subtasks: [makeSubtask({ id: 1, checklistTitle: "Setup" })],
    });

    fireEvent.click(screen.getByText("Setup"));
    const input = screen.getByDisplayValue("Setup");
    fireEvent.change(input, { target: { value: "Prep" } });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => expect(gqlMutate).toHaveBeenCalled());
  });

  it("does not rename when the title is unchanged on blur", () => {
    renderChecklist({
      subtasks: [makeSubtask({ id: 1, checklistTitle: "Setup" })],
    });

    fireEvent.click(screen.getByText("Setup"));
    fireEvent.blur(screen.getByDisplayValue("Setup"));

    expect(gqlMutate).not.toHaveBeenCalled();
  });

  it("Escape while renaming reverts to the original title without saving", () => {
    renderChecklist({
      subtasks: [makeSubtask({ id: 1, checklistTitle: "Setup" })],
    });

    fireEvent.click(screen.getByText("Setup"));
    const input = screen.getByDisplayValue("Setup");
    fireEvent.change(input, { target: { value: "Changed" } });
    fireEvent.keyDown(input, { key: "Escape" });

    expect(screen.getByText("Setup")).toBeInTheDocument();
    expect(gqlMutate).not.toHaveBeenCalled();
  });

  it("Add item button is disabled when the input is empty", () => {
    renderChecklist({
      subtasks: [makeSubtask({ id: 1, checklistTitle: "Setup" })],
    });
    expect(screen.getByRole("button", { name: "Add" })).toBeDisabled();
  });

  it("Create checklist button is disabled when the title is empty", () => {
    renderChecklist({ addingChecklist: true });
    expect(screen.getByRole("button", { name: "Create" })).toBeDisabled();
  });

  it("Escape in the item title input closes the new-item dialog", () => {
    renderChecklist({
      subtasks: [makeSubtask({ id: 1, checklistTitle: "Setup" })],
    });

    fireEvent.change(screen.getByPlaceholderText("Add an item…"), {
      target: { value: "New item" },
    });
    fireEvent.click(screen.getByText("Add"));
    expect(screen.getByText("New checklist item")).toBeInTheDocument();

    fireEvent.keyDown(screen.getByPlaceholderText("Item title…"), {
      key: "Escape",
    });

    expect(screen.queryByText("New checklist item")).not.toBeInTheDocument();
  });

  it("Cancel in the new-item dialog closes it without deleting anything", () => {
    renderChecklist({
      subtasks: [makeSubtask({ id: 1, checklistTitle: "Setup" })],
    });

    fireEvent.change(screen.getByPlaceholderText("Add an item…"), {
      target: { value: "New item" },
    });
    fireEvent.click(screen.getByText("Add"));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.queryByText("New checklist item")).not.toBeInTheDocument();
    expect(gqlMutate).not.toHaveBeenCalled();
  });

  it("toggling Due Date reveals date/time inputs and saves a computed dueDate", async () => {
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

    fireEvent.click(screen.getByLabelText("Due Date"));
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();

    const dateInput = document.querySelector('input[type="date"]')!;
    fireEvent.change(dateInput, { target: { value: "2026-08-01" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    const expectedDueDate = new Date("2026-08-01T09:00:00").toISOString();
    await waitFor(() =>
      expect(gqlMutate.mock.calls[0][1]).toMatchObject({
        input: {
          checklistTitle: "Setup",
          title: "New item",
          dueDate: expectedDueDate,
        },
      }),
    );
  });

  it("pre-fills the edit dialog's due date from an existing subtask", () => {
    renderChecklist({
      subtasks: [
        makeSubtask({
          id: 1,
          checklistTitle: "Setup",
          title: "Review draft",
          dueDate: "2026-08-01T14:30:00.000Z",
        }),
      ],
    });

    fireEvent.click(screen.getByText("Review draft"));

    expect(screen.getByLabelText("Due Date")).toBeChecked();
    expect(document.querySelector('input[type="date"]')).toHaveValue(
      "2026-08-01",
    );
  });

  it("saving an edit with Due Date unchecked clears the dueDate", async () => {
    gqlMutate.mockResolvedValueOnce({
      updateSubtask: makeSubtask({ id: 5 }),
    });
    renderChecklist({
      subtasks: [
        makeSubtask({
          id: 5,
          checklistTitle: "Setup",
          title: "Review draft",
          dueDate: "2026-08-01T14:30:00.000Z",
        }),
      ],
    });

    fireEvent.click(screen.getByText("Review draft"));
    fireEvent.click(screen.getByLabelText("Due Date"));
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(gqlMutate.mock.calls[0][1]).toMatchObject({
        input: { id: 5, dueDate: null },
      }),
    );
  });

  it("shows the formatted due date under an item that has one", () => {
    renderChecklist({
      subtasks: [
        makeSubtask({
          id: 1,
          checklistTitle: "Setup",
          title: "Review draft",
          dueDate: "2026-08-01T14:30:00.000Z",
        }),
      ],
    });
    expect(screen.getByText(/Aug 1/)).toBeInTheDocument();
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
