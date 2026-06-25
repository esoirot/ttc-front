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
import { defaultMatchRates } from "@/constants/matchRateItems";
import type {
  AnyActivity,
  Charge,
  TranslationRate,
} from "@/types/activities.types";
import type { RateSheet } from "@/types/rate-sheets.types";
import { ActivityDetail } from "./ActivityDetail";

function makeCharge(overrides: Partial<Charge> = {}): Charge {
  return {
    id: 1,
    activityId: 5,
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
    activityId: 5,
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
    activityId: 5,
    clientId: null,
    name: "General",
    description: null,
    sourceLanguage: "EN",
    targetLanguage: "FR",
    currency: "EUR",
    pricePerWord: 0.1,
    matchRates: defaultMatchRates(),
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function makeActivity(overrides: Partial<AnyActivity> = {}): AnyActivity {
  return {
    id: 5,
    userId: 1,
    name: "Freelance",
    activityType: "CUSTOM",
    charges: [],
    translationRates: [],
    customFields: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  } as AnyActivity;
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

function renderDetail() {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <ActivityDetail />
    </QueryClientProvider>,
  );
}

describe("ActivityDetail", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
    navigateMock.mockReset();
    paramsMock.mockReturnValue({ id: "5" });
  });

  it("shows a loading state while the activity is fetching", () => {
    gqlFetch.mockReturnValue(new Promise(() => {}));
    renderDetail();

    expect(screen.getByText("Loading…")).toBeInTheDocument();
  });

  it("shows 'Activity not found.' and a back link when the activity is null", async () => {
    mockGql({
      Activity: { activity: null },
      MyActivities: { myActivities: [] },
      Clients: { clients: { items: [], total: 0, nextCursor: null } },
      Me: { me: null },
      RateSheets: { rateSheets: [] },
      Tags: { tags: [] },
    });
    renderDetail();

    expect(await screen.findByText("Activity not found.")).toBeInTheDocument();
    fireEvent.click(screen.getByText("← Back to activities"));
    expect(navigateMock).toHaveBeenCalledWith("/activities");
  });

  it("renders the core sections for a CUSTOM activity with no charges/rates", async () => {
    mockGql({
      Activity: { activity: makeActivity() },
      MyActivities: { myActivities: [] },
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
      Activity: {
        activity: makeActivity({
          charges: [
            makeCharge({ id: 1, name: "Travel", type: "FIXED" }),
            makeCharge({ id: 2, name: "Software", type: "VARIABLE" }),
          ],
        }),
      },
      MyActivities: { myActivities: [] },
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

  it("shows the Language Pairs card only for a TRANSLATOR activity", async () => {
    mockGql({
      Activity: {
        activity: makeActivity({
          activityType: "TRANSLATOR",
          languagePairs: [
            { id: 1, activityId: 5, fromLanguage: "EN", toLanguage: "FR" },
          ],
        }),
      },
      MyActivities: { myActivities: [] },
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
      Activity: {
        activity: makeActivity({
          translationRates: [
            makeRate({ id: 9, name: "Standard", type: "HOURLY" }),
          ],
        }),
      },
      MyActivities: { myActivities: [] },
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
      Activity: { activity: makeActivity() },
      MyActivities: { myActivities: [] },
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

  it("shows rate sheets scoped to the activity for TRANSLATOR activities and deletes one", async () => {
    gqlMutate.mockResolvedValueOnce({ deleteRateSheet: true });
    mockGql({
      Activity: {
        activity: makeActivity({
          activityType: "TRANSLATOR",
          languagePairs: [],
        }),
      },
      MyActivities: { myActivities: [] },
      Clients: { clients: { items: [], total: 0, nextCursor: null } },
      Me: { me: null },
      RateSheets: {
        rateSheets: [
          makeRateSheet({ id: 3, activityId: 5, name: "General" }),
          makeRateSheet({ id: 4, activityId: 999, name: "Other activity" }),
        ],
      },
      Tags: { tags: [] },
    });
    renderDetail();

    await screen.findByText("General");
    expect(screen.queryByText("Other activity")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("✕"));
    fireEvent.click(screen.getByText("Delete"));

    await waitFor(() =>
      expect(gqlMutate).toHaveBeenCalledWith(expect.anything(), { id: 3 }),
    );
  });
});
