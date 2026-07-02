import { fireEvent, render, screen } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import type { ReactElement } from "react";
import { createQueryClient } from "@/test/queryClientWrapper";

let tagChipsProps: Record<string, unknown> = {};
vi.mock("../tags/TtcTagChips", () => ({
  TtcTagChips: (props: Record<string, unknown>) => {
    tagChipsProps = props;
    return <div data-testid="tag-chips" />;
  },
}));

import { formatTime } from "@/components/clockify/helpers";
import type { TimeEntry } from "@/types/time-entries.types";
import type { Project } from "@/types/projects.types";
import { TtcEntryRow } from "./TtcEntryRow";

function wrap(el: ReactElement) {
  return (
    <QueryClientProvider client={createQueryClient()}>{el}</QueryClientProvider>
  );
}

function makeEntry(overrides: Partial<TimeEntry> = {}): TimeEntry {
  return {
    id: 1,
    userId: 1,
    projectId: null,
    description: "Translate",
    startTime: "2026-06-01T08:00:00.000Z",
    endTime: "2026-06-01T09:00:00.000Z",
    durationSeconds: 3600,
    billable: true,
    clockifyEntryId: null,
    tags: [],
    createdAt: "2026-06-01T08:00:00.000Z",
    updatedAt: "2026-06-01T08:00:00.000Z",
    ...overrides,
  };
}

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
    currency: "EUR",
    deadline: null,
    startDate: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  } as Project;
}

function baseProps(overrides: Partial<Parameters<typeof TtcEntryRow>[0]> = {}) {
  return {
    entry: makeEntry(),
    projects: [],
    tags: [],
    onDelete: vi.fn(),
    onResume: vi.fn(),
    onUpdate: vi.fn(),
    ...overrides,
  };
}

