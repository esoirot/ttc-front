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

  it("saves edited description, currency, languages, dates, wordCount, and rates", async () => {
    const onUpdate = vi.fn().mockResolvedValue(undefined);
    renderHeader(makeProject({ id: 7 }), [], onUpdate);

    fireEvent.click(screen.getByText("Edit"));
    fireEvent.change(screen.getByLabelText("Description"), {
      target: { value: "New desc" },
    });
    fireEvent.change(screen.getByLabelText("Currency"), {
      target: { value: "USD" },
    });
    fireEvent.change(screen.getByLabelText("Source language"), {
      target: { value: "EN" },
    });
    fireEvent.change(screen.getByLabelText("Target language"), {
      target: { value: "FR" },
    });
    fireEvent.change(screen.getByLabelText("Start date"), {
      target: { value: "2026-01-01" },
    });
    fireEvent.change(screen.getByLabelText("Deadline"), {
      target: { value: "2026-02-01" },
    });
    fireEvent.change(screen.getByLabelText("Word count"), {
      target: { value: "1000" },
    });
    fireEvent.change(screen.getByLabelText("Fixed fee"), {
      target: { value: "500" },
    });
    fireEvent.change(screen.getByLabelText("Hourly rate"), {
      target: { value: "25" },
    });
    fireEvent.change(screen.getByLabelText("Per-word rate"), {
      target: { value: "0.1" },
    });
    fireEvent.click(screen.getByText("Save"));

    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 7,
          description: "New desc",
          currency: "USD",
          sourceLanguage: "EN",
          targetLanguage: "FR",
          startDate: "2026-01-01",
          deadline: "2026-02-01",
          wordCount: 1000,
          fixedFee: 500,
          hourlyRate: 25,
          perWordRate: 0.1,
        }),
      ),
    );
  });

  it("shows the language pair, deadline, and word count in the details line", () => {
    renderHeader(
      makeProject({
        sourceLanguage: "EN",
        targetLanguage: "FR",
        deadline: "2026-12-31T00:00:00.000Z",
        wordCount: 2500,
      }),
    );
    expect(
      screen.getByText("EN → FR · Due 2026-12-31 · 2,500 words"),
    ).toBeInTheDocument();
  });

  it("joins multiple pricing lines with a plus sign", () => {
    renderHeader(
      makeProject({ fixedFee: 100, hourlyRate: 25, perWordRate: 0.1 }),
    );
    expect(
      screen.getByText("Fixed 100 EUR + 25/hr EUR + 0.1/word EUR"),
    ).toBeInTheDocument();
  });

  it("shows no pricing line when no monetization fields are set", () => {
    renderHeader(makeProject());
    expect(screen.queryByText(/Fixed|\/hr|\/word/)).not.toBeInTheDocument();
  });

  it("does not render a RatePicker for a rate type with no matching rates", () => {
    renderHeader(makeProject());
    fireEvent.click(screen.getByText("Edit"));
    expect(screen.queryByText("From rate…")).not.toBeInTheDocument();
  });

  it("renders a RatePicker trigger when matching rates are loaded", async () => {
    gqlFetch.mockResolvedValue({
      translationRates: [
        {
          id: 1,
          userId: 1,
          name: "Standard hourly",
          amount: 30,
          currency: "EUR",
          type: "HOURLY",
          description: null,
          activityId: null,
          clientId: null,
          sourceLanguage: null,
          targetLanguage: null,
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
      ],
      clientRates: [],
    });
    render(
      <QueryClientProvider client={createQueryClient()}>
        <ProjectHeader
          project={makeProject()}
          clients={[]}
          onUpdate={vi.fn()}
          saving={false}
        />
      </QueryClientProvider>,
    );
    fireEvent.click(screen.getByText("Edit"));

    expect(await screen.findAllByText("From rate…")).toHaveLength(1);
  });
});
