import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryClient } from "@/test/queryClientWrapper";
import type { TaskComment } from "@/types/tasks.types";

const { gqlFetch, gqlMutate } = vi.hoisted(() => ({
  gqlFetch: vi.fn(),
  gqlMutate: vi.fn(),
}));

vi.mock("@/lib/apollo", () => ({ gqlFetch, gqlMutate }));

import { TaskCommentList } from "./TaskCommentList";

function makeComment(overrides: Partial<TaskComment> = {}): TaskComment {
  return {
    id: 1,
    taskId: 4,
    authorId: 1,
    body: "Looks good",
    createdAt: "2026-06-17T11:00:00.000Z",
    updatedAt: "2026-06-17T11:00:00.000Z",
    ...overrides,
  };
}

function renderList(
  props: Partial<Parameters<typeof TaskCommentList>[0]> = {},
) {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <TaskCommentList taskId={4} comments={[]} currentUserId={1} {...props} />
    </QueryClientProvider>,
  );
}

describe("TaskCommentList", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("renders each comment's author label and body", () => {
    renderList({ comments: [makeComment({ authorId: 7, body: "Nice work" })] });
    expect(screen.getByText("User 7")).toBeInTheDocument();
    expect(screen.getByText("Nice work")).toBeInTheDocument();
  });

  it("only shows Edit/Delete controls for the current user's own comments", () => {
    renderList({
      comments: [
        makeComment({ id: 1, authorId: 1 }),
        makeComment({ id: 2, authorId: 9 }),
      ],
      currentUserId: 1,
    });
    expect(screen.getAllByText("Edit")).toHaveLength(1);
  });

  it("does not submit a blank comment", async () => {
    renderList();
    fireEvent.click(screen.getByText("Comment"));
    expect(gqlMutate).not.toHaveBeenCalled();
  });

  it("submits a new comment and clears the input", async () => {
    gqlMutate.mockResolvedValueOnce({
      createTaskComment: makeComment({ id: 9 }),
    });
    renderList();

    fireEvent.change(screen.getByPlaceholderText("Write a comment…"), {
      target: { value: "New comment" },
    });
    fireEvent.click(screen.getByText("Comment"));

    await waitFor(() =>
      expect(gqlMutate.mock.calls[0][1]).toMatchObject({
        input: { taskId: 4, body: "New comment" },
      }),
    );
    await waitFor(() =>
      expect(screen.getByPlaceholderText("Write a comment…")).toHaveValue(""),
    );
  });

  it("edits a comment in place and saves", async () => {
    gqlMutate.mockResolvedValueOnce({
      updateTaskComment: makeComment({ id: 1, body: "Edited" }),
    });
    renderList({
      comments: [makeComment({ id: 1, authorId: 1, body: "Original" })],
    });

    fireEvent.click(screen.getByText("Edit"));
    const textarea = screen.getAllByRole("textbox")[0];
    fireEvent.change(textarea, { target: { value: "Edited" } });
    fireEvent.click(screen.getByText("Save"));

    await waitFor(() =>
      expect(gqlMutate.mock.calls[0][1]).toMatchObject({
        input: { id: 1, body: "Edited" },
      }),
    );
  });

  it("deletes a comment", async () => {
    gqlMutate.mockResolvedValueOnce({ deleteTaskComment: true });
    renderList({ comments: [makeComment({ id: 3, authorId: 1 })] });

    fireEvent.click(screen.getByText("Delete"));

    await waitFor(() =>
      expect(gqlMutate).toHaveBeenCalledWith(expect.anything(), { id: 3 }),
    );
  });
});
