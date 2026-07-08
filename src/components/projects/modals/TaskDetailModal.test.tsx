import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryClient } from "@/test/queryClientWrapper";
import type { TaskDetail } from "@/types/tasks.types";

const { gqlFetch, gqlMutate } = vi.hoisted(() => ({
  gqlFetch: vi.fn(),
  gqlMutate: vi.fn(),
}));

vi.mock("@/lib/apollo", () => ({ gqlFetch, gqlMutate }));

import { TaskDetailModal } from "./TaskDetailModal";

function makeTaskDetail(overrides: Partial<TaskDetail> = {}): TaskDetail {
  return {
    id: 4,
    projectId: 1,
    assigneeId: null,
    title: "Translate doc",
    description: "Initial description",
    status: "TODO",
    dueDate: null,
    startDate: null,
    recurring: null,
    reminderOffset: null,
    sortOrder: 0,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    checklistTitles: [],
    subtasks: [],
    comments: [],
    labels: [],
    activities: [],
    attachments: [],
    ...overrides,
  } as TaskDetail;
}

type TimeEntryLike = import("@/types/time-entries.types").TimeEntry;

function setupGqlFetch(
  task: TaskDetail | null,
  overrides: {
    activeTimer?: TimeEntryLike | null;
    timeEntries?: TimeEntryLike[];
  } = {},
) {
  gqlFetch.mockImplementation((query: unknown) => {
    const opName =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (query as any)?.definitions?.[0]?.name?.value ?? String(query);
    switch (opName) {
      case "Task":
        return Promise.resolve({ task });
      case "ActiveTimer":
        return Promise.resolve({ activeTimer: overrides.activeTimer ?? null });
      case "TimeEntries":
        return Promise.resolve({
          timeEntries: {
            items: overrides.timeEntries ?? [],
            nextCursor: null,
            total: (overrides.timeEntries ?? []).length,
          },
        });
      case "Project":
        return Promise.resolve({ project: null });
      case "Projects":
        return Promise.resolve({
          projects: { items: [], nextCursor: null, total: 0 },
        });
      case "Tags":
        return Promise.resolve({ tags: [] });
      default:
        return Promise.resolve({});
    }
  });
}

function renderModal(
  task: TaskDetail | null,
  props: Partial<Parameters<typeof TaskDetailModal>[0]> = {},
  overrides: {
    activeTimer?: TimeEntryLike | null;
    timeEntries?: TimeEntryLike[];
  } = {},
) {
  setupGqlFetch(task, overrides);
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <TaskDetailModal
        taskId={4}
        projectId={1}
        open={true}
        onClose={vi.fn()}
        currentUserId={1}
        {...props}
      />
    </QueryClientProvider>,
  );
}

