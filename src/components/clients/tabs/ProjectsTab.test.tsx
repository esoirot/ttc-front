import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import type { Project } from "@/types/projects.types";
import { ProjectsTab } from "./ProjectsTab";

function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    id: 1,
    userId: 1,
    clientId: 1,
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

function renderTab(props: { projects: Project[]; loading: boolean }) {
  return render(
    <MemoryRouter>
      <ProjectsTab {...props} />
    </MemoryRouter>,
  );
}

describe("ProjectsTab", () => {
  it("shows neither the empty state nor any project links while loading", () => {
    renderTab({ projects: [], loading: true });
    expect(
      screen.queryByText("No projects linked to this client."),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("shows an empty state when there are no projects", () => {
    renderTab({ projects: [], loading: false });
    expect(
      screen.getByText("No projects linked to this client."),
    ).toBeInTheDocument();
  });

  it("renders a project link with its title and status", () => {
    renderTab({
      projects: [
        makeProject({ id: 5, title: "Translate manual", status: "ACTIVE" }),
      ],
      loading: false,
    });

    expect(screen.getByText("Translate manual")).toBeInTheDocument();
    expect(screen.getByText("ACTIVE")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", "/projects/5");
  });
});
