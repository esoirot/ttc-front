import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryClient } from "@/test/queryClientWrapper";
import type { TaskLabel } from "@/types/tasks.types";

const { gqlFetch, gqlMutate } = vi.hoisted(() => ({
  gqlFetch: vi.fn(),
  gqlMutate: vi.fn(),
}));

vi.mock("@/lib/apollo", () => ({ gqlFetch, gqlMutate }));

import { TaskLabelBadges } from "./TaskLabelBadges";

function makeLabel(overrides: Partial<TaskLabel> = {}): TaskLabel {
  return {
    id: 1,
    taskId: 4,
    name: "Urgent",
    color: "#f00",
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function renderBadges(labels: TaskLabel[]) {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <TaskLabelBadges taskId={4} labels={labels} />
    </QueryClientProvider>,
  );
}

describe("TaskLabelBadges", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("renders nothing when there are no labels", () => {
    const { container } = renderBadges([]);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders each label's name", () => {
    renderBadges([
      makeLabel({ name: "Urgent" }),
      makeLabel({ id: 2, name: "Review" }),
    ]);
    expect(screen.getByText("Urgent")).toBeInTheDocument();
    expect(screen.getByText("Review")).toBeInTheDocument();
  });

  it("deletes the label when its remove button is clicked", async () => {
    gqlMutate.mockResolvedValueOnce({ deleteTaskLabel: true });
    renderBadges([makeLabel({ id: 9 })]);

    fireEvent.click(screen.getByText("✕"));

    await waitFor(() =>
      expect(gqlMutate).toHaveBeenCalledWith(expect.anything(), { id: 9 }),
    );
  });
});