describe("TaskDetailModal", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("shows a loading skeleton before the task resolves", () => {
    gqlFetch.mockReturnValue(new Promise(() => {}));
    render(
      <QueryClientProvider client={createQueryClient()}>
        <TaskDetailModal
          taskId={4}
          projectId={1}
          open={true}
          onClose={vi.fn()}
          currentUserId={1}
        />
      </QueryClientProvider>,
    );
    expect(screen.getByText("Loading task")).toBeInTheDocument();
  });

  it("renders the task title and description once loaded", async () => {
    renderModal(makeTaskDetail());
    expect(await screen.findByText("Translate doc")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Initial description")).toBeInTheDocument();
  });

  it("edits the title inline and saves on Enter", async () => {
    renderModal(makeTaskDetail({ id: 7 }), { taskId: 7 });
    await screen.findByText("Translate doc");
    gqlMutate.mockResolvedValueOnce({
      updateTask: makeTaskDetail({ id: 7, title: "Renamed" }),
    });

    fireEvent.click(screen.getByText("Translate doc"));
    const input = screen.getByDisplayValue("Translate doc");
    fireEvent.change(input, { target: { value: "Renamed" } });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() =>
      expect(gqlMutate.mock.calls[0][1]).toMatchObject({
        input: { id: 7, title: "Renamed" },
      }),
    );
  });

  it("updates the description on blur when it changed", async () => {
    renderModal(makeTaskDetail({ id: 5 }), { taskId: 5 });
    await screen.findByText("Translate doc");
    gqlMutate.mockResolvedValueOnce({ updateTask: makeTaskDetail({ id: 5 }) });

    const textarea = screen.getByDisplayValue("Initial description");
    fireEvent.change(textarea, { target: { value: "Updated description" } });
    fireEvent.blur(textarea);

    await waitFor(() =>
      expect(gqlMutate.mock.calls[0][1]).toMatchObject({
        input: { id: 5, description: "Updated description" },
      }),
    );
  });

  it("does not call updateTask when the description is blurred unchanged", async () => {
    renderModal(makeTaskDetail());
    await screen.findByText("Translate doc");

    const textarea = screen.getByDisplayValue("Initial description");
    fireEvent.blur(textarea);

    expect(gqlMutate).not.toHaveBeenCalled();
  });

  it("calls onClose when the close button is clicked", async () => {
    const onClose = vi.fn();
    renderModal(makeTaskDetail(), { onClose });
    await screen.findByText("Translate doc");

    fireEvent.click(screen.getByText("✕"));
    expect(onClose).toHaveBeenCalled();
  });

  it("shows checklist section when the task already has subtasks", async () => {
    renderModal(
      makeTaskDetail({
        subtasks: [
          {
            id: 1,
            taskId: 4,
            checklistTitle: "Setup",
            title: "Step 1",
            done: false,
            dueDate: null,
            createdAt: "",
            updatedAt: "",
          },
        ],
      }),
    );
    expect(await screen.findByText("Step 1")).toBeInTheDocument();
  });

  it("pressing Escape on the title input cancels editing without saving", async () => {
    renderModal(makeTaskDetail({ id: 4, title: "Translate doc" }));
    await screen.findByText("Translate doc");

    fireEvent.click(screen.getByText("Translate doc"));
    const input = screen.getByDisplayValue("Translate doc");
    fireEvent.keyDown(input, { key: "Escape" });

    expect(screen.queryByDisplayValue("Translate doc")).not.toBeInTheDocument();
    expect(screen.getByText("Translate doc")).toBeInTheDocument();
    expect(gqlMutate).not.toHaveBeenCalled();
  });

  it("blurring the title input saves when the value changed", async () => {
    renderModal(makeTaskDetail({ id: 9, title: "Translate doc" }), {
      taskId: 9,
    });
    await screen.findByText("Translate doc");
    gqlMutate.mockResolvedValueOnce({
      updateTask: makeTaskDetail({ id: 9, title: "New title" }),
    });

    fireEvent.click(screen.getByText("Translate doc"));
    const input = screen.getByDisplayValue("Translate doc");
    fireEvent.change(input, { target: { value: "New title" } });
    fireEvent.blur(input);

    await waitFor(() =>
      expect(gqlMutate.mock.calls[0][1]).toMatchObject({
        input: { id: 9, title: "New title" },
      }),
    );
  });

  it("does not call updateTask when the title value is empty", async () => {
    renderModal(makeTaskDetail());
    await screen.findByText("Translate doc");

    fireEvent.click(screen.getByText("Translate doc"));
    const input = screen.getByDisplayValue("Translate doc");
    fireEvent.change(input, { target: { value: "" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(gqlMutate).not.toHaveBeenCalled();
  });

  it("New checklist button opens the checklist section in adding mode", async () => {
    renderModal(makeTaskDetail());
    await screen.findByText("Translate doc");

    fireEvent.click(screen.getByText("+ New checklist"));

    expect(screen.getByPlaceholderText("Checklist title…")).toBeInTheDocument();
  });

  describe("+ Add dropdown opens targets synchronously (no click-forwarding timer)", () => {
    function clickViaPointer(el: Element) {
      fireEvent.pointerDown(el, {
        button: 0,
        pointerId: 1,
        pointerType: "mouse",
      });
      fireEvent.pointerUp(el, {
        button: 0,
        pointerId: 1,
        pointerType: "mouse",
      });
      fireEvent.click(el);
    }

    it("Checklist item opens the checklist section immediately", async () => {
      renderModal(makeTaskDetail());
      await screen.findByText("Translate doc");

      clickViaPointer(screen.getByText("+ Add"));
      clickViaPointer(screen.getByText("Checklist"));

      expect(
        screen.getByPlaceholderText("Checklist title…"),
      ).toBeInTheDocument();
    });

    it("Label item opens the label popover immediately", async () => {
      renderModal(makeTaskDetail());
      await screen.findByText("Translate doc");

      clickViaPointer(screen.getByText("+ Add"));
      clickViaPointer(screen.getByText("Label"));

      expect(screen.getByPlaceholderText("Label name…")).toBeInTheDocument();
    });

    it("Date item opens the date popover immediately", async () => {
      renderModal(makeTaskDetail());
      await screen.findByText("Translate doc");

      clickViaPointer(screen.getByText("+ Add"));
      clickViaPointer(screen.getByText("Date"));

      expect(screen.getByText("Recurring")).toBeInTheDocument();
    });

    it("Attachment item opens the attachment modal immediately", async () => {
      renderModal(makeTaskDetail());
      await screen.findByText("Translate doc");

      clickViaPointer(screen.getByText("+ Add"));
      clickViaPointer(screen.getByText("Attachment"));

      expect(screen.getByText("Add attachment")).toBeInTheDocument();
    });
  });

  it("shows a 'Time' toggle that reveals 'No time logged yet.' when opened", async () => {
    renderModal(makeTaskDetail());
    await screen.findByText("Translate doc");

    expect(screen.queryByText("No time logged yet.")).not.toBeInTheDocument();
    fireEvent.click(screen.getByText("show ▼"));

    expect(await screen.findByText("No time logged yet.")).toBeInTheDocument();
    fireEvent.click(screen.getByText("hide ▲"));
    expect(screen.queryByText("No time logged yet.")).not.toBeInTheDocument();
  });

  it("clicking Start timer calls startTimer with a description derived from the task", async () => {
    gqlMutate.mockResolvedValueOnce({
      startTimer: {
        id: 1,
        userId: 1,
        projectId: 1,
        taskId: 4,
        description: "Task Translate doc of project Website copy",
        startTime: "2026-01-01T00:00:00.000Z",
        endTime: null,
        durationSeconds: null,
        billable: true,
        clockifyEntryId: null,
        tags: [],
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    });
    renderModal(makeTaskDetail());
    await screen.findByText("Translate doc");

    fireEvent.click(screen.getByText("▶ Start timer"));

    await waitFor(() =>
      expect(gqlMutate.mock.calls[0][1]).toMatchObject({
        input: expect.objectContaining({ taskId: 4, projectId: 1 }),
      }),
    );
  });

  it("shows the running timer and stops it on click", async () => {
    gqlMutate.mockResolvedValueOnce({
      stopTimer: {
        id: 1,
        userId: 1,
        projectId: 1,
        taskId: 4,
        description: "work",
        startTime: "2026-01-01T00:00:00.000Z",
        endTime: "2026-01-01T01:00:00.000Z",
        durationSeconds: 3600,
        billable: true,
        clockifyEntryId: null,
        tags: [],
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    });
    renderModal(
      makeTaskDetail(),
      {},
      {
        activeTimer: {
          id: 1,
          userId: 1,
          projectId: 1,
          taskId: 4,
          description: "work",
          startTime: "2026-01-01T00:00:00.000Z",
          endTime: null,
          durationSeconds: null,
          billable: true,
          clockifyEntryId: null,
          tags: [],
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
      },
    );
    await screen.findByText("Translate doc");

    const stopButton = await screen.findByRole("button", { name: /Stop/ });
    fireEvent.click(stopButton);

    await waitFor(() => expect(gqlMutate).toHaveBeenCalled());
  });

  it("shows entry count in the Time label and renders entries once toggled open", async () => {
    renderModal(
      makeTaskDetail(),
      {},
      {
        timeEntries: [
          {
            id: 1,
            userId: 1,
            projectId: 1,
            taskId: 4,
            description: "Translated pages",
            startTime: "2026-01-01T00:00:00.000Z",
            endTime: "2026-01-01T01:00:00.000Z",
            durationSeconds: 3600,
            billable: true,
            clockifyEntryId: null,
            tags: [],
            createdAt: "2026-01-01T00:00:00.000Z",
            updatedAt: "2026-01-01T00:00:00.000Z",
          },
        ],
      },
    );
    await screen.findByText("Translate doc");

    expect(await screen.findByText("Time (1)")).toBeInTheDocument();
    fireEvent.click(screen.getByText("show ▼"));

    expect(await screen.findByText("Translated pages")).toBeInTheDocument();
  });

  describe("attachment list", () => {
    let fetchMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      fetchMock = vi.fn();
      vi.stubGlobal("fetch", fetchMock);
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    function makeAttachment(
      overrides: Partial<import("@/types/tasks.types").TaskAttachment> = {},
    ): import("@/types/tasks.types").TaskAttachment {
      return {
        id: 1,
        taskId: 4,
        type: "URL",
        fileName: null,
        url: "https://example.com",
        displayText: "Spec doc",
        createdAt: "2026-01-01T00:00:00.000Z",
        ...overrides,
      };
    }

    it("renders FILE attachment with 📎 emoji and filename", async () => {
      renderModal(
        makeTaskDetail({
          attachments: [
            makeAttachment({
              id: 1,
              type: "FILE",
              fileName: "report.pdf",
              url: "/files/report.pdf",
              displayText: null,
            }),
          ],
        }),
      );
      await screen.findByText("Translate doc");

      expect(screen.getByText("📎")).toBeInTheDocument();
      expect(screen.getByText("report.pdf")).toBeInTheDocument();
    });

    it("renders URL attachment with 🔗 emoji and display text", async () => {
      renderModal(
        makeTaskDetail({
          attachments: [
            makeAttachment({ id: 2, type: "URL", displayText: "Spec doc" }),
          ],
        }),
      );
      await screen.findByText("Translate doc");

      expect(screen.getByText("🔗")).toBeInTheDocument();
      expect(screen.getByText("Spec doc")).toBeInTheDocument();
    });

    it("shows edit button on URL attachments but not on FILE attachments", async () => {
      renderModal(
        makeTaskDetail({
          attachments: [
            makeAttachment({
              id: 1,
              type: "FILE",
              fileName: "doc.pdf",
              url: "/files/doc.pdf",
              displayText: null,
            }),
            makeAttachment({
              id: 2,
              type: "URL",
              url: "https://example.com",
              displayText: "Spec",
            }),
          ],
        }),
      );
      await screen.findByText("Translate doc");

      const editBtns = screen.queryAllByTitle("Edit");
      expect(editBtns).toHaveLength(1);
    });

    it("clicking the edit button shows the inline edit form", async () => {
      renderModal(
        makeTaskDetail({
          attachments: [
            makeAttachment({
              id: 2,
              type: "URL",
              url: "https://example.com",
              displayText: "Spec",
            }),
          ],
        }),
      );
      await screen.findByText("Translate doc");

      fireEvent.click(screen.getByTitle("Edit"));

      expect(screen.getByPlaceholderText("URL")).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("Display text (optional)"),
      ).toBeInTheDocument();
    });

    it("Cancel in inline edit hides the form and restores the attachment view", async () => {
      renderModal(
        makeTaskDetail({
          attachments: [
            makeAttachment({
              id: 2,
              type: "URL",
              url: "https://example.com",
              displayText: "Spec",
            }),
          ],
        }),
      );
      await screen.findByText("Translate doc");

      fireEvent.click(screen.getByTitle("Edit"));
      fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

      expect(screen.queryByPlaceholderText("URL")).not.toBeInTheDocument();
      expect(screen.getByText("Spec")).toBeInTheDocument();
    });

    it("saving inline edit calls PATCH on the attachment", async () => {
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({}), { status: 200 }),
      );
      renderModal(
        makeTaskDetail({
          attachments: [
            makeAttachment({
              id: 3,
              type: "URL",
              url: "https://old.com",
              displayText: "Old",
            }),
          ],
        }),
      );
      await screen.findByText("Translate doc");

      fireEvent.click(screen.getByTitle("Edit"));
      fireEvent.change(screen.getByPlaceholderText("URL"), {
        target: { value: "https://new.com" },
      });
      fireEvent.click(screen.getByRole("button", { name: "Save" }));

      await waitFor(() => {
        expect(fetchMock).toHaveBeenCalledWith(
          expect.stringContaining("/attachments/3"),
          expect.objectContaining({ method: "PATCH" }),
        );
      });
    });

    it("Save is disabled in inline edit when the URL is cleared", async () => {
      renderModal(
        makeTaskDetail({
          attachments: [
            makeAttachment({ id: 3, type: "URL", url: "https://old.com" }),
          ],
        }),
      );
      await screen.findByText("Translate doc");

      fireEvent.click(screen.getByTitle("Edit"));
      fireEvent.change(screen.getByPlaceholderText("URL"), {
        target: { value: "" },
      });

      expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
    });

    it("deletes an attachment after confirming in the alert dialog", async () => {
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({}), { status: 200 }),
      );
      renderModal(
        makeTaskDetail({
          attachments: [
            makeAttachment({ id: 3, type: "URL", displayText: "Spec doc" }),
          ],
        }),
      );
      await screen.findByText("Translate doc");

      fireEvent.click(screen.getByTitle("Delete"));
      fireEvent.click(screen.getByRole("button", { name: "Delete" }));

      await waitFor(() => {
        expect(fetchMock).toHaveBeenCalledWith(
          expect.stringContaining("/attachments/3"),
          expect.objectContaining({ method: "DELETE" }),
        );
      });
    });

    it("renders a URL-type attachment link pointing straight at an already-absolute URL", async () => {
      renderModal(
        makeTaskDetail({
          attachments: [
            makeAttachment({
              id: 4,
              type: "URL",
              url: "https://example.com/doc",
              displayText: "External doc",
            }),
          ],
        }),
      );
      await screen.findByText("Translate doc");

      expect(
        screen.getByRole("link", { name: "External doc" }),
      ).toHaveAttribute("href", "https://example.com/doc");
    });

    it("prefixes a bare host with https:// for a URL-type attachment", async () => {
      renderModal(
        makeTaskDetail({
          attachments: [
            makeAttachment({
              id: 5,
              type: "URL",
              url: "example.com/doc",
              displayText: "Bare host doc",
            }),
          ],
        }),
      );
      await screen.findByText("Translate doc");

      expect(
        screen.getByRole("link", { name: "Bare host doc" }),
      ).toHaveAttribute("href", "https://example.com/doc");
    });

    it("shows the raw url as the label when a URL attachment has no displayText", async () => {
      renderModal(
        makeTaskDetail({
          attachments: [
            makeAttachment({
              id: 6,
              type: "URL",
              url: "https://example.com/plain",
              displayText: null,
            }),
          ],
        }),
      );
      await screen.findByText("Translate doc");

      expect(
        screen.getByRole("link", { name: "https://example.com/plain" }),
      ).toBeInTheDocument();
    });

    it("clicking '+ Add' in the attachments section opens the attachment modal", async () => {
      renderModal(
        makeTaskDetail({
          attachments: [makeAttachment({ id: 1 })],
        }),
      );
      await screen.findByText("Translate doc");

      const addButtons = screen.getAllByText("+ Add");
      fireEvent.click(addButtons[addButtons.length - 1]);

      expect(screen.getByText("Add attachment")).toBeInTheDocument();
    });
  });
});
