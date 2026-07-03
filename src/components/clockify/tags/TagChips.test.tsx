import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ClockifyTag } from "@/types/clockify.types";

const useCreateTagMock = vi.fn();
vi.mock("@/hooks/integrations/useClockify", () => ({
  useCreateTag: (workspaceId: string | null) => useCreateTagMock(workspaceId),
}));

import { TagChips } from "./TagChips";

function makeTag(overrides: Partial<ClockifyTag> = {}): ClockifyTag {
  return {
    id: "t1",
    name: "Urgent",
    workspaceId: "ws-1",
    archived: false,
    ...overrides,
  };
}

const tags = [
  makeTag({ id: "t1", name: "Urgent" }),
  makeTag({ id: "t2", name: "Billable" }),
  makeTag({ id: "t3", name: "Archived", archived: true }),
];

function defaultProps() {
  return {
    workspaceId: "ws-1",
    tagIds: [] as string[],
    tags,
    onAdd: vi.fn(),
    onRemove: vi.fn(),
  };
}

describe("TagChips", () => {
  beforeEach(() => {
    useCreateTagMock.mockReset();
    useCreateTagMock.mockReturnValue({ mutate: vi.fn(), isPending: false });
  });

  it("shows a badge for each active tag", () => {
    render(<TagChips {...defaultProps()} tagIds={["t1", "t2"]} />);
    expect(screen.getByText("Urgent")).toBeInTheDocument();
    expect(screen.getByText("Billable")).toBeInTheDocument();
  });

  it("treats a null tagIds as an empty active list", () => {
    render(<TagChips {...defaultProps()} tagIds={null} />);
    expect(screen.queryByText("Urgent")).not.toBeInTheDocument();
  });

  it("calls onRemove when a tag's × is clicked", () => {
    const onRemove = vi.fn();
    render(
      <TagChips {...defaultProps()} tagIds={["t1"]} onRemove={onRemove} />,
    );
    fireEvent.click(screen.getByText("×"));
    expect(onRemove).toHaveBeenCalledWith("t1");
  });

  it("opens the dropdown on focus and shows unselected, non-archived tags", () => {
    render(<TagChips {...defaultProps()} />);
    fireEvent.focus(screen.getByPlaceholderText("+ tag"));
    expect(screen.getByText("Urgent")).toBeInTheDocument();
    expect(screen.getByText("Billable")).toBeInTheDocument();
    expect(screen.queryByText("Archived")).not.toBeInTheDocument();
  });

  it("excludes already-active tags from the dropdown list", () => {
    render(<TagChips {...defaultProps()} tagIds={["t1"]} />);
    fireEvent.focus(screen.getByPlaceholderText("+ tag"));
    expect(screen.queryByText("Billable")).toBeInTheDocument();
    const dropdownUrgent = screen.queryAllByText("Urgent");
    // Urgent shows once as the active badge, not in the dropdown list.
    expect(dropdownUrgent).toHaveLength(1);
  });

  it("filters the dropdown by the typed query", () => {
    render(<TagChips {...defaultProps()} />);
    const input = screen.getByPlaceholderText("+ tag");
    fireEvent.change(input, { target: { value: "bill" } });
    expect(screen.getByText("Billable")).toBeInTheDocument();
    expect(screen.queryByText("Urgent")).not.toBeInTheDocument();
  });

  it("calls onAdd, clears the query, and closes the dropdown when a tag is selected", () => {
    const onAdd = vi.fn();
    render(<TagChips {...defaultProps()} onAdd={onAdd} />);
    const input = screen.getByPlaceholderText("+ tag");
    fireEvent.focus(input);
    fireEvent.mouseDown(screen.getByText("Urgent"));
    expect(onAdd).toHaveBeenCalledWith("t1");
    expect(input).toHaveValue("");
  });

  it("shows a Create option when the query matches no existing tag", () => {
    render(<TagChips {...defaultProps()} />);
    const input = screen.getByPlaceholderText("+ tag");
    fireEvent.change(input, { target: { value: "Brand new" } });
    expect(screen.getByText('Create "Brand new"')).toBeInTheDocument();
  });

  it("does not show a Create option for an empty query", () => {
    render(<TagChips {...defaultProps()} />);
    fireEvent.focus(screen.getByPlaceholderText("+ tag"));
    expect(screen.queryByText(/^Create/)).not.toBeInTheDocument();
  });

  it("calls createTag with the trimmed query and onAdd/clears on success", () => {
    const mutate = vi.fn(
      (name: string, opts: { onSuccess: (t: ClockifyTag) => void }) => {
        opts.onSuccess(makeTag({ id: "t9", name }));
      },
    );
    useCreateTagMock.mockReturnValue({ mutate, isPending: false });
    const onAdd = vi.fn();
    render(<TagChips {...defaultProps()} onAdd={onAdd} />);
    const input = screen.getByPlaceholderText("+ tag");
    fireEvent.change(input, { target: { value: "  New Tag  " } });
    fireEvent.mouseDown(screen.getByText('Create "New Tag"'));

    expect(mutate).toHaveBeenCalledWith("New Tag", expect.any(Object));
    expect(onAdd).toHaveBeenCalledWith("t9");
    expect(input).toHaveValue("");
  });

  it("does not call createTag when the query is only whitespace", () => {
    const mutate = vi.fn();
    useCreateTagMock.mockReturnValue({ mutate, isPending: false });
    render(<TagChips {...defaultProps()} />);
    const input = screen.getByPlaceholderText("+ tag");
    fireEvent.change(input, { target: { value: "   " } });
    // No create option renders and no dropdown items exist to mousedown on;
    // ensure the component doesn't call createTag in that state.
    expect(screen.queryByText(/^Create/)).not.toBeInTheDocument();
    expect(mutate).not.toHaveBeenCalled();
  });

  it("does not call createTag again while a create mutation is pending", () => {
    const mutate = vi.fn();
    useCreateTagMock.mockReturnValue({ mutate, isPending: true });
    render(<TagChips {...defaultProps()} />);
    const input = screen.getByPlaceholderText("+ tag");
    fireEvent.change(input, { target: { value: "New Tag" } });
    expect(screen.getByText("Creating…")).toBeInTheDocument();
    fireEvent.mouseDown(screen.getByText("Creating…"));
    expect(mutate).not.toHaveBeenCalled();
  });

  it("closes the dropdown after a debounced blur", async () => {
    vi.useFakeTimers();
    render(<TagChips {...defaultProps()} />);
    const input = screen.getByPlaceholderText("+ tag");
    fireEvent.focus(input);
    expect(screen.getByText("Urgent")).toBeInTheDocument();
    fireEvent.blur(input);
    act(() => {
      vi.advanceTimersByTime(150);
    });
    vi.useRealTimers();
    expect(screen.queryByText("Urgent")).not.toBeInTheDocument();
  });
});
