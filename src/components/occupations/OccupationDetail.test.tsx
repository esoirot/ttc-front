import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { gqlFetch, gqlMutate } = vi.hoisted(() => ({
  gqlFetch: vi.fn(),
  gqlMutate: vi.fn(),
}));

vi.mock("@/lib/apollo", () => ({ gqlFetch, gqlMutate }));

const navigateMock = vi.fn();
const paramsMock = vi.fn(() => ({ id: "5" }));
vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom",
    );
  return {
    ...actual,
    useNavigate: () => navigateMock,
    useParams: () => paramsMock(),
  };
});

import { QueryClientProvider } from "@tanstack/react-query";
import { createQueryClient } from "@/test/queryClientWrapper";
import { IntlProvider } from "react-intl";
import { messages } from "@/i18n/messages";
import { defaultMatchRates } from "@/constants/matchRateItems";
import type {
  AnyOccupation,
  Charge,
  TranslationRate,
} from "@/types/occupations.types";
import type { RateSheet } from "@/types/rate-sheets.types";
import { OccupationDetail } from "./OccupationDetail";

function makeCharge(overrides: Partial<Charge> = {}): Charge {
  return {
    id: 1,
    occupationId: 5,
    name: "Travel",
    amount: 2000,
    type: "FIXED",
    ...overrides,
  };
}

