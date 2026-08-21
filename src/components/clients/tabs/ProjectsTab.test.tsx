import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryWrapper } from "@/test/queryClientWrapper";
import type { Project } from "@/types/projects.types";
import { ProjectsTab } from "./ProjectsTab";

const { gqlFetch } = vi.hoisted(() => ({ gqlFetch: vi.fn() }));
vi.mock("@/lib/apollo", () => ({ gqlFetch }));

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
    useCustomRate: false,
    rateSheetId: null,
    currency: "EUR",
    deadline: null,
    startDate: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function renderTab(props: { projects: Project[]; loading: boolean }) {
  const Wrapper = createQueryWrapper();
  return render(
    <Wrapper>
      <MemoryRouter>
        <ProjectsTab {...props} />
      </MemoryRouter>
    </Wrapper>,
  );
}

describe("ProjectsTab", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlFetch.mockResolvedValue({ rateSheets: [] });
  });

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

  it("does not show the KPI stats row when there are no projects", () => {
    renderTab({ projects: [], loading: false });
    expect(screen.queryByText("Total revenue")).not.toBeInTheDocument();
    expect(screen.queryByText("Projects")).not.toBeInTheDocument();
  });

  it("shows a KPI stats row isolated above the project list", () => {
    renderTab({
      projects: [
        makeProject({ id: 1, totalTimeSeconds: 3600 }),
        makeProject({ id: 2, totalTimeSeconds: 3600 }),
      ],
      loading: false,
    });
    expect(screen.getByText("Projects")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("Time logged")).toBeInTheDocument();
    expect(screen.getByText("Total revenue")).toBeInTheDocument();
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

  it("renders each project row as a flat divider row, not a card, Rates-style", () => {
    renderTab({
      projects: [makeProject({ id: 5 })],
      loading: false,
    });
    expect(screen.getByRole("link")).toHaveClass("border-b", "justify-between");
  });

  it("shows activity name badges when the project has activities", () => {
    renderTab({
      projects: [
        makeProject({
          activities: [
            { id: 1, name: "Translation", activityType: "TRANSLATOR" },
            { id: 2, name: "Proofreading", activityType: "CORRECTOR" },
          ],
        }),
      ],
      loading: false,
    });

    expect(screen.getByText("Translation")).toBeInTheDocument();
    expect(screen.getByText("Proofreading")).toBeInTheDocument();
  });

  it("shows the summed time logged for the project", () => {
    renderTab({
      projects: [makeProject({ totalTimeSeconds: 3661 })],
      loading: false,
    });
    expect(screen.getAllByText(/1h 1m/)).not.toHaveLength(0);
  });

  it("shows a Due badge when deadline is set, and omits it when null", () => {
    const Wrapper = createQueryWrapper();
    const { rerender } = render(
      <Wrapper>
        <MemoryRouter>
          <ProjectsTab
            projects={[makeProject({ deadline: "2026-09-01T00:00:00.000Z" })]}
            loading={false}
          />
        </MemoryRouter>
      </Wrapper>,
    );
    expect(screen.getByText("Due 2026-09-01")).toBeInTheDocument();

    rerender(
      <Wrapper>
        <MemoryRouter>
          <ProjectsTab
            projects={[makeProject({ deadline: null })]}
            loading={false}
          />
        </MemoryRouter>
      </Wrapper>,
    );
    expect(screen.queryByText(/^Due /)).not.toBeInTheDocument();
  });

  it("shows per-project revenue as a value + currency badge, Rates-style", () => {
    renderTab({
      projects: [
        makeProject({
          useCustomRate: true,
          fixedFee: 300,
          currency: "USD",
        }),
      ],
      loading: false,
    });
    expect(screen.getByText("300.00")).toBeInTheDocument();
    expect(screen.getByText("USD")).toBeInTheDocument();
  });

  it("shows a Total revenue card summing all projects' revenue", () => {
    renderTab({
      projects: [
        makeProject({
          id: 1,
          useCustomRate: true,
          fixedFee: 300,
          currency: "USD",
        }),
        makeProject({
          id: 2,
          useCustomRate: true,
          fixedFee: 200,
          currency: "USD",
        }),
      ],
      loading: false,
    });
    expect(screen.getByText("Total revenue")).toBeInTheDocument();
    expect(screen.getByText("500.00 USD")).toBeInTheDocument();
  });
});
