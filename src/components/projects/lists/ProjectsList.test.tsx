import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryClient } from "@/test/queryClientWrapper";
import type { Project } from "@/types/projects.types";

const { gqlFetch, gqlMutate } = vi.hoisted(() => ({
  gqlFetch: vi.fn(),
  gqlMutate: vi.fn(),
}));

vi.mock("@/lib/apollo", () => ({ gqlFetch, gqlMutate }));

import { ProjectsList } from "./ProjectsList";

function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    id: 1,
    userId: 1,
    clientId: null,
    title: "Translate manual",
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
  };
}

function emptyConnection() {
  return { items: [], nextCursor: null, total: 0 };
}

function renderList() {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <MemoryRouter>
        <ProjectsList />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("ProjectsList", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("shows an empty state when there are no projects", async () => {
    gqlFetch.mockResolvedValue({
      projects: emptyConnection(),
      clients: emptyConnection(),
    });

    renderList();

    expect(await screen.findByText("No projects.")).toBeInTheDocument();
  });

  it("renders project cards and a count line", async () => {
    gqlFetch.mockResolvedValue({
      projects: { items: [makeProject()], nextCursor: null, total: 1 },
      clients: emptyConnection(),
    });

    renderList();

    expect(await screen.findByText("Translate manual")).toBeInTheDocument();
    expect(screen.getByText("1 of 1")).toBeInTheDocument();
  });

  it("toggles the create-project form open and closed", async () => {
    gqlFetch.mockResolvedValue({
      projects: emptyConnection(),
      clients: emptyConnection(),
    });

    renderList();
    await screen.findByText("No projects.");

    fireEvent.click(screen.getByText("New project"));
    expect(screen.getByText("Create project")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Cancel"));
    expect(screen.queryByText("Create project")).not.toBeInTheDocument();
  });

  it("debounces the search input before refetching", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    gqlFetch.mockResolvedValue({
      projects: emptyConnection(),
      clients: emptyConnection(),
    });

    renderList();

    fireEvent.change(screen.getByLabelText("Search projects"), {
      target: { value: "manual" },
    });

    expect(
      gqlFetch.mock.calls.some(
        (c) => (c[1] as Record<string, unknown>)?.search === "manual",
      ),
    ).toBe(false);

    await waitFor(() => vi.advanceTimersByTimeAsync(300));

    await waitFor(() =>
      expect(
        gqlFetch.mock.calls.some(
          (c) => (c[1] as Record<string, unknown>)?.search === "manual",
        ),
      ).toBe(true),
    );
    vi.useRealTimers();
  });
});
