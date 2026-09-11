import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { IntlProvider } from "react-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryClient } from "@/test/queryClientWrapper";
import { messages } from "@/i18n/messages";
import type { Locale } from "@/i18n/useLocale";

const { gqlFetch, gqlMutate } = vi.hoisted(() => ({
  gqlFetch: vi.fn(),
  gqlMutate: vi.fn(),
}));

vi.mock("@/lib/apollo", () => ({ gqlFetch, gqlMutate }));

import { TaskLabelPicker } from "./TaskLabelPicker";

function renderPicker(locale: Locale = "en") {
  return render(
    <IntlProvider locale={locale} messages={messages[locale]}>
      <QueryClientProvider client={createQueryClient()}>
        <TaskLabelPicker taskId={4} />
      </QueryClientProvider>
    </IntlProvider>,
  );
}

describe("TaskLabelPicker", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("opens the popover and creates a label with the selected color", async () => {
    gqlMutate.mockResolvedValueOnce({
      createTaskLabel: {
        id: 1,
        taskId: 4,
        name: "Urgent",
        color: "#3B82F6",
        createdAt: "",
      },
    });

    renderPicker();
    fireEvent.click(screen.getByText("+ Add label"));

    fireEvent.change(screen.getByPlaceholderText("Label name…"), {
      target: { value: "Urgent" },
    });
    fireEvent.click(screen.getByText("Add"));

    await waitFor(() =>
      expect(gqlMutate.mock.calls[0][1]).toMatchObject({
        input: { taskId: 4, name: "Urgent" },
      }),
    );
  });

  it("disables Add when the name is blank", () => {
    renderPicker();
    fireEvent.click(screen.getByText("+ Add label"));
    expect(screen.getByText("Add")).toBeDisabled();
  });

  it("submits on Enter in the name input", async () => {
    gqlMutate.mockResolvedValueOnce({
      createTaskLabel: {
        id: 1,
        taskId: 4,
        name: "Quick",
        color: "#3B82F6",
        createdAt: "",
      },
    });

    renderPicker();
    fireEvent.click(screen.getByText("+ Add label"));
    const input = screen.getByPlaceholderText("Label name…");
    fireEvent.change(input, { target: { value: "Quick" } });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => expect(gqlMutate).toHaveBeenCalled());
  });

  it("renders open when the open prop is true, without needing a click", () => {
    render(
      <IntlProvider locale="en" messages={messages.en}>
        <QueryClientProvider client={createQueryClient()}>
          <TaskLabelPicker taskId={4} open onOpenChange={vi.fn()} />
        </QueryClientProvider>
      </IntlProvider>,
    );
    expect(screen.getByPlaceholderText("Label name…")).toBeInTheDocument();
  });

  it("calls onOpenChange instead of managing state internally when controlled", () => {
    const onOpenChange = vi.fn();
    render(
      <IntlProvider locale="en" messages={messages.en}>
        <QueryClientProvider client={createQueryClient()}>
          <TaskLabelPicker
            taskId={4}
            open={false}
            onOpenChange={onOpenChange}
          />
        </QueryClientProvider>
      </IntlProvider>,
    );
    fireEvent.click(screen.getByText("+ Add label"));
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(
      screen.queryByPlaceholderText("Label name…"),
    ).not.toBeInTheDocument();
  });

  it("renders French copy when locale is fr", () => {
    renderPicker("fr");
    fireEvent.click(screen.getByText("+ Ajouter une étiquette"));
    expect(
      screen.getByPlaceholderText("Nom de l'étiquette…"),
    ).toBeInTheDocument();
  });
});
