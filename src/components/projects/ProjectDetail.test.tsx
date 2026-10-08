import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { IntlProvider } from "react-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryClient } from "@/test/queryClientWrapper";
import { messages } from "@/i18n/messages";
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

function LocationProbe() {
  const { search } = useLocation();
  return <output data-testid="search">{search}</output>;
}

function renderAt(
  id: string,
  project: Project | null,
  locale: "en" | "fr" = "en",
) {
  gqlFetch.mockImplementation(() => blanketResponse(project));

  return render(
    <QueryClientProvider client={createQueryClient()}>
      <IntlProvider locale={locale} messages={messages[locale]}>
        <MemoryRouter initialEntries={[`/projects/${id}`]}>
          <Routes>
            <Route
              path="/projects/:id"
              element={
                <>
                  <ProjectDetail />
                  <LocationProbe />
                </>
              }
            />
          </Routes>
        </MemoryRouter>
      </IntlProvider>
    </QueryClientProvider>,
  );
}

describe("ProjectDetail", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("opens the task named in ?task= (links from the dashboard deadlines)", async () => {
    renderAt("1?task=3", makeProject());
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(gqlFetch).toHaveBeenCalledWith(expect.anything(), { id: 3 });
  });

  it("forgets ?task= once the task is closed, so a reload doesn't reopen it", async () => {
    renderAt("1?task=3", makeProject());
    const dialog = await screen.findByRole("dialog");

    fireEvent.keyDown(dialog, { key: "Escape" });

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(screen.getByTestId("search")).toHaveTextContent(/^$/);
  });

  it("opens no task without ?task=", async () => {
    renderAt("1", makeProject());
    await screen.findByText("Translate manual");
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("shows 'Project not found.' when the project does not exist", async () => {
    renderAt("999", null);
    expect(await screen.findByText("Project not found.")).toBeInTheDocument();
  });

  it("renders French copy when locale is fr", async () => {
    renderAt("999", null, "fr");
    expect(await screen.findByText("Projet introuvable.")).toBeInTheDocument();
  });

  it("renders the project header and tab list once loaded, Tasks first", async () => {
    renderAt("1", makeProject());

    expect(await screen.findByText("Translate manual")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Tasks" })).toHaveAttribute(
      "data-state",
      "active",
    );
    expect(screen.getByRole("tab", { name: "Kanban" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Time" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Activity" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Dashboard" })).toBeInTheDocument();
  });

  it("keeps the KPIs and charts out of the way until Dashboard is opened", async () => {
    renderAt("1", makeProject());

    await screen.findByText("Translate manual");
    expect(screen.queryByText("Time logged")).not.toBeInTheDocument();
    expect(screen.queryByText("Time per task")).not.toBeInTheDocument();
  });

  it("shows the KPIs and charts in the Dashboard tab", async () => {
    renderAt("1", makeProject());

    await screen.findByText("Translate manual");
    fireEvent.mouseDown(screen.getByRole("tab", { name: "Dashboard" }));

    expect(await screen.findByText("Time logged")).toBeInTheDocument();
    expect(screen.getByText("Time per task")).toBeInTheDocument();
    expect(screen.getByText("Time per occupation")).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Month" })).toBeInTheDocument();
  });

  it("names the Dashboard tab in French", async () => {
    renderAt("1", makeProject(), "fr");

    await screen.findByText("Translate manual");
    expect(
      screen.getByRole("tab", { name: "Tableau de bord" }),
    ).toBeInTheDocument();
  });
});
