import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryWrapper } from "@/test/queryClientWrapper";
import { messages } from "@/i18n/messages";
import { TASKS_QUERY, TASK_QUERY } from "@/graphql/tasks.operations";

const { gqlFetch } = vi.hoisted(() => ({ gqlFetch: vi.fn() }));
vi.mock("@/lib/apollo", () => ({ gqlFetch }));

import { TaskPicker } from "./TaskPicker";

function wrapper({ children }: { children: ReactNode }) {
  const QueryWrapper = createQueryWrapper();
  return (
    <IntlProvider locale="en" messages={messages.en}>
      <QueryWrapper>{children}</QueryWrapper>
    </IntlProvider>
  );
}

const chapter = { id: 900, title: "Chapter 12" };

beforeEach(() => {
  gqlFetch.mockReset();
  gqlFetch.mockImplementation(
    (query: unknown, vars: { search?: string; id?: number }) => {
      if (query === TASK_QUERY)
        return Promise.resolve({
          task: vars.id === chapter.id ? chapter : null,
        });
      if (query === TASKS_QUERY) {
        const items = vars.search ? [chapter] : [{ id: 1, title: "Glossary" }];
        return Promise.resolve({
          tasks: { items, nextCursor: null, total: items.length },
        });
      }
      throw new Error("unexpected query");
    },
  );
});

describe("TaskPicker", () => {
  it("shows the linked task's title", async () => {
    render(
      <TaskPicker
        projectId={5}
        value="900"
        onChange={vi.fn()}
        placeholder="No task"
      />,
      { wrapper },
    );
    await waitFor(() =>
      expect(screen.getByRole("combobox")).toHaveTextContent("Chapter 12"),
    );
  });

  it("searches the project's tasks on the server and lets you pick one", async () => {
    const onChange = vi.fn();
    render(
      <TaskPicker
        projectId={5}
        value=""
        onChange={onChange}
        placeholder="No task"
        defaultOpen
      />,
      { wrapper },
    );
    expect(
      await screen.findByRole("option", { name: "Glossary" }),
    ).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText("Search…"), {
      target: { value: "chapter" },
    });
    fireEvent.click(await screen.findByRole("option", { name: "Chapter 12" }));

    expect(gqlFetch).toHaveBeenCalledWith(TASKS_QUERY, {
      projectId: 5,
      search: "chapter",
      pagination: { limit: 50 },
    });
    expect(onChange).toHaveBeenCalledWith("900", "Chapter 12");
  });

  it("reports closing to the caller", () => {
    const onOpenChange = vi.fn();
    render(
      <TaskPicker
        projectId={5}
        value=""
        onChange={vi.fn()}
        placeholder="No task"
        defaultOpen
        onOpenChange={onOpenChange}
      />,
      { wrapper },
    );
    fireEvent.keyDown(screen.getByPlaceholderText("Search…"), {
      key: "Escape",
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
