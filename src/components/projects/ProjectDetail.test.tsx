import { render, screen } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryClient } from "@/test/queryClientWrapper";
import type { Project } from "@/types/projects.types";

const { gqlFetch, gqlMutate } = vi.hoisted(() => ({
  gqlFetch: vi.fn(),
  gqlMutate: vi.fn(),
}));

vi.mock("@/lib/apollo", () => ({ gqlFetch, gqlMutate }));

import { ProjectDetail } from "./ProjectDetail";

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

function blanketResponse(project: Project | null) {
  return Promise.resolve({
    project,
    projects: emptyConnection(),
    clients: emptyConnection(),
    tasks: emptyConnection(),
    timeEntries: emptyConnection(),
    activeTimer: null,
    tags: [],
    members: [],
    me: null,
  });
}

function renderAt(id: string, project: Project | null) {
  gqlFetch.mockImplementation(() => blanketResponse(project));

  return render(
    <QueryClientProvider client={createQueryClient()}>
      <MemoryRouter initialEntries={[`/projects/${id}`]}>
        <Routes>
          <Route path="/projects/:id" element={<ProjectDetail />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("ProjectDetail", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("shows 'Project not found.' when the project does not exist", async () => {
    renderAt("999", null);
    expect(await screen.findByText("Project not found.")).toBeInTheDocument();
  });

  it("renders the project header, overview, and tab list once loaded", async () => {
    renderAt("1", makeProject());

    expect(await screen.findByText("Translate manual")).toBeInTheDocument();
    expect(screen.getByText("Time logged")).toBeInTheDocument();
    expect(screen.getByText("Tasks")).toBeInTheDocument();
    expect(screen.getByText("Kanban")).toBeInTheDocument();
    expect(screen.getByText("Time")).toBeInTheDocument();
  });
});