describe("TtcEntryRow", () => {
  it("shows the description, or 'No description' fallback", () => {
    const { rerender } = render(wrap(<TtcEntryRow {...baseProps()} />));
    expect(screen.getByText("Translate")).toBeInTheDocument();

    rerender(
      wrap(
        <TtcEntryRow
          {...baseProps({ entry: makeEntry({ description: null }) })}
        />,
      ),
    );
    expect(screen.getByText("No description")).toBeInTheDocument();
  });

  it("shows the start/end time and duration", () => {
    const entry = makeEntry();
    render(wrap(<TtcEntryRow {...baseProps({ entry })} />));

    expect(screen.getByText(formatTime(entry.startTime))).toBeInTheDocument();
    expect(screen.getByText(formatTime(entry.endTime!))).toBeInTheDocument();
    expect(screen.getByText("01:00:00")).toBeInTheDocument();
  });

  it("shows 'running' when endTime is null and '—' when duration is null", () => {
    render(
      wrap(
        <TtcEntryRow
          {...baseProps({
            entry: makeEntry({ endTime: null, durationSeconds: null }),
          })}
        />,
      ),
    );

    expect(screen.getByText("running")).toBeInTheDocument();
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("enters edit mode on description click and commits the trimmed value on Enter", () => {
    const onUpdate = vi.fn();
    render(wrap(<TtcEntryRow {...baseProps({ onUpdate })} />));

    fireEvent.click(screen.getByText("Translate"));
    const input = screen.getByPlaceholderText("Description");
    fireEvent.change(input, { target: { value: "  Renamed  " } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onUpdate).toHaveBeenCalledWith({ id: 1, description: "Renamed" });
  });

  it("does not call onUpdate when the description is unchanged", () => {
    const onUpdate = vi.fn();
    render(wrap(<TtcEntryRow {...baseProps({ onUpdate })} />));

    fireEvent.click(screen.getByText("Translate"));
    const input = screen.getByPlaceholderText("Description");
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onUpdate).not.toHaveBeenCalled();
  });

  it("Escape cancels the edit without committing", () => {
    const onUpdate = vi.fn();
    render(wrap(<TtcEntryRow {...baseProps({ onUpdate })} />));

    fireEvent.click(screen.getByText("Translate"));
    const input = screen.getByPlaceholderText("Description");
    fireEvent.change(input, { target: { value: "Changed" } });
    fireEvent.keyDown(input, { key: "Escape" });

    expect(onUpdate).not.toHaveBeenCalled();
    expect(screen.getByText("Translate")).toBeInTheDocument();
  });

  it("commits the description on blur", () => {
    const onUpdate = vi.fn();
    render(wrap(<TtcEntryRow {...baseProps({ onUpdate })} />));

    fireEvent.click(screen.getByText("Translate"));
    const input = screen.getByPlaceholderText("Description");
    fireEvent.change(input, { target: { value: "Blurred" } });
    fireEvent.blur(input);

    expect(onUpdate).toHaveBeenCalledWith({ id: 1, description: "Blurred" });
  });

  it("shows 'No project' when projectId has no match, or the matched project's title", () => {
    const { rerender } = render(wrap(<TtcEntryRow {...baseProps()} />));
    expect(screen.getByText("No project")).toBeInTheDocument();

    rerender(
      wrap(
        <TtcEntryRow
          {...baseProps({
            entry: makeEntry({ projectId: 1 }),
            projects: [makeProject({ id: 1, title: "Website copy" })],
          })}
        />,
      ),
    );
    expect(screen.getByText("Website copy")).toBeInTheDocument();
  });

  it("selecting a project from the edit Select calls onUpdate with its id", () => {
    const onUpdate = vi.fn();
    render(
      wrap(
        <TtcEntryRow
          {...baseProps({
            onUpdate,
            projects: [makeProject({ id: 5, title: "Manual" })],
          })}
        />,
      ),
    );

    fireEvent.click(screen.getByTitle("Edit project"));
    fireEvent.click(screen.getByText("Manual"));

    expect(onUpdate).toHaveBeenCalledWith({
      id: 1,
      projectId: 5,
      taskId: null,
      subtaskId: null,
    });
  });

  it("selecting 'No project' clears the project", () => {
    const onUpdate = vi.fn();
    render(
      wrap(
        <TtcEntryRow
          {...baseProps({
            entry: makeEntry({ projectId: 5 }),
            onUpdate,
            projects: [makeProject({ id: 5, title: "Manual" })],
          })}
        />,
      ),
    );

    fireEvent.click(screen.getByTitle("Edit project"));
    fireEvent.click(screen.getAllByText("No project")[0]);

    expect(onUpdate).toHaveBeenCalledWith({
      id: 1,
      projectId: null,
      taskId: null,
      subtaskId: null,
    });
  });

  it("toggles billable on click", () => {
    const onUpdate = vi.fn();
    render(
      wrap(
        <TtcEntryRow
          {...baseProps({ entry: makeEntry({ billable: true }), onUpdate })}
        />,
      ),
    );

    fireEvent.click(screen.getByLabelText("Toggle billable"));
    expect(onUpdate).toHaveBeenCalledWith({ id: 1, billable: false });
  });

  it("wires tag chip add/remove to onUpdate with the recomputed tagIds list", () => {
    const onUpdate = vi.fn();
    render(
      wrap(
        <TtcEntryRow
          {...baseProps({
            entry: makeEntry({ tags: [{ id: 1, name: "Urgent" }] }),
            onUpdate,
          })}
        />,
      ),
    );

    (tagChipsProps.onAdd as (id: number) => void)(2);
    expect(onUpdate).toHaveBeenCalledWith({ id: 1, tagIds: [1, 2] });

    (tagChipsProps.onRemove as (id: number) => void)(1);
    expect(onUpdate).toHaveBeenCalledWith({ id: 1, tagIds: [] });
  });

  it("calls onResume with the entry when the resume button is clicked", () => {
    const onResume = vi.fn();
    const entry = makeEntry();
    render(wrap(<TtcEntryRow {...baseProps({ entry, onResume })} />));

    fireEvent.click(screen.getByLabelText("Resume entry"));
    expect(onResume).toHaveBeenCalledWith(entry);
  });

  it("calls onDelete with the entry id when the delete button is clicked", () => {
    const onDelete = vi.fn();
    render(wrap(<TtcEntryRow {...baseProps({ onDelete })} />));

    fireEvent.click(screen.getByLabelText("Delete entry"));
    expect(onDelete).toHaveBeenCalledWith(1);
  });
});
