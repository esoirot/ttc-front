import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { IntlProvider } from "react-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryClient } from "@/test/queryClientWrapper";
import { messages } from "@/i18n/messages";
import type { Locale } from "@/i18n/useLocale";
import type { Client } from "@/types/clients.types";
import type { Project } from "@/types/projects.types";

const { gqlFetch, gqlMutate } = vi.hoisted(() => ({
  gqlFetch: vi.fn(),
  gqlMutate: vi.fn(),
}));

vi.mock("@/lib/apollo", () => ({ gqlFetch, gqlMutate }));

let occupationChipsProps: Record<string, unknown> = {};
vi.mock("@/components/occupations/OccupationChips", () => ({
  OccupationChips: (props: Record<string, unknown>) => {
    occupationChipsProps = props;
    return <div data-testid="occupation-chips" />;
  },
}));

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

function makeRateSheet(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    userId: 1,
    occupationId: null,
    clientId: 3,
    name: "Sheet",
    description: null,
    sourceLanguage: "EN",
    targetLanguage: "FR",
    currency: "EUR",
    pricePerWord: 0.1,
    matchRates: {},
    isDefault: false,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

/** Answers every query; the client picker reads `clients`, lookups `client`. */
function mockApi(clients: Client[] = [], extra: Record<string, unknown> = {}) {
  gqlFetch.mockImplementation((_query: unknown, vars?: { id?: number }) =>
    Promise.resolve({
      translationRates: [],
      clientRates: [],
      clients: { items: clients, nextCursor: null, total: clients.length },
      client: clients.find((c) => c.id === vars?.id) ?? null,
      ...extra,
    }),
  );
}

function renderHeader(
  project: Project,
  clients: Client[] = [],
  onUpdate = vi.fn(),
  locale: Locale = "en",
) {
  mockApi(clients);
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <IntlProvider locale={locale} messages={messages[locale]}>
        <MemoryRouter>
          <ProjectHeader project={project} onUpdate={onUpdate} saving={false} />
        </MemoryRouter>
      </IntlProvider>
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

  it("shows no language, due date, or word count badges when unset", () => {
    renderHeader(makeProject());
    expect(screen.queryByText(/→/)).not.toBeInTheDocument();
    expect(screen.queryByText(/^Due /)).not.toBeInTheDocument();
    expect(screen.queryByText(/words$/)).not.toBeInTheDocument();
  });

  it("shows due date and word count as their own badges", () => {
    renderHeader(
      makeProject({
        deadline: "2026-12-31T00:00:00.000Z",
        wordCount: 2500,
      }),
    );
    expect(screen.getByText("Due 2026-12-31")).toBeInTheDocument();
    expect(screen.getByText("0 / 2,500 words")).toBeInTheDocument();
  });

  it("shows the wordsProcessed sum over the wordCount target", () => {
    renderHeader(makeProject({ wordCount: 2500, totalWordsProcessed: 1200 }));
    expect(screen.getByText("1,200 / 2,500 words")).toBeInTheDocument();
  });

  it("counts task and checklist words in the total against the target", () => {
    renderHeader(
      makeProject({
        wordCount: 5000,
        totalWordsProcessed: 400,
        totalTaskWords: 700,
      }),
    );
    expect(screen.getByText("1,100 / 5,000 words")).toBeInTheDocument();
  });

  it("shows the total with task words even when no time entry has words", () => {
    renderHeader(
      makeProject({
        wordCount: null,
        totalWordsProcessed: 0,
        totalTaskWords: 700,
      }),
    );
    expect(screen.getByText("700 words logged")).toBeInTheDocument();
  });

  it("shows just the logged sum when no wordCount target is set", () => {
    renderHeader(makeProject({ wordCount: null, totalWordsProcessed: 400 }));
    expect(screen.getByText("400 words logged")).toBeInTheDocument();
  });

  it("shows no word count badge when neither wordCount nor totalWordsProcessed is set", () => {
    renderHeader(makeProject({ wordCount: null, totalWordsProcessed: null }));
    expect(screen.queryByText(/words/)).not.toBeInTheDocument();
  });

  it("shows the client name prefix when linked", async () => {
    renderHeader(makeProject({ clientId: 1 }), [
      makeClient({ id: 1, name: "Acme" }),
    ]);
    // "Acme" (a <Link>) and the " — " separator are separate sibling
    // elements, not one text node, so match the link directly.
    expect(await screen.findByRole("link", { name: "Acme" })).toHaveAttribute(
      "href",
      "/clients/1",
    );
  });

  it("shows a pricing summary line when monetization fields are set", () => {
    renderHeader(
      makeProject({ useCustomRate: true, hourlyRate: 25, currency: "USD" }),
    );
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
    fireEvent.click(screen.getByLabelText("Source language"));
    fireEvent.click(screen.getByRole("option", { name: "EN — English" }));
    fireEvent.click(screen.getByLabelText("Target language"));
    fireEvent.click(screen.getByRole("option", { name: "FR — French" }));
    fireEvent.change(screen.getByLabelText("Start date"), {
      target: { value: "2026-01-01" },
    });
    fireEvent.change(screen.getByLabelText("Deadline"), {
      target: { value: "2026-02-01" },
    });
    fireEvent.change(screen.getByLabelText("Word count"), {
      target: { value: "1000" },
    });
    fireEvent.click(screen.getByRole("checkbox", { name: /use custom rate/i }));
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
  }, 15_000);

  it("shows the language pair, due date, and word count as three separate badges", () => {
    renderHeader(
      makeProject({
        sourceLanguage: "EN",
        targetLanguage: "FR",
        deadline: "2026-12-31T00:00:00.000Z",
        wordCount: 2500,
      }),
    );
    expect(screen.getByText("EN → FR")).toBeInTheDocument();
    expect(screen.getByText("Due 2026-12-31")).toBeInTheDocument();
    expect(screen.getByText("0 / 2,500 words")).toBeInTheDocument();
  });

  it("wires occupation chip onChange to the edit form's occupationIds, seeded from project.occupations", () => {
    renderHeader(
      makeProject({
        occupations: [
          { id: 1, name: "Translation", occupationType: "TRANSLATOR" },
        ],
      }),
    );
    fireEvent.click(screen.getByText("Edit"));
    expect(occupationChipsProps.occupationIds).toEqual([1]);

    act(() =>
      (occupationChipsProps.onChange as (ids: number[]) => void)([1, 2]),
    );
    expect(occupationChipsProps.occupationIds).toEqual([1, 2]);
  });

  it("saves the edited occupationIds", async () => {
    const onUpdate = vi.fn().mockResolvedValue(undefined);
    renderHeader(makeProject({ id: 7 }), [], onUpdate);

    fireEvent.click(screen.getByText("Edit"));
    act(() =>
      (occupationChipsProps.onChange as (ids: number[]) => void)([3, 4]),
    );
    fireEvent.click(screen.getByText("Save"));

    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ occupationIds: [3, 4] }),
      ),
    );
  });

  it("joins multiple pricing lines with a plus sign", () => {
    renderHeader(
      makeProject({
        useCustomRate: true,
        rateSheetId: null,
        fixedFee: 100,
        hourlyRate: 25,
        perWordRate: 0.1,
      }),
    );
    expect(
      screen.getByText("Fixed 100 EUR + 25/hr EUR + 0.1/word EUR"),
    ).toBeInTheDocument();
  });

  it("shows no pricing line when no monetization fields are set", () => {
    renderHeader(makeProject());
    expect(screen.queryByText(/Fixed|\/hr|\/word/)).not.toBeInTheDocument();
  });

  it("does not claim 'No client rate sheet for this project' while rate sheets are still loading", async () => {
    let resolveRateSheets!: (v: {
      rateSheets: ReturnType<typeof makeRateSheet>[];
    }) => void;
    const rateSheetsPromise = new Promise<{
      rateSheets: ReturnType<typeof makeRateSheet>[];
    }>((resolve) => {
      resolveRateSheets = resolve;
    });
    gqlFetch.mockImplementation((query: unknown) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const doc = query as any;
      const op = doc?.definitions?.find(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (d: any) => d.kind === "OperationDefinition",
      );
      const opName = op?.name?.value ?? String(query);
      if (opName === "RateSheets") return rateSheetsPromise;
      return Promise.resolve({ translationRates: [], clientRates: [] });
    });

    render(
      <QueryClientProvider client={createQueryClient()}>
        <IntlProvider locale="en" messages={messages.en}>
          <ProjectHeader
            project={makeProject({
              clientId: 3,
              sourceLanguage: "EN",
              targetLanguage: "FR",
            })}
            onUpdate={vi.fn()}
            saving={false}
          />
        </IntlProvider>
      </QueryClientProvider>,
    );

    expect(
      screen.queryByText("No client rate sheet for this project"),
    ).not.toBeInTheDocument();

    await act(async () => {
      resolveRateSheets({
        rateSheets: [
          makeRateSheet({
            clientId: 3,
            sourceLanguage: "EN",
            targetLanguage: "FR",
            pricePerWord: 0.12,
            currency: "EUR",
            name: "EN-FR standard",
          }),
        ],
      });
      await rateSheetsPromise;
    });

    expect(
      await screen.findByText(/Client rate: 0\.12 EUR\/word/),
    ).toBeInTheDocument();
  });

  it("shows the client rate sheet price when a matching sheet is loaded", async () => {
    gqlFetch.mockResolvedValue({
      translationRates: [],
      clientRates: [],
      rateSheets: [
        {
          id: 1,
          userId: 1,
          occupationId: null,
          clientId: 3,
          name: "EN-FR standard",
          description: null,
          sourceLanguage: "EN",
          targetLanguage: "FR",
          currency: "EUR",
          pricePerWord: 0.12,
          matchRates: {
            perfectMatch: 0,
            cm: 0,
            repetitions: 0,
            repetitionsBetweenFiles: 0,
            match100: 0,
            match95_99: 0,
            match85_94: 0,
            match75_84: 0,
            match50_74: 0,
            referenceAdaptativeMT: 0,
            adaptativeMTWithLearning: 0,
            newWordsTA: 0,
          },
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
      ],
    });
    render(
      <QueryClientProvider client={createQueryClient()}>
        <IntlProvider locale="en" messages={messages.en}>
          <ProjectHeader
            project={makeProject({
              clientId: 3,
              sourceLanguage: "EN",
              targetLanguage: "FR",
            })}
            onUpdate={vi.fn()}
            saving={false}
          />
        </IntlProvider>
      </QueryClientProvider>,
    );
    expect(
      await screen.findByText("Client rate: 0.12 EUR/word (EN-FR standard)"),
    ).toBeInTheDocument();
  });

  it("defaults the rate sheet select to the client's isDefault sheet on save", async () => {
    gqlFetch.mockResolvedValue({
      translationRates: [],
      clientRates: [],
      rateSheets: [
        makeRateSheet({ id: 1, clientId: 3, isDefault: false }),
        makeRateSheet({ id: 2, clientId: 3, isDefault: true }),
      ],
    });
    const onUpdate = vi.fn().mockResolvedValue(undefined);
    render(
      <QueryClientProvider client={createQueryClient()}>
        <IntlProvider locale="en" messages={messages.en}>
          <ProjectHeader
            project={makeProject({ id: 7, clientId: 3 })}
            onUpdate={onUpdate}
            saving={false}
          />
        </IntlProvider>
      </QueryClientProvider>,
    );
    fireEvent.click(await screen.findByText("Edit"));
    await screen.findByLabelText("Client rate sheet");
    fireEvent.click(screen.getByText("Save"));
    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ id: 7, rateSheetId: 2 }),
      ),
    );
  });

  it("defaults to the client's sole rate sheet even when it is not marked isDefault", async () => {
    gqlFetch.mockResolvedValue({
      translationRates: [],
      clientRates: [],
      rateSheets: [makeRateSheet({ id: 5, clientId: 3, isDefault: false })],
    });
    const onUpdate = vi.fn().mockResolvedValue(undefined);
    render(
      <QueryClientProvider client={createQueryClient()}>
        <IntlProvider locale="en" messages={messages.en}>
          <ProjectHeader
            project={makeProject({ id: 7, clientId: 3 })}
            onUpdate={onUpdate}
            saving={false}
          />
        </IntlProvider>
      </QueryClientProvider>,
    );
    fireEvent.click(await screen.findByText("Edit"));
    await screen.findByLabelText("Client rate sheet");
    fireEvent.click(screen.getByText("Save"));
    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ id: 7, rateSheetId: 5 }),
      ),
    );
  });

  it("lets the user pick a non-default rate sheet from the client's list", async () => {
    gqlFetch.mockResolvedValue({
      translationRates: [],
      clientRates: [],
      rateSheets: [
        makeRateSheet({
          id: 1,
          clientId: 3,
          name: "Default sheet",
          isDefault: true,
        }),
        makeRateSheet({
          id: 2,
          clientId: 3,
          name: "Alt sheet",
          isDefault: false,
        }),
      ],
    });
    const onUpdate = vi.fn().mockResolvedValue(undefined);
    render(
      <QueryClientProvider client={createQueryClient()}>
        <IntlProvider locale="en" messages={messages.en}>
          <ProjectHeader
            project={makeProject({ id: 7, clientId: 3 })}
            onUpdate={onUpdate}
            saving={false}
          />
        </IntlProvider>
      </QueryClientProvider>,
    );
    fireEvent.click(await screen.findByText("Edit"));
    fireEvent.click(screen.getByLabelText("Client rate sheet"));
    fireEvent.click(await screen.findByRole("option", { name: /Alt sheet/ }));
    fireEvent.click(screen.getByText("Save"));
    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ id: 7, rateSheetId: 2 }),
      ),
    );
  });

  it("resets the rate sheet default when the client changes", async () => {
    mockApi(
      [
        makeClient({ id: 1, name: "Alpha" }),
        makeClient({ id: 2, name: "Beta" }),
      ],
      {
        rateSheets: [
          makeRateSheet({ id: 10, clientId: 1, isDefault: true }),
          makeRateSheet({ id: 20, clientId: 2, isDefault: true }),
        ],
      },
    );
    const onUpdate = vi.fn().mockResolvedValue(undefined);
    render(
      <QueryClientProvider client={createQueryClient()}>
        <IntlProvider locale="en" messages={messages.en}>
          <MemoryRouter>
            <ProjectHeader
              project={makeProject({ id: 7, clientId: 1 })}
              onUpdate={onUpdate}
              saving={false}
            />
          </MemoryRouter>
        </IntlProvider>
      </QueryClientProvider>,
    );
    fireEvent.click(await screen.findByText("Edit"));
    await screen.findByLabelText("Client rate sheet");
    fireEvent.click(screen.getByLabelText("Client"));
    fireEvent.click(await screen.findByRole("option", { name: "Beta" }));
    fireEvent.click(screen.getByText("Save"));
    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ id: 7, clientId: 2, rateSheetId: 20 }),
      ),
    );
  });

  it("checking 'Use custom rate' reveals monetization inputs and saves useCustomRate", async () => {
    const onUpdate = vi.fn().mockResolvedValue(undefined);
    renderHeader(makeProject({ id: 7 }), [], onUpdate);

    fireEvent.click(screen.getByText("Edit"));
    expect(screen.queryByLabelText("Fixed fee")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("checkbox", { name: /use custom rate/i }));
    expect(screen.getByLabelText("Fixed fee")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Save"));
    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ id: 7, useCustomRate: true }),
      ),
    );
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
          occupationId: null,
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
        <IntlProvider locale="en" messages={messages.en}>
          <ProjectHeader
            project={makeProject()}
            onUpdate={vi.fn()}
            saving={false}
          />
        </IntlProvider>
      </QueryClientProvider>,
    );
    fireEvent.click(screen.getByText("Edit"));
    fireEvent.click(screen.getByRole("checkbox", { name: /use custom rate/i }));

    expect(await screen.findAllByText("From rate…")).toHaveLength(1);
  });

  it("picking a rate from the RatePicker fills the amount and currency", async () => {
    gqlFetch.mockResolvedValue({
      translationRates: [
        {
          id: 1,
          userId: 1,
          name: "Standard hourly",
          amount: 30,
          currency: "USD",
          type: "HOURLY",
          description: null,
          occupationId: null,
          clientId: null,
          sourceLanguage: null,
          targetLanguage: null,
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
      ],
      clientRates: [],
    });
    const onUpdate = vi.fn().mockResolvedValue(undefined);
    render(
      <QueryClientProvider client={createQueryClient()}>
        <IntlProvider locale="en" messages={messages.en}>
          <ProjectHeader
            project={makeProject({ id: 7 })}
            onUpdate={onUpdate}
            saving={false}
          />
        </IntlProvider>
      </QueryClientProvider>,
    );
    fireEvent.click(screen.getByText("Edit"));
    fireEvent.click(screen.getByRole("checkbox", { name: /use custom rate/i }));
    fireEvent.click(await screen.findByText("From rate…"));
    fireEvent.click(
      screen.getByRole("option", { name: "Standard hourly — 30 USD" }),
    );

    expect(screen.getByLabelText("Hourly rate")).toHaveValue(30);
    expect(screen.getByLabelText("Currency")).toHaveValue("USD");

    fireEvent.click(screen.getByText("Save"));
    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ id: 7, hourlyRate: 30, currency: "USD" }),
      ),
    );
  });

  it.each([
    ["PER_WORD", "Literary", 0.12, "perWordRate"],
    ["FIXED", "Proofread pack", 250, "fixedFee"],
  ] as const)(
    "picking a %s rate fills only its own field and the currency",
    async (type, name, amount, field) => {
      gqlFetch.mockResolvedValue({
        translationRates: [
          {
            id: 1,
            userId: 1,
            name,
            amount,
            currency: "GBP",
            type,
            description: null,
            occupationId: null,
            clientId: null,
            sourceLanguage: null,
            targetLanguage: null,
            createdAt: "2026-01-01T00:00:00.000Z",
            updatedAt: "2026-01-01T00:00:00.000Z",
          },
        ],
        clientRates: [],
      });
      const onUpdate = vi.fn().mockResolvedValue(undefined);
      render(
        <QueryClientProvider client={createQueryClient()}>
          <IntlProvider locale="en" messages={messages.en}>
            <ProjectHeader
              project={makeProject({ id: 7 })}
              onUpdate={onUpdate}
              saving={false}
            />
          </IntlProvider>
        </QueryClientProvider>,
      );
      fireEvent.click(screen.getByText("Edit"));
      fireEvent.click(
        screen.getByRole("checkbox", { name: /use custom rate/i }),
      );
      const pickers = await screen.findAllByText("From rate…");
      expect(pickers).toHaveLength(1);
      fireEvent.click(pickers[0]);
      fireEvent.click(
        screen.getByRole("option", { name: `${name} — ${amount} GBP` }),
      );
      fireEvent.click(screen.getByText("Save"));

      await waitFor(() =>
        expect(onUpdate).toHaveBeenCalledWith(
          expect.objectContaining({ [field]: amount, currency: "GBP" }),
        ),
      );
    },
    15_000,
  );

  it("selecting a client and saving sends the numeric clientId", async () => {
    const onUpdate = vi.fn().mockResolvedValue(undefined);
    renderHeader(
      makeProject({ id: 7 }),
      [makeClient({ id: 2, name: "Beta Corp" })],
      onUpdate,
    );

    fireEvent.click(screen.getByText("Edit"));
    fireEvent.click(screen.getByLabelText("Client"));
    fireEvent.click(await screen.findByRole("option", { name: "Beta Corp" }));
    fireEvent.click(screen.getByText("Save"));

    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ id: 7, clientId: 2 }),
      ),
    );
  });

  it("changing the status and saving sends the new status", async () => {
    const onUpdate = vi.fn().mockResolvedValue(undefined);
    renderHeader(makeProject({ id: 7, status: "ACTIVE" }), [], onUpdate);

    fireEvent.click(screen.getByText("Edit"));
    fireEvent.click(screen.getByLabelText("Status"));
    fireEvent.click(screen.getByRole("option", { name: "COMPLETED" }));
    fireEvent.click(screen.getByText("Save"));

    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ id: 7, status: "COMPLETED" }),
      ),
    );
  });

  it("clearing monetization fields and leaving word count blank sends null", async () => {
    const onUpdate = vi.fn().mockResolvedValue(undefined);
    renderHeader(
      makeProject({
        id: 7,
        useCustomRate: true,
        rateSheetId: null,
        fixedFee: 100,
        hourlyRate: 25,
        perWordRate: 0.1,
        wordCount: null,
      }),
      [],
      onUpdate,
    );

    fireEvent.click(screen.getByText("Edit"));
    fireEvent.change(screen.getByLabelText("Fixed fee"), {
      target: { value: "" },
    });
    fireEvent.change(screen.getByLabelText("Hourly rate"), {
      target: { value: "" },
    });
    fireEvent.change(screen.getByLabelText("Per-word rate"), {
      target: { value: "" },
    });
    fireEvent.click(screen.getByText("Save"));

    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 7,
          fixedFee: null,
          hourlyRate: null,
          perWordRate: null,
          wordCount: null,
        }),
      ),
    );
  });

  it("clearing description, languages, word count and dates sends null so they are erased", async () => {
    const onUpdate = vi.fn().mockResolvedValue(undefined);
    renderHeader(
      makeProject({
        id: 7,
        description: "Old desc",
        sourceLanguage: "EN",
        targetLanguage: "FR",
        wordCount: 1000,
        startDate: "2026-01-01T00:00:00.000Z",
        deadline: "2026-02-01T00:00:00.000Z",
      }),
      [],
      onUpdate,
    );

    fireEvent.click(screen.getByText("Edit"));
    fireEvent.change(screen.getByLabelText("Description"), {
      target: { value: "" },
    });
    fireEvent.click(screen.getByLabelText("Source language"));
    fireEvent.click(screen.getByRole("option", { name: "—" }));
    fireEvent.click(screen.getByLabelText("Target language"));
    fireEvent.click(screen.getByRole("option", { name: "—" }));
    fireEvent.change(screen.getByLabelText("Word count"), {
      target: { value: "" },
    });
    fireEvent.change(screen.getByLabelText("Start date"), {
      target: { value: "" },
    });
    fireEvent.change(screen.getByLabelText("Deadline"), {
      target: { value: "" },
    });
    fireEvent.click(screen.getByText("Save"));

    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 7,
          description: null,
          sourceLanguage: null,
          targetLanguage: null,
          wordCount: null,
          startDate: null,
          deadline: null,
        }),
      ),
    );
  }, 15_000);

  it("renders French copy when locale is fr", () => {
    renderHeader(
      makeProject({
        useCustomRate: true,
        hourlyRate: 25,
        currency: "USD",
      }),
      [],
      vi.fn(),
      "fr",
    );

    expect(screen.getByText("25/h USD")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Modifier"));
    expect(screen.getByLabelText("Titre")).toBeInTheDocument();
    expect(screen.getByText("Enregistrer")).toBeInTheDocument();
    expect(screen.getByText("Annuler")).toBeInTheDocument();
  });
});
