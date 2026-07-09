import { fireEvent, render, screen } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactElement } from "react";
import { createQueryClient } from "@/test/queryClientWrapper";

let tagChipsProps: Record<string, unknown> = {};
vi.mock("../tags/TtcTagChips", () => ({
  TtcTagChips: (props: Record<string, unknown>) => {
    tagChipsProps = props;
    return <div data-testid="tag-chips" />;
  },
}));

const { gqlFetch } = vi.hoisted(() => ({ gqlFetch: vi.fn() }));
vi.mock("@/lib/apollo", () => ({ gqlFetch, gqlMutate: vi.fn() }));

import type { TimeEntry } from "@/types/time-entries.types";
import type { Project } from "@/types/projects.types";
import { TtcEntryRow } from "./TtcEntryRow";

function formatLocalHHmmss(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

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
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlFetch.mockImplementation(
      (_query: unknown, vars: Record<string, unknown>) => {
        if ("projectId" in vars) {
          return Promise.resolve({
            tasks: {
              items: [{ id: 9, title: "Draft chapter" }],
              nextCursor: null,
              total: 1,
            },
          });
        }
        return Promise.resolve({
          task: {
            id: vars.id,
            subtasks: [
              { id: 21, title: "Proofread", checklistTitle: null },
              { id: 22, title: "Format", checklistTitle: "Wrap-up" },
            ],
          },
        });
      },
    );
  });

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

  it("renders start/end/duration inline by default (no Start/End/Duration labels)", () => {
    render(wrap(<TtcEntryRow {...baseProps()} />));

    expect(screen.queryByText("Start")).not.toBeInTheDocument();
    expect(screen.queryByText("End")).not.toBeInTheDocument();
    expect(screen.queryByText("Duration")).not.toBeInTheDocument();
  });

  it("stacks start/end/duration on 3 labeled lines when stackedTime is set", () => {
    render(wrap(<TtcEntryRow {...baseProps({ stackedTime: true })} />));

    expect(screen.getByText("Start")).toBeInTheDocument();
    expect(screen.getByText("End")).toBeInTheDocument();
    expect(screen.getByText("Duration")).toBeInTheDocument();
    expect(screen.getByTitle("Click to edit start time")).toBeInTheDocument();
    expect(screen.getByTitle("Click to edit end time")).toBeInTheDocument();
    expect(screen.getByText("01:00:00")).toBeInTheDocument();
  });

  it("shows the start/end time (with seconds) and duration", () => {
    const entry = makeEntry();
    render(wrap(<TtcEntryRow {...baseProps({ entry })} />));

    expect(screen.getByTitle("Click to edit start time")).toHaveTextContent(
      formatLocalHHmmss(entry.startTime),
    );
    expect(screen.getByTitle("Click to edit end time")).toHaveTextContent(
      formatLocalHHmmss(entry.endTime!),
    );
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

  it("clicking the start time enters edit mode and commits a new startTime on Enter", () => {
    const onUpdate = vi.fn();
    render(wrap(<TtcEntryRow {...baseProps({ onUpdate })} />));

    fireEvent.click(screen.getByTitle("Click to edit start time"));
    const input = screen.getByDisplayValue(/\d{2}:\d{2}/);
    fireEvent.change(input, { target: { value: "07:00" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onUpdate).toHaveBeenCalledTimes(1);
    const call = onUpdate.mock.calls[0][0] as { id: number; startTime: string };
    expect(call.id).toBe(1);
    expect(new Date(call.startTime).getHours()).toBe(7);
    expect(new Date(call.startTime).getMinutes()).toBe(0);
  });

  it("clicking the end time enters edit mode and commits a new endTime on Enter", () => {
    const onUpdate = vi.fn();
    render(wrap(<TtcEntryRow {...baseProps({ onUpdate })} />));

    fireEvent.click(screen.getByTitle("Click to edit end time"));
    const input = screen.getByDisplayValue(/\d{2}:\d{2}/);
    fireEvent.change(input, { target: { value: "14:00" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onUpdate).toHaveBeenCalledTimes(1);
    const call = onUpdate.mock.calls[0][0] as { id: number; endTime: string };
    expect(call.id).toBe(1);
    expect(new Date(call.endTime).getHours()).toBe(14);
  });

  it("commits a startTime edit that only changes the seconds", () => {
    const onUpdate = vi.fn();
    render(wrap(<TtcEntryRow {...baseProps({ onUpdate })} />));

    fireEvent.click(screen.getByTitle("Click to edit start time"));
    const input = screen.getByDisplayValue(/\d{2}:\d{2}:\d{2}/);
    const hhmm = formatLocalHHmmss(makeEntry().startTime).slice(0, 5);
    fireEvent.change(input, { target: { value: `${hhmm}:45` } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onUpdate).toHaveBeenCalledTimes(1);
    const call = onUpdate.mock.calls[0][0] as { id: number; startTime: string };
    expect(new Date(call.startTime).getSeconds()).toBe(45);
  });

  it("rejects a start time that would land after the current end time", () => {
    const onUpdate = vi.fn();
    render(wrap(<TtcEntryRow {...baseProps({ onUpdate })} />));

    fireEvent.click(screen.getByTitle("Click to edit start time"));
    const input = screen.getByDisplayValue(/\d{2}:\d{2}/);
    fireEvent.change(input, { target: { value: "23:00" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onUpdate).not.toHaveBeenCalled();
  });

  it("does not render an editable end time while the entry is running", () => {
    render(
      wrap(
        <TtcEntryRow {...baseProps({ entry: makeEntry({ endTime: null }) })} />,
      ),
    );
    expect(
      screen.queryByTitle("Click to edit end time"),
    ).not.toBeInTheDocument();
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

  it("does not show a task/subtask control when the entry has no project", () => {
    render(
      wrap(
        <TtcEntryRow
          {...baseProps({ entry: makeEntry({ projectId: null }) })}
        />,
      ),
    );
    expect(screen.queryByText("No task")).not.toBeInTheDocument();
  });

  it("shows the linked task as a badge, and clicking it opens the task picker", async () => {
    render(
      wrap(
        <TtcEntryRow
          {...baseProps({
            entry: makeEntry({
              projectId: 1,
              taskId: 9,
              task: { id: 9, title: "Draft chapter" },
            }),
            projects: [makeProject({ id: 1, title: "Website copy" })],
          })}
        />,
      ),
    );

    expect(screen.getByTitle("Edit task")).toHaveTextContent("Draft chapter");
    fireEvent.click(screen.getByTitle("Edit task"));
    await screen.findByText("No task");
  });

  it("linking a task with no description auto-fills 'Task X of project Y'", async () => {
    const onUpdate = vi.fn();
    render(
      wrap(
        <TtcEntryRow
          {...baseProps({
            entry: makeEntry({ projectId: 1, description: null }),
            projects: [makeProject({ id: 1, title: "Website copy" })],
            onUpdate,
          })}
        />,
      ),
    );

    fireEvent.click(screen.getByTitle("Link task"));
    fireEvent.click(await screen.findByText("Draft chapter"));

    expect(onUpdate).toHaveBeenCalledWith({
      id: 1,
      taskId: 9,
      description: "Task Draft chapter of project Website copy",
    });
  });

  it("linking a task leaves an existing description untouched", async () => {
    const onUpdate = vi.fn();
    render(
      wrap(
        <TtcEntryRow
          {...baseProps({
            entry: makeEntry({ projectId: 1, description: "Already set" }),
            projects: [makeProject({ id: 1, title: "Website copy" })],
            onUpdate,
          })}
        />,
      ),
    );

    fireEvent.click(screen.getByTitle("Link task"));
    fireEvent.click(await screen.findByText("Draft chapter"));

    expect(onUpdate).toHaveBeenCalledWith({ id: 1, taskId: 9 });
  });

  it("clearing the task via 'No task' in the picker clears task and subtask", async () => {
    const onUpdate = vi.fn();
    render(
      wrap(
        <TtcEntryRow
          {...baseProps({
            entry: makeEntry({
              projectId: 1,
              taskId: 9,
              task: { id: 9, title: "Draft chapter" },
            }),
            projects: [makeProject({ id: 1, title: "Website copy" })],
            onUpdate,
          })}
        />,
      ),
    );

    fireEvent.click(screen.getByTitle("Edit task"));
    const options = await screen.findAllByText("No task");
    fireEvent.click(options[options.length - 1]);

    expect(onUpdate).toHaveBeenCalledWith({
      id: 1,
      taskId: null,
      subtaskId: null,
    });
  });

  it("does not show a subtask control until a task is linked", () => {
    render(
      wrap(
        <TtcEntryRow
          {...baseProps({ entry: makeEntry({ projectId: 1, taskId: null }) })}
        />,
      ),
    );
    expect(screen.queryByText("No subtask")).not.toBeInTheDocument();
  });

  it("shows the linked subtask as a badge with checklist title, and opens the picker on click", () => {
    render(
      wrap(
        <TtcEntryRow
          {...baseProps({
            entry: makeEntry({
              projectId: 1,
              taskId: 9,
              task: { id: 9, title: "Draft chapter" },
              subtaskId: 22,
              subtask: { id: 22, title: "Format", checklistTitle: "Wrap-up" },
            }),
          })}
        />,
      ),
    );

    expect(screen.getByTitle("Edit subtask")).toHaveTextContent(
      "Wrap-up › Format",
    );
    fireEvent.click(screen.getByTitle("Edit subtask"));
    expect(screen.getByText("No subtask")).toBeInTheDocument();
  });

  it("shows the linked subtask badge without a checklist prefix when unset", () => {
    render(
      wrap(
        <TtcEntryRow
          {...baseProps({
            entry: makeEntry({
              projectId: 1,
              taskId: 9,
              task: { id: 9, title: "Draft chapter" },
              subtaskId: 21,
              subtask: { id: 21, title: "Proofread", checklistTitle: null },
            }),
          })}
        />,
      ),
    );
    expect(screen.getByTitle("Edit subtask")).toHaveTextContent("Proofread");
  });

  it("linking a subtask with no description auto-fills 'Task X › Y of project Z'", async () => {
    const onUpdate = vi.fn();
    render(
      wrap(
        <TtcEntryRow
          {...baseProps({
            entry: makeEntry({
              projectId: 1,
              taskId: 9,
              task: { id: 9, title: "Draft chapter" },
              description: null,
            }),
            projects: [makeProject({ id: 1, title: "Website copy" })],
            onUpdate,
          })}
        />,
      ),
    );

    fireEvent.click(screen.getByTitle("Link subtask"));
    fireEvent.click(await screen.findByText("Wrap-up › Format"));

    expect(onUpdate).toHaveBeenCalledWith({
      id: 1,
      subtaskId: 22,
      description: "Task Draft chapter › Format of project Website copy",
    });
  });

  it("linking a subtask leaves an existing description untouched", async () => {
    const onUpdate = vi.fn();
    render(
      wrap(
        <TtcEntryRow
          {...baseProps({
            entry: makeEntry({
              projectId: 1,
              taskId: 9,
              task: { id: 9, title: "Draft chapter" },
              description: "Already set",
            }),
            onUpdate,
          })}
        />,
      ),
    );

    fireEvent.click(screen.getByTitle("Link subtask"));
    fireEvent.click(await screen.findByText("Proofread"));

    expect(onUpdate).toHaveBeenCalledWith({ id: 1, subtaskId: 21 });
  });

  it("clearing the subtask via 'No subtask' in the picker clears just the subtask", async () => {
    const onUpdate = vi.fn();
    render(
      wrap(
        <TtcEntryRow
          {...baseProps({
            entry: makeEntry({
              projectId: 1,
              taskId: 9,
              task: { id: 9, title: "Draft chapter" },
              subtaskId: 21,
              subtask: { id: 21, title: "Proofread", checklistTitle: null },
            }),
            onUpdate,
          })}
        />,
      ),
    );

    fireEvent.click(screen.getByTitle("Edit subtask"));
    const options = await screen.findAllByText("No subtask");
    fireEvent.click(options[options.length - 1]);

    expect(onUpdate).toHaveBeenCalledWith({ id: 1, subtaskId: null });
  });
});
