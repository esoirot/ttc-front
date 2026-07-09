import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ClockifyTimeEntry } from "@/types/clockify.types";

vi.mock("../forms-inputs/ProjectSelect", () => ({
  ProjectSelect: ({ onChange }: { onChange: (id: string | null) => void }) => (
    <button data-testid="project-select" onClick={() => onChange("p2")}>
      Project
    </button>
  ),
}));

vi.mock("../tags/TagChips", () => ({
  TagChips: ({
    onAdd,
    onRemove,
  }: {
    onAdd: (id: string) => void;
    onRemove: (id: string) => void;
  }) => (
    <div>
      <button onClick={() => onAdd("t2")}>add-tag</button>
      <button onClick={() => onRemove("t1")}>remove-tag</button>
    </div>
  ),
}));

vi.mock("../forms-inputs/BillableToggle", () => ({
  BillableToggle: ({ onChange }: { onChange: (v: boolean) => void }) => (
    <button onClick={() => onChange(true)}>billable-toggle</button>
  ),
}));

import { EntryRow } from "./EntryRow";

function makeEntry(
  overrides: Partial<ClockifyTimeEntry> = {},
): ClockifyTimeEntry {
  return {
    id: "e1",
    description: "Translate",
    projectId: null,
    tagIds: ["t1"],
    timeInterval: {
      start: "2026-06-24T09:00:00.000Z",
      end: "2026-06-24T10:30:00.000Z",
      duration: null,
    },
    workspaceId: "ws-1",
    billable: false,
    ...overrides,
  };
}

const baseProps = {
  workspaceId: "ws-1",
  projects: [],
  tags: [],
  billabilityLocked: false,
  onDelete: vi.fn(),
  onResume: vi.fn(),
  onUpdate: vi.fn(),
};