function makeRate(overrides: Partial<TranslationRate> = {}): TranslationRate {
  return {
    id: 1,
    userId: 1,
    occupationId: 5,
    clientId: null,
    type: "HOURLY",
    name: "Standard",
    amount: 50,
    currency: "EUR",
    description: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function makeRateSheet(overrides: Partial<RateSheet> = {}): RateSheet {
  return {
    id: 1,
    userId: 1,
    occupationId: 5,
    clientId: null,
    name: "General",
    description: null,
    sourceLanguage: "EN",
    targetLanguage: "FR",
    currency: "EUR",
    pricePerWord: 0.1,
    matchRates: defaultMatchRates(),
    isDefault: false,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function makeOccupation(overrides: Partial<AnyOccupation> = {}): AnyOccupation {
  return {
    id: 5,
    userId: 1,
    name: "Freelance",
    occupationType: "CUSTOM",
    charges: [],
    translationRates: [],
    customFields: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  } as AnyOccupation;
}

function mockGql(responses: Record<string, unknown>) {
  gqlFetch.mockImplementation(
    (doc: { definitions: { kind: string; name?: { value: string } }[] }) => {
      const op = doc.definitions.find((d) => d.kind === "OperationDefinition");
      const name = op?.name?.value ?? "";
      if (name in responses) return Promise.resolve(responses[name]);
      return Promise.resolve({});
    },
  );
}

function renderDetail(locale: "en" | "fr" = "en") {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <IntlProvider locale={locale} messages={messages[locale]}>
        <OccupationDetail />
      </IntlProvider>
    </QueryClientProvider>,
  );
}

describe("OccupationDetail", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
    navigateMock.mockReset();
    paramsMock.mockReturnValue({ id: "5" });
  });

  it("shows a loading state while the occupation is fetching", () => {
    gqlFetch.mockReturnValue(new Promise(() => {}));
    renderDetail();

    expect(screen.getByText("Loading…")).toBeInTheDocument();
  });

  it("shows 'Occupation not found.' and a back link when the occupation is null", async () => {
    mockGql({
      Occupation: { occupation: null },
      MyOccupations: { myOccupations: [] },
      Clients: { clients: { items: [], total: 0, nextCursor: null } },
      Me: { me: null },
      RateSheets: { rateSheets: [] },
      Tags: { tags: [] },
    });
    renderDetail();

    expect(
      await screen.findByText("Occupation not found."),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByText("← Back to occupations"));
    expect(navigateMock).toHaveBeenCalledWith("/occupations");
  });

  it("renders French copy when locale is fr", async () => {
    mockGql({
      Occupation: { occupation: null },
      MyOccupations: { myOccupations: [] },
      Clients: { clients: { items: [], total: 0, nextCursor: null } },
      Me: { me: null },
      RateSheets: { rateSheets: [] },
      Tags: { tags: [] },
    });
    renderDetail("fr");

    expect(await screen.findByText("Métier introuvable.")).toBeInTheDocument();
    expect(screen.getByText("← Retour aux métiers")).toBeInTheDocument();
  });

  it("renders the core sections for a CUSTOM occupation with no charges/rates", async () => {
    mockGql({
      Occupation: { occupation: makeOccupation() },
      MyOccupations: { myOccupations: [] },
      Clients: { clients: { items: [], total: 0, nextCursor: null } },
      Me: { me: null },
      RateSheets: { rateSheets: [] },
      Tags: { tags: [] },
    });
    renderDetail();

    expect(await screen.findByText("Freelance")).toBeInTheDocument();
    expect(screen.getByText("Objectives")).toBeInTheDocument();
    expect(screen.getByText("No fixed charges.")).toBeInTheDocument();
    expect(screen.getByText("No variable charges.")).toBeInTheDocument();
    expect(screen.getByText("No rates yet.")).toBeInTheDocument();
    expect(screen.queryByText("Language Pairs")).not.toBeInTheDocument();
  });

  it("renders fixed and variable charges grouped under their headings", async () => {
    mockGql({
      Occupation: {
        occupation: makeOccupation({
          charges: [
            makeCharge({ id: 1, name: "Travel", type: "FIXED" }),
            makeCharge({ id: 2, name: "Software", type: "VARIABLE" }),
          ],
        }),
      },
      MyOccupations: { myOccupations: [] },
      Clients: { clients: { items: [], total: 0, nextCursor: null } },
      Me: { me: null },
      RateSheets: { rateSheets: [] },
      Tags: { tags: [] },
    });
    renderDetail();

    await screen.findByText("Freelance");
    expect(screen.getByText("Travel")).toBeInTheDocument();
    expect(screen.getByText("Software")).toBeInTheDocument();
  });

  it("shows editable custom fields only for a CUSTOM occupation", async () => {
    mockGql({
      Occupation: {
        occupation: makeOccupation({
          customFields: [
            { id: 1, occupationId: 5, key: "Platform", value: "Upwork" },
          ],
        }),
      },
      MyOccupations: { myOccupations: [] },
      Clients: { clients: { items: [], total: 0, nextCursor: null } },
      Me: { me: null },
      RateSheets: { rateSheets: [] },
      Tags: { tags: [] },
    });
    renderDetail();

    await screen.findByText("Freelance");
    expect(screen.getByText("Custom fields")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Platform")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Upwork")).toBeInTheDocument();
  });

  it("shows the new occupation's custom fields after switching occupations", async () => {
    const byId: Record<number, AnyOccupation> = {
      5: makeOccupation({
        customFields: [
          { id: 1, occupationId: 5, key: "Platform", value: "Upwork" },
        ],
      }),
      6: makeOccupation({
        id: 6,
        name: "Agency",
        customFields: [
          { id: 2, occupationId: 6, key: "Agency", value: "Acme" },
        ],
      }),
    };
    gqlFetch.mockImplementation(
      (
        doc: { definitions: { kind: string; name?: { value: string } }[] },
        vars?: { id?: number },
      ) => {
        const op = doc.definitions.find(
          (d) => d.kind === "OperationDefinition",
        );
        const name = op?.name?.value ?? "";
        if (name === "Occupation")
          return Promise.resolve({ occupation: byId[vars?.id ?? 0] });
        if (name === "Clients")
          return Promise.resolve({
            clients: { items: [], total: 0, nextCursor: null },
          });
        return Promise.resolve({
          myOccupations: [],
          me: null,
          rateSheets: [],
          tags: [],
        });
      },
    );
    const { rerender } = renderDetail();
    expect(await screen.findByDisplayValue("Upwork")).toBeInTheDocument();

    paramsMock.mockReturnValue({ id: "6" });
    rerender(
      <QueryClientProvider client={createQueryClient()}>
        <IntlProvider locale="en" messages={messages.en}>
          <OccupationDetail />
        </IntlProvider>
      </QueryClientProvider>,
    );

    expect(await screen.findByDisplayValue("Acme")).toBeInTheDocument();
    expect(screen.queryByDisplayValue("Upwork")).not.toBeInTheDocument();
  });

  it("hides custom fields for a TRANSLATOR occupation", async () => {
    mockGql({
      Occupation: {
        occupation: makeOccupation({
          occupationType: "TRANSLATOR",
          languagePairs: [],
        }),
      },
      MyOccupations: { myOccupations: [] },
      Clients: { clients: { items: [], total: 0, nextCursor: null } },
      Me: { me: null },
      RateSheets: { rateSheets: [] },
      Tags: { tags: [] },
    });
    renderDetail();

    await screen.findByText("Freelance");
    expect(screen.queryByText("Custom fields")).not.toBeInTheDocument();
  });

  it("shows the Language Pairs card only for a TRANSLATOR occupation", async () => {
    mockGql({
      Occupation: {
        occupation: makeOccupation({
          occupationType: "TRANSLATOR",
          languagePairs: [
            { id: 1, occupationId: 5, fromLanguage: "EN", toLanguage: "FR" },
          ],
        }),
      },
      MyOccupations: { myOccupations: [] },
      Clients: { clients: { items: [], total: 0, nextCursor: null } },
      Me: { me: null },
      RateSheets: { rateSheets: [] },
      Tags: { tags: [] },
    });
    renderDetail();

    await screen.findByText("Freelance");
    expect(screen.getByText("Language Pairs")).toBeInTheDocument();
  });

  it("lists existing rates grouped by type and deletes one via the confirm dialog", async () => {
    gqlMutate.mockResolvedValueOnce({ deleteTranslationRate: true });
    mockGql({
      Occupation: {
        occupation: makeOccupation({
          translationRates: [
            makeRate({ id: 9, name: "Standard", type: "HOURLY" }),
          ],
        }),
      },
      MyOccupations: { myOccupations: [] },
      Clients: { clients: { items: [], total: 0, nextCursor: null } },
      Me: { me: null },
      RateSheets: { rateSheets: [] },
      Tags: { tags: [] },
    });
    renderDetail();

    await screen.findByText("Standard");
    expect(screen.getByText("Hourly")).toBeInTheDocument();

    fireEvent.click(screen.getByText("✕"));
    fireEvent.click(screen.getByText("Delete"));

    await waitFor(() =>
      expect(gqlMutate).toHaveBeenCalledWith(expect.anything(), { id: 9 }),
    );
  });

  it("opens the Add Rate form defaulted to HOURLY and creates a rate", async () => {
    gqlMutate.mockResolvedValueOnce({
      createTranslationRate: makeRate({ id: 10, name: "New rate" }),
    });
    mockGql({
      Occupation: { occupation: makeOccupation() },
      MyOccupations: { myOccupations: [] },
      Clients: { clients: { items: [], total: 0, nextCursor: null } },
      Me: { me: { id: 1, defaultCurrency: "EUR" } },
      RateSheets: { rateSheets: [] },
      Tags: { tags: [] },
    });
    renderDetail();

    await screen.findByText("Freelance");
    fireEvent.click(screen.getByText("+ Add Rate"));

    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "New rate" },
    });
    fireEvent.change(screen.getByLabelText(/Amount/), {
      target: { value: "25" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add Rate" }));

    await waitFor(() =>
      expect(gqlMutate).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          input: expect.objectContaining({
            type: "HOURLY",
            name: "New rate",
            amount: 25,
          }),
        }),
      ),
    );
  });

  it("shows rate sheets scoped to the occupation for TRANSLATOR occupations and deletes one", async () => {
    gqlMutate.mockResolvedValueOnce({ deleteRateSheet: true });
    mockGql({
      Occupation: {
        occupation: makeOccupation({
          occupationType: "TRANSLATOR",
          languagePairs: [],
        }),
      },
      MyOccupations: { myOccupations: [] },
      Clients: { clients: { items: [], total: 0, nextCursor: null } },
      Me: { me: null },
      RateSheets: {
        rateSheets: [
          makeRateSheet({ id: 3, occupationId: 5, name: "General" }),
          makeRateSheet({ id: 4, occupationId: 999, name: "Other occupation" }),
        ],
      },
      Tags: { tags: [] },
    });
    renderDetail();

    await screen.findByText("General");
    expect(screen.queryByText("Other occupation")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("✕"));
    fireEvent.click(screen.getByText("Delete"));

    await waitFor(() =>
      expect(gqlMutate).toHaveBeenCalledWith(expect.anything(), { id: 3 }),
    );
  });
});
