import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { gqlFetch, gqlMutate } = vi.hoisted(() => ({
  gqlFetch: vi.fn(),
  gqlMutate: vi.fn(),
}));

vi.mock("@/lib/apollo", () => ({ gqlFetch, gqlMutate }));

vi.mock("../tags/TtcTagChips", () => ({
  TtcTagChips: () => <div data-testid="tag-chips" />,
}));

import { QueryClientProvider } from "@tanstack/react-query";
import { createQueryClient } from "@/test/queryClientWrapper";
import type { Project } from "@/types/projects.types";
import { TimerStartInput } from "./TimerStartInput";

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
    currency: "EUR",
    startDate: null,
    deadline: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  } as Project;
}

function renderInput(
  overrides: Partial<Parameters<typeof TimerStartInput>[0]> = {},
) {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <TimerStartInput
        projects={[]}
        tags={[]}
        recentDescriptions={[]}
        {...overrides}
      />
    </QueryClientProvider>,
  );
}

describe("TimerStartInput", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("renders the description input, project select, tag chips, and billable toggle", () => {
    renderInput();

    expect(
      screen.getByPlaceholderText("What are you working on?"),
    ).toBeInTheDocument();
    expect(screen.getByText("No project")).toBeInTheDocument();
    expect(screen.getByTestId("tag-chips")).toBeInTheDocument();
    expect(screen.getByLabelText("Toggle billable")).toBeInTheDocument();
  });

  it("starts billable by default, toggles off on click", () => {
    renderInput();

    const billableButton = screen.getByLabelText("Toggle billable");
    expect(billableButton.className).toContain("border-emerald-500");

    fireEvent.click(billableButton);
    expect(billableButton.className).not.toContain("border-emerald-500");
  });

  it("starts the timer with the typed description, trimmed, and clears the field", async () => {
    gqlMutate.mockResolvedValueOnce({
      startTimer: { id: 1, description: "Translate" },
    });
    renderInput();

    fireEvent.change(screen.getByPlaceholderText("What are you working on?"), {
      target: { value: "  Translate  " },
    });
    fireEvent.click(screen.getByRole("button", { name: "▶ Start" }));

    await waitFor(() =>
      expect(gqlMutate).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          input: expect.objectContaining({
            description: "Translate",
            billable: true,
          }),
        }),
      ),
    );
    expect(screen.getByPlaceholderText("What are you working on?")).toHaveValue(
      "",
    );
  });

  it("omits description from the input when blank", async () => {
    gqlMutate.mockResolvedValueOnce({ startTimer: { id: 1 } });
    renderInput();

    fireEvent.click(screen.getByRole("button", { name: "▶ Start" }));

    await waitFor(() =>
      expect(gqlMutate).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          input: expect.objectContaining({ description: undefined }),
        }),
      ),
    );
  });

  it("uses initialProjectId to pre-select a project", () => {
    renderInput({
      projects: [makeProject({ id: 7, title: "Website copy" })],
      initialProjectId: 7,
    });

    expect(screen.getByText("Website copy")).toBeInTheDocument();
  });

  it("passes billable=false when the toggle is clicked before starting", async () => {
    gqlMutate.mockResolvedValueOnce({ startTimer: { id: 1 } });
    renderInput();

    fireEvent.click(screen.getByLabelText("Toggle billable")); // off
    fireEvent.click(screen.getByRole("button", { name: "▶ Start" }));

    await waitFor(() =>
      expect(gqlMutate).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          input: expect.objectContaining({ billable: false }),
        }),
      ),
    );
  });

  it("re-enables billable when the toggle is clicked twice", () => {
    renderInput();
    const btn = screen.getByLabelText("Toggle billable");
    fireEvent.click(btn); // off
    fireEvent.click(btn); // back on
    expect(btn.className).toContain("border-emerald-500");
  });

  it("omits projectId from the mutation when no project is selected", async () => {
    gqlMutate.mockResolvedValueOnce({ startTimer: { id: 1 } });
    renderInput({ projects: [makeProject({ id: 5, title: "Docs" })] });

    fireEvent.click(screen.getByRole("button", { name: "▶ Start" }));

    await waitFor(() =>
      expect(gqlMutate).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          input: expect.objectContaining({ projectId: undefined }),
        }),
      ),
    );
  });

  it("fires handleStart when Enter is pressed in the description input", async () => {
    gqlMutate.mockResolvedValueOnce({ startTimer: { id: 1 } });
    renderInput();

    fireEvent.keyDown(screen.getByPlaceholderText("What are you working on?"), {
      key: "Enter",
    });

    await waitFor(() => expect(gqlMutate).toHaveBeenCalled());
  });

  it("shows 'Starting…' and disables Start while the mutation is pending", async () => {
    let resolveMutate!: (v: { startTimer: { id: number } }) => void;
    gqlMutate.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveMutate = resolve;
      }),
    );
    renderInput();

    fireEvent.click(screen.getByRole("button", { name: "▶ Start" }));

    expect(
      await screen.findByRole("button", { name: "Starting…" }),
    ).toBeDisabled();

    resolveMutate({ startTimer: { id: 1 } });
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "▶ Start" }),
      ).not.toBeDisabled(),
    );
  });
});