describe("EntryRow", () => {
  it("shows the description, time range, and duration", () => {
    render(<EntryRow {...baseProps} entry={makeEntry()} />);
    expect(screen.getByText("Translate")).toBeInTheDocument();
    expect(screen.getByText("01:30:00")).toBeInTheDocument();
  });

  it("shows No description for an entry with no description", () => {
    render(
      <EntryRow {...baseProps} entry={makeEntry({ description: null })} />,
    );
    expect(screen.getByText("No description")).toBeInTheDocument();
  });

  it("shows running and — for an entry with no end time", () => {
    render(
      <EntryRow
        {...baseProps}
        entry={makeEntry({
          timeInterval: {
            start: "2026-06-24T09:00:00.000Z",
            end: null,
            duration: null,
          },
        })}
      />,
    );
    expect(screen.getByText("running")).toBeInTheDocument();
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("does not render an editable end time while the entry is running", () => {
    render(
      <EntryRow
        {...baseProps}
        entry={makeEntry({
          timeInterval: {
            start: "2026-06-24T09:00:00.000Z",
            end: null,
            duration: null,
          },
        })}
      />,
    );
    expect(
      screen.queryByTitle("Click to edit end time"),
    ).not.toBeInTheDocument();
  });

  it("clicking the start time enters edit mode and commits a new start on Enter", () => {
    const onUpdate = vi.fn();
    render(<EntryRow {...baseProps} entry={makeEntry()} onUpdate={onUpdate} />);

    fireEvent.click(screen.getByTitle("Click to edit start time"));
    const input = screen.getByDisplayValue(/\d{2}:\d{2}/);
    fireEvent.change(input, { target: { value: "07:00" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onUpdate).toHaveBeenCalledTimes(1);
    const call = onUpdate.mock.calls[0][0] as {
      entryId: string;
      start: string;
      end?: string;
    };
    expect(call.entryId).toBe("e1");
    expect(new Date(call.start).getHours()).toBe(7);
    expect(call.end).toBe("2026-06-24T10:30:00.000Z");
  });

  it("clicking the end time enters edit mode and commits a new end on Enter", () => {
    const onUpdate = vi.fn();
    render(<EntryRow {...baseProps} entry={makeEntry()} onUpdate={onUpdate} />);

    fireEvent.click(screen.getByTitle("Click to edit end time"));
    const input = screen.getByDisplayValue(/\d{2}:\d{2}/);
    fireEvent.change(input, { target: { value: "12:00" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onUpdate).toHaveBeenCalledTimes(1);
    const call = onUpdate.mock.calls[0][0] as {
      entryId: string;
      start: string;
      end?: string;
    };
    expect(call.entryId).toBe("e1");
    expect(new Date(call.end!).getHours()).toBe(12);
    expect(call.start).toBe("2026-06-24T09:00:00.000Z");
  });

  it("rejects a start time that would land after the current end time", () => {
    const onUpdate = vi.fn();
    render(<EntryRow {...baseProps} entry={makeEntry()} onUpdate={onUpdate} />);

    fireEvent.click(screen.getByTitle("Click to edit start time"));
    const input = screen.getByDisplayValue(/\d{2}:\d{2}/);
    fireEvent.change(input, { target: { value: "23:00" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onUpdate).not.toHaveBeenCalled();
  });

  it("calls onResume with the entry when the resume button is clicked", () => {
    const onResume = vi.fn();
    const entry = makeEntry();
    render(<EntryRow {...baseProps} entry={entry} onResume={onResume} />);
    fireEvent.click(screen.getByLabelText("Resume entry"));
    expect(onResume).toHaveBeenCalledWith(entry);
  });

  it("calls onDelete with the entry id when the delete button is clicked", () => {
    const onDelete = vi.fn();
    render(
      <EntryRow
        {...baseProps}
        entry={makeEntry({ id: "e9" })}
        onDelete={onDelete}
      />,
    );
    fireEvent.click(screen.getByLabelText("Delete entry"));
    expect(onDelete).toHaveBeenCalledWith("e9");
  });

  it("switches to edit mode and commits a changed description on blur", () => {
    vi.useFakeTimers();
    const onUpdate = vi.fn();
    render(
      <EntryRow
        {...baseProps}
        entry={makeEntry({ description: "Old" })}
        onUpdate={onUpdate}
      />,
    );
    fireEvent.click(screen.getByText("Old"));
    act(() => vi.runAllTimers());
    vi.useRealTimers();

    const input = screen.getByPlaceholderText("Description");
    fireEvent.change(input, { target: { value: "New desc" } });
    fireEvent.blur(input);

    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ entryId: "e1", description: "New desc" }),
    );
    expect(
      screen.queryByPlaceholderText("Description"),
    ).not.toBeInTheDocument();
  });

  it("does not call onUpdate when the description is unchanged on blur", () => {
    const onUpdate = vi.fn();
    render(
      <EntryRow
        {...baseProps}
        entry={makeEntry({ description: "Same" })}
        onUpdate={onUpdate}
      />,
    );
    fireEvent.click(screen.getByText("Same"));
    const input = screen.getByPlaceholderText("Description");
    fireEvent.blur(input);
    expect(onUpdate).not.toHaveBeenCalled();
  });

  it("commits the description on Enter", () => {
    const onUpdate = vi.fn();
    render(
      <EntryRow
        {...baseProps}
        entry={makeEntry({ description: "Old" })}
        onUpdate={onUpdate}
      />,
    );
    fireEvent.click(screen.getByText("Old"));
    const input = screen.getByPlaceholderText("Description");
    fireEvent.change(input, { target: { value: "Enter desc" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ description: "Enter desc" }),
    );
  });

  it("cancels editing on Escape without calling onUpdate", () => {
    const onUpdate = vi.fn();
    render(
      <EntryRow
        {...baseProps}
        entry={makeEntry({ description: "Old" })}
        onUpdate={onUpdate}
      />,
    );
    fireEvent.click(screen.getByText("Old"));
    const input = screen.getByPlaceholderText("Description");
    fireEvent.change(input, { target: { value: "Discarded" } });
    fireEvent.keyDown(input, { key: "Escape" });
    expect(onUpdate).not.toHaveBeenCalled();
    expect(screen.getByText("Old")).toBeInTheDocument();
  });

  it("patches projectId via ProjectSelect", () => {
    const onUpdate = vi.fn();
    render(<EntryRow {...baseProps} entry={makeEntry()} onUpdate={onUpdate} />);
    fireEvent.click(screen.getByTestId("project-select"));
    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ projectId: "p2" }),
    );
  });

  it("patches tagIds via TagChips add/remove", () => {
    const onUpdate = vi.fn();
    render(
      <EntryRow
        {...baseProps}
        entry={makeEntry({ tagIds: ["t1"] })}
        onUpdate={onUpdate}
      />,
    );
    fireEvent.click(screen.getByText("add-tag"));
    expect(onUpdate).toHaveBeenLastCalledWith(
      expect.objectContaining({ tagIds: ["t1", "t2"] }),
    );
    fireEvent.click(screen.getByText("remove-tag"));
    expect(onUpdate).toHaveBeenLastCalledWith(
      expect.objectContaining({ tagIds: [] }),
    );
  });

  it("patches billable via BillableToggle", () => {
    const onUpdate = vi.fn();
    render(<EntryRow {...baseProps} entry={makeEntry()} onUpdate={onUpdate} />);
    fireEvent.click(screen.getByText("billable-toggle"));
    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ billable: true }),
    );
  });

  it("sends full patch payload including unchanged fields from the entry", () => {
    const onUpdate = vi.fn();
    const entry = makeEntry({
      description: "Kept",
      projectId: "p1",
      billable: true,
      tagIds: ["t1"],
    });
    render(<EntryRow {...baseProps} entry={entry} onUpdate={onUpdate} />);
    fireEvent.click(screen.getByText("billable-toggle"));
    expect(onUpdate).toHaveBeenCalledWith({
      entryId: "e1",
      start: entry.timeInterval.start,
      end: entry.timeInterval.end ?? undefined,
      description: "Kept",
      projectId: "p1",
      billable: true,
      tagIds: ["t1"],
    });
  });
});
