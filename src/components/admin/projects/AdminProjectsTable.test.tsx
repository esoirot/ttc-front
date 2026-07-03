import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryClient } from "@/test/queryClientWrapper";
import type { AdminProject } from "@/types/admin.types";

const { gqlFetch, gqlMutate } = vi.hoisted(() => ({
  gqlFetch: vi.fn(),
  gqlMutate: vi.fn(),
}));
vi.mock("@/lib/apollo", () => ({ gqlFetch, gqlMutate }));

const { exportCsv } = vi.hoisted(() => ({ exportCsv: vi.fn() }));
vi.mock("@/lib/csv", () => ({ exportCsv }));

vi.mock("../audits/ResourceAuditHistory", () => ({
  ResourceAuditHistory: ({
    resourceName,
    onClose,
  }: {
    resourceName: string;
    onClose: () => void;
  }) => (
    <div>
      <p>History — {resourceName}</p>
      <button onClick={onClose}>close-history</button>
    </div>
  ),
}));

import { AdminProjectsTable } from "./AdminProjectsTable";

function makeProject(overrides: Partial<AdminProject> = {}): AdminProject {
  return {
    id: 1,
    userId: 1,
    owner: { id: 1, email: "owner@example.com", name: "Owner" },
    clientId: null,
    title: "Translate manual",
    description: null,
    status: "DRAFT",
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
  } as AdminProject;
}

function makeConnection(items: AdminProject[]) {
  return { items, nextCursor: null, total: items.length };
}

function renderTable() {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <AdminProjectsTable />
    </QueryClientProvider>,
  );
}

describe("AdminProjectsTable", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
    exportCsv.mockReset();
  });

  it("shows an empty state when there are no projects", async () => {
    gqlFetch.mockResolvedValueOnce({ adminProjects: makeConnection([]) });
    renderTable();
    expect(await screen.findByText("No projects found.")).toBeInTheDocument();
  });

  it("renders project rows and the total count", async () => {
    gqlFetch.mockResolvedValueOnce({
      adminProjects: makeConnection([makeProject({ title: "Docs" })]),
    });
    renderTable();
    expect(await screen.findByText("Docs")).toBeInTheDocument();
    expect(screen.getByText("1 total")).toBeInTheDocument();
  });

  it("filters by search text wired to the search query variable", async () => {
    gqlFetch.mockResolvedValue({ adminProjects: makeConnection([]) });
    renderTable();
    await screen.findByText("No projects found.");

    fireEvent.change(screen.getByPlaceholderText("Search title..."), {
      target: { value: "manual" },
    });

    await waitFor(() =>
      expect(
        gqlFetch.mock.calls.some(
          (c) => (c[1] as Record<string, unknown>)?.search === "manual",
        ),
      ).toBe(true),
    );
  });

  it("exports rows as CSV", async () => {
    gqlFetch.mockResolvedValueOnce({
      adminProjects: makeConnection([makeProject({ title: "Docs" })]),
    });
    renderTable();
    await screen.findByText("Docs");

    fireEvent.click(screen.getByText("Export CSV"));

    expect(exportCsv).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ title: "Docs" })]),
      "projects.csv",
    );
  });

  it("bulk-selects and deletes projects via the confirm dialog", async () => {
    gqlFetch.mockResolvedValueOnce({
      adminProjects: makeConnection([makeProject({ id: 5 })]),
    });
    gqlMutate.mockResolvedValueOnce({ adminDeleteProject: { id: 5 } });
    renderTable();
    await screen.findByText("Translate manual");

    fireEvent.click(screen.getAllByRole("checkbox")[1]!);
    fireEvent.click(screen.getByText("Delete selected (1)"));
    const dialog = screen.getByRole("alertdialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Delete" }));

    await waitFor(() =>
      expect(gqlMutate.mock.calls[0][1]).toMatchObject({ id: 5 }),
    );
  });

  it("creates a project from the New Project dialog", async () => {
    gqlFetch.mockResolvedValueOnce({ adminProjects: makeConnection([]) });
    gqlMutate.mockResolvedValueOnce({
      adminCreateProject: makeProject({ id: 9, title: "New Proj" }),
    });
    renderTable();
    await screen.findByText("No projects found.");

    fireEvent.click(screen.getByRole("button", { name: "+ New Project" }));
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "New Proj" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create" }));

    await waitFor(() =>
      expect(gqlMutate.mock.calls[0][1]).toMatchObject({
        input: expect.objectContaining({ title: "New Proj" }),
      }),
    );
  });

  it("Create button is disabled until a title is entered", async () => {
    gqlFetch.mockResolvedValueOnce({ adminProjects: makeConnection([]) });
    renderTable();
    await screen.findByText("No projects found.");

    fireEvent.click(screen.getByRole("button", { name: "+ New Project" }));
    expect(screen.getByRole("button", { name: "Create" })).toBeDisabled();
  });

  it("cancels the New Project dialog without creating", async () => {
    gqlFetch.mockResolvedValueOnce({ adminProjects: makeConnection([]) });
    renderTable();
    await screen.findByText("No projects found.");

    fireEvent.click(screen.getByRole("button", { name: "+ New Project" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.queryByText("New Project")).not.toBeInTheDocument();
    expect(gqlMutate).not.toHaveBeenCalled();
  });

  it("opens Edit pre-filled with title/deadline/wordCount and saves", async () => {
    gqlFetch.mockResolvedValueOnce({
      adminProjects: makeConnection([
        makeProject({
          id: 3,
          title: "Old title",
          deadline: "2026-06-01T00:00:00.000Z",
          wordCount: 1000,
        }),
      ]),
    });
    gqlMutate.mockResolvedValueOnce({
      adminUpdateProject: makeProject({ id: 3, title: "New title" }),
    });
    renderTable();
    await screen.findByText("Old title");

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    const titleInput = screen.getByDisplayValue("Old title");
    fireEvent.change(titleInput, { target: { value: "New title" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(gqlMutate.mock.calls[0][1]).toMatchObject({
        input: expect.objectContaining({ id: 3, title: "New title" }),
      }),
    );
  });

  it("deletes a single project via its row confirm dialog", async () => {
    gqlFetch.mockResolvedValueOnce({
      adminProjects: makeConnection([makeProject({ id: 4 })]),
    });
    gqlMutate.mockResolvedValueOnce({ adminDeleteProject: { id: 4 } });
    renderTable();
    await screen.findByText("Translate manual");

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    const dialog = screen.getByRole("alertdialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Delete" }));

    await waitFor(() =>
      expect(gqlMutate.mock.calls[0][1]).toMatchObject({ id: 4 }),
    );
  });

  it("opens and closes the resource history dialog", async () => {
    gqlFetch.mockResolvedValueOnce({
      adminProjects: makeConnection([makeProject({ id: 5, title: "Docs" })]),
    });
    renderTable();
    await screen.findByText("Docs");

    fireEvent.click(screen.getByRole("button", { name: "History" }));
    expect(screen.getByText("History — Docs")).toBeInTheDocument();

    fireEvent.click(screen.getByText("close-history"));
    expect(screen.queryByText("History — Docs")).not.toBeInTheDocument();
  });

  it("shows a Load more button when more pages are available", async () => {
    gqlFetch.mockResolvedValueOnce({
      adminProjects: { items: [makeProject()], nextCursor: 5, total: 2 },
    });
    renderTable();
    expect(await screen.findByText("Load more")).toBeInTheDocument();
  });
});
