import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { IntlProvider } from "react-intl";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { messages } from "@/i18n/messages";
import type { Locale } from "@/i18n/useLocale";
import { createQueryClient } from "@/test/queryClientWrapper";
import type { Project } from "@/types/projects.types";

const { gqlFetch, gqlMutate } = vi.hoisted(() => ({
  gqlFetch: vi.fn(),
  gqlMutate: vi.fn(),
}));

vi.mock("@/lib/apollo", () => ({ gqlFetch, gqlMutate }));

const navigateMock = vi.fn();
vi.mock("react-router-dom", async () => ({
  ...(await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom",
  )),
  useNavigate: () => navigateMock,
}));

vi.mock("../charts/ProjectsOverviewCharts", () => ({
  ProjectsOverviewCharts: ({ month }: { month: Date }) => (
    <div data-testid="charts">{`${month.getFullYear()}-${month.getMonth() + 1}`}</div>
  ),
}));

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

function renderList(locale: Locale = "en") {
  return render(
    <IntlProvider locale={locale} messages={messages[locale]}>
      <QueryClientProvider client={createQueryClient()}>
        <MemoryRouter>
          <ProjectsList />
        </MemoryRouter>
      </QueryClientProvider>
    </IntlProvider>,
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
      timeEntries: emptyConnection(),
    });

    renderList();

    expect(await screen.findByText("No projects.")).toBeInTheDocument();
  });

  it("renders project cards and a count line", async () => {
    gqlFetch.mockResolvedValue({
      projects: { items: [makeProject()], nextCursor: null, total: 1 },
      clients: emptyConnection(),
      timeEntries: emptyConnection(),
    });

    renderList();

    expect(await screen.findByText("Translate manual")).toBeInTheDocument();
    expect(screen.getByText("1 of 1")).toBeInTheDocument();
  });

  it("toggles the create-project form open and closed", async () => {
    gqlFetch.mockResolvedValue({
      projects: emptyConnection(),
      clients: emptyConnection(),
      timeEntries: emptyConnection(),
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
      timeEntries: emptyConnection(),
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

  it("renders French copy when locale is fr", async () => {
    gqlFetch.mockResolvedValue({
      projects: emptyConnection(),
      clients: emptyConnection(),
      timeEntries: emptyConnection(),
    });

    renderList("fr");

    expect(await screen.findByText("Aucun projet.")).toBeInTheDocument();
    expect(screen.getByText("Nouveau projet")).toBeInTheDocument();
  });

  describe("Projects tab", () => {
    beforeEach(() => navigateMock.mockReset());

    it("filters the list by the chosen status", async () => {
      gqlFetch.mockResolvedValue({
        projects: emptyConnection(),
        clients: emptyConnection(),
      });
      renderList();
      await screen.findByText("No projects.");

      fireEvent.mouseDown(screen.getByRole("tab", { name: "Active" }));

      await waitFor(() =>
        expect(gqlFetch).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({ status: "ACTIVE" }),
        ),
      );
    });

    it("shows loading skeletons until the projects arrive", () => {
      gqlFetch.mockReturnValue(new Promise(() => {}));
      const { container } = renderList();

      expect(
        container.querySelectorAll('[data-slot="skeleton"]').length,
      ).toBeGreaterThan(0);
    });

    it("opens a project when its card is clicked", async () => {
      gqlFetch.mockResolvedValue({
        projects: {
          items: [makeProject({ id: 4 })],
          nextCursor: null,
          total: 1,
        },
        clients: emptyConnection(),
      });
      renderList();

      fireEvent.click(await screen.findByText("Translate manual"));

      expect(navigateMock).toHaveBeenCalledWith("/projects/4");
    });

    it("deletes a project once the deletion is confirmed", async () => {
      gqlFetch.mockResolvedValue({
        projects: {
          items: [makeProject({ id: 4 })],
          nextCursor: null,
          total: 1,
        },
        clients: emptyConnection(),
      });
      gqlMutate.mockResolvedValue({ deleteProject: true });
      renderList();

      fireEvent.click(await screen.findByText("✕"));
      fireEvent.click(screen.getByRole("button", { name: "Delete" }));

      await waitFor(() =>
        expect(gqlMutate).toHaveBeenCalledWith(expect.anything(), { id: 4 }),
      );
      expect(navigateMock).not.toHaveBeenCalled();
    });

    it("cancelling a deletion neither deletes nor opens the project", async () => {
      gqlFetch.mockResolvedValue({
        projects: {
          items: [makeProject({ id: 4 })],
          nextCursor: null,
          total: 1,
        },
        clients: emptyConnection(),
      });
      renderList();

      fireEvent.click(await screen.findByText("✕"));
      fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

      expect(gqlMutate).not.toHaveBeenCalled();
      expect(navigateMock).not.toHaveBeenCalled();
    });

    it("offers Load more only when another page exists, and loads it", async () => {
      gqlFetch.mockResolvedValue({
        projects: { items: [makeProject({ id: 4 })], nextCursor: 9, total: 2 },
        clients: emptyConnection(),
      });
      renderList();

      fireEvent.click(await screen.findByRole("button", { name: "Load more" }));

      await waitFor(() =>
        expect(gqlFetch).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            pagination: expect.objectContaining({ cursor: 9 }),
          }),
        ),
      );
    });

    it("hides Load more on the last page", async () => {
      gqlFetch.mockResolvedValue({
        projects: { items: [makeProject()], nextCursor: null, total: 1 },
        clients: emptyConnection(),
      });
      renderList();

      await screen.findByText("Translate manual");
      expect(
        screen.queryByRole("button", { name: "Load more" }),
      ).not.toBeInTheDocument();
    });
  });

  describe("Dashboard tab", () => {
    beforeEach(() => {
      vi.useFakeTimers({ toFake: ["Date"] });
      vi.setSystemTime(new Date(2026, 9, 15));
      gqlFetch.mockResolvedValue({
        projects: emptyConnection(),
        clients: emptyConnection(),
        firstTimeEntryStart: new Date(2024, 2, 4, 9).toISOString(),
      });
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    function openDashboard() {
      fireEvent.mouseDown(screen.getByRole("tab", { name: "Dashboard" }));
    }

    it("shows the project list, not the charts, by default", async () => {
      renderList();

      expect(screen.getByRole("tab", { name: "Projects" })).toHaveAttribute(
        "data-state",
        "active",
      );
      expect(await screen.findByText("No projects.")).toBeInTheDocument();
      expect(screen.queryByTestId("charts")).not.toBeInTheDocument();
    });

    it("shows the charts for the current month in the Dashboard tab", () => {
      renderList();
      openDashboard();

      expect(screen.getByTestId("charts")).toHaveTextContent("2026-10");
      expect(screen.getByRole("combobox", { name: "Month" })).toHaveTextContent(
        "October",
      );
      expect(screen.getByRole("combobox", { name: "Year" })).toHaveTextContent(
        "2026",
      );
      expect(screen.getByRole("button", { name: "Next month" })).toBeDisabled();
      expect(screen.queryByText("No projects.")).not.toBeInTheDocument();
    });

    it("drives the monthly charts from the month filter", async () => {
      renderList();
      openDashboard();

      const previous = screen.getByRole("button", { name: "Previous month" });
      await waitFor(() => expect(previous).toBeEnabled());
      fireEvent.click(previous);

      expect(screen.getByRole("combobox", { name: "Month" })).toHaveTextContent(
        "September",
      );
      expect(screen.getByTestId("charts")).toHaveTextContent("2026-9");
    });

    it("offers years from the first logged entry to now", async () => {
      renderList();
      openDashboard();

      await waitFor(() =>
        expect(
          screen.getByRole("button", { name: "Previous month" }),
        ).toBeEnabled(),
      );
      fireEvent.click(screen.getByRole("combobox", { name: "Year" }));
      expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual([
        "2024",
        "2025",
        "2026",
      ]);
    });

    it("only offers the current month when nothing has been logged yet", async () => {
      gqlFetch.mockResolvedValue({
        projects: emptyConnection(),
        clients: emptyConnection(),
        firstTimeEntryStart: null,
      });
      renderList();
      openDashboard();

      await waitFor(() =>
        expect(gqlFetch).toHaveBeenCalledWith(
          expect.objectContaining({
            definitions: expect.arrayContaining([
              expect.objectContaining({
                name: expect.objectContaining({ value: "FirstTimeEntryStart" }),
              }),
            ]),
          }),
        ),
      );
      expect(
        screen.getByRole("button", { name: "Previous month" }),
      ).toBeDisabled();
      expect(screen.getByRole("button", { name: "Next month" })).toBeDisabled();
    });

    it("does not look up the first entry while on the Projects tab", async () => {
      renderList();
      await screen.findByText("No projects.");

      expect(gqlFetch).not.toHaveBeenCalledWith(
        expect.objectContaining({
          definitions: expect.arrayContaining([
            expect.objectContaining({
              name: expect.objectContaining({ value: "FirstTimeEntryStart" }),
            }),
          ]),
        }),
      );
    });

    it("names the tabs in French", () => {
      renderList("fr");

      expect(screen.getByRole("tab", { name: "Projets" })).toBeInTheDocument();
      expect(
        screen.getByRole("tab", { name: "Tableau de bord" }),
      ).toBeInTheDocument();
    });
  });
});
