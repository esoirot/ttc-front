import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryClient } from "@/test/queryClientWrapper";
import type { Client } from "@/types/clients.types";
import type { Project } from "@/types/projects.types";

const { gqlFetch, gqlMutate } = vi.hoisted(() => ({
  gqlFetch: vi.fn(),
  gqlMutate: vi.fn(),
}));

vi.mock("@/lib/apollo", () => ({ gqlFetch, gqlMutate }));

import { ProjectHeader } from "./ProjectHeader";

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

function makeClient(overrides: Partial<Client> = {}): Client {
  return {
    id: 1,
    userId: 1,
    name: "Acme",
    legalName: null,
    email: null,
    phone: null,
    company: null,
    address: null,
    city: null,
    country: null,
    postalCode: null,
    vatNumber: null,
    notes: null,
    hubspotId: null,
    clientType: "COMPANY",
    firstName: null,
    lastName: null,
    paymentDelayDays: null,
    taxRate: null,
    billingEndOfMonth: false,
    website: null,
    industry: null,
    tags: [],
    contacts: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  } as Client;
}

function renderHeader(
  project: Project,
  clients: Client[] = [],
  onUpdate = vi.fn(),
) {
  gqlFetch.mockResolvedValue({ translationRates: [], clientRates: [] });
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <ProjectHeader
        project={project}
        clients={clients}
        onUpdate={onUpdate}
        saving={false}
      />
    </QueryClientProvider>,
  );
}

describe("ProjectHeader", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("shows the title and status badge", () => {
    renderHeader(makeProject());
    expect(screen.getByText("Translate manual")).toBeInTheDocument();
    expect(screen.getByText("ACTIVE")).toBeInTheDocument();
  });

  it("shows 'No details' when no language/deadline/wordcount is set", () => {
    renderHeader(makeProject());
    expect(screen.getByText("No details")).toBeInTheDocument();
  });

  it("shows the client name prefix when linked", () => {
    renderHeader(makeProject({ clientId: 1 }), [
      makeClient({ id: 1, name: "Acme" }),
    ]);
    expect(screen.getByText(/Acme —/)).toBeInTheDocument();
  });

  it("shows a pricing summary line when monetization fields are set", () => {
    renderHeader(makeProject({ hourlyRate: 25, currency: "USD" }));
    expect(screen.getByText("25/hr USD")).toBeInTheDocument();
  });

  it("switches to the edit form pre-filled from the project", () => {
    renderHeader(makeProject());
    fireEvent.click(screen.getByText("Edit"));
    expect(screen.getByLabelText("Title")).toHaveValue("Translate manual");
  });

  it("saves the updated title and exits edit mode", async () => {
    const onUpdate = vi.fn().mockResolvedValue(undefined);
    renderHeader(makeProject({ id: 7 }), [], onUpdate);

    fireEvent.click(screen.getByText("Edit"));
    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Renamed" },
    });
    fireEvent.click(screen.getByText("Save"));

    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ id: 7, title: "Renamed" }),
      ),
    );
    await waitFor(() =>
      expect(screen.queryByLabelText("Title")).not.toBeInTheDocument(),
    );
  });

  it("cancel discards edits without calling onUpdate", () => {
    const onUpdate = vi.fn();
    renderHeader(makeProject(), [], onUpdate);

    fireEvent.click(screen.getByText("Edit"));
    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Changed" },
    });
    fireEvent.click(screen.getByText("Cancel"));

    expect(onUpdate).not.toHaveBeenCalled();
    expect(screen.getByText("Translate manual")).toBeInTheDocument();
  });
});
