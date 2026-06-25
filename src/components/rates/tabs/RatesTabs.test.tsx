import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { gqlFetch, gqlMutate } = vi.hoisted(() => ({
  gqlFetch: vi.fn(),
  gqlMutate: vi.fn(),
}));
vi.mock("@/lib/apollo", () => ({ gqlFetch, gqlMutate }));

vi.mock("../sections/OverviewSection", () => ({
  OverviewSection: ({
    type,
    rates,
  }: {
    type: string;
    rates: { id: number }[];
  }) => (
    <div data-testid={`overview-${type}`}>
      {type}:{rates.length}
    </div>
  ),
}));
vi.mock("../lists/RateList", () => ({
  RateList: ({ type }: { type: string }) => (
    <div data-testid="rate-list">{type}</div>
  ),
}));
vi.mock("../lists/RateSheetList", () => ({
  RateSheetList: () => <div data-testid="rate-sheet-list" />,
}));

let rateSheetFormProps: Record<string, unknown> = {};
vi.mock("../forms/RateSheetForm", () => ({
  RateSheetForm: (props: Record<string, unknown>) => {
    rateSheetFormProps = props;
    return <div data-testid="rate-sheet-form" />;
  },
}));

import { QueryClientProvider } from "@tanstack/react-query";
import { createQueryClient } from "@/test/queryClientWrapper";
import type { TranslationRate } from "@/types/rates.types";
import type { RateSheet } from "@/types/rate-sheets.types";
import { defaultMatchRates } from "@/constants/matchRateItems";
import { RatesTabs } from "./RatesTabs";

function makeRate(overrides: Partial<TranslationRate> = {}): TranslationRate {
  return {
    id: 1,
    userId: 1,
    activityId: null,
    clientId: null,
    type: "HOURLY",
    name: "Standard",
    amount: 50,
    currency: "EUR",
    description: null,
    sourceLanguage: null,
    targetLanguage: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function makeRateSheet(overrides: Partial<RateSheet> = {}): RateSheet {
  return {
    id: 1,
    userId: 1,
    activityId: null,
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

function renderTabs() {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <RatesTabs />
    </QueryClientProvider>,
  );
}

describe("RatesTabs", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
    rateSheetFormProps = {};
  });

  it("shows skeletons while loading with nothing yet", () => {
    gqlFetch.mockReturnValue(new Promise(() => {}));
    const { container } = renderTabs();

    expect(
      container.querySelectorAll('[class*="animate-pulse"]').length,
    ).toBeGreaterThan(0);
  });

  it("shows the empty state when there are no rates and no rate sheets", async () => {
    mockGql({
      TranslationRates: { translationRates: [] },
      RateSheets: { rateSheets: [] },
    });
    renderTabs();

    expect(
      await screen.findByText(
        "No rates defined yet. Use the tabs above to add your first rate.",
      ),
    ).toBeInTheDocument();
  });

  it("renders an OverviewSection per rate type with the correctly filtered rates", async () => {
    mockGql({
      TranslationRates: {
        translationRates: [
          makeRate({ id: 1, type: "HOURLY" }),
          makeRate({ id: 2, type: "PER_WORD" }),
          makeRate({ id: 3, type: "PER_WORD" }),
        ],
      },
      RateSheets: { rateSheets: [] },
    });
    renderTabs();

    expect(await screen.findByTestId("overview-HOURLY")).toHaveTextContent(
      "HOURLY:1",
    );
    expect(screen.getByTestId("overview-PER_WORD")).toHaveTextContent(
      "PER_WORD:2",
    );
    expect(screen.getByTestId("overview-DAY")).toHaveTextContent("DAY:0");
    expect(screen.getByTestId("overview-FIXED")).toHaveTextContent("FIXED:0");
  });

  it("shows a badge count on each tab trigger only when non-zero", async () => {
    mockGql({
      TranslationRates: {
        translationRates: [makeRate({ id: 1, type: "HOURLY" })],
      },
      RateSheets: { rateSheets: [makeRateSheet()] },
    });
    renderTabs();

    await screen.findByTestId("overview-HOURLY");
    const hourlyTab = screen.getByRole("tab", { name: /Hourly/ });
    expect(hourlyTab).toHaveTextContent("1");
    const dayTab = screen.getByRole("tab", { name: /Day Rate/ });
    expect(dayTab).not.toHaveTextContent(/\d/);
    const sheetsTab = screen.getByRole("tab", { name: /Rate Sheets/ });
    expect(sheetsTab).toHaveTextContent("1");
  });

  it("lists existing rate sheets in the overview tab", async () => {
    mockGql({
      TranslationRates: { translationRates: [] },
      RateSheets: { rateSheets: [makeRateSheet({ name: "General" })] },
    });
    renderTabs();

    expect(await screen.findByText("General")).toBeInTheDocument();
    expect(screen.getByText("EN → FR")).toBeInTheDocument();
  });

  it("toggles the add-rate-sheet form and creates a sheet on save", async () => {
    gqlMutate.mockResolvedValueOnce({
      createRateSheet: makeRateSheet({ id: 2, name: "New sheet" }),
    });
    mockGql({
      TranslationRates: { translationRates: [makeRate({ id: 1 })] },
      RateSheets: { rateSheets: [] },
    });
    renderTabs();

    await screen.findByText("No rate sheets defined.");
    fireEvent.click(screen.getByText("+ Add"));

    expect(screen.getByTestId("rate-sheet-form")).toBeInTheDocument();

    await (rateSheetFormProps.onSave as (data: unknown) => Promise<void>)({
      name: "New sheet",
    });

    expect(gqlMutate).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ input: { name: "New sheet" } }),
    );
  });

  it("clicking Edit on a rate sheet shows RateSheetForm pre-filled, and onSave updates it", async () => {
    gqlMutate.mockResolvedValueOnce({
      updateRateSheet: makeRateSheet({ id: 1, name: "Renamed" }),
    });
    mockGql({
      TranslationRates: { translationRates: [] },
      RateSheets: { rateSheets: [makeRateSheet({ id: 1, name: "General" })] },
    });
    renderTabs();

    await screen.findByText("General");
    fireEvent.click(screen.getByText("Edit"));

    expect(rateSheetFormProps.initial).toEqual(
      expect.objectContaining({ id: 1, name: "General" }),
    );

    await (rateSheetFormProps.onSave as (data: unknown) => Promise<void>)({
      name: "Renamed",
    });

    expect(gqlMutate).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        input: { id: 1, name: "Renamed" },
      }),
    );
  });

  it("switches to the Hourly tab and renders RateList for that type", async () => {
    mockGql({
      TranslationRates: { translationRates: [] },
      RateSheets: { rateSheets: [] },
    });
    renderTabs();

    await screen.findByText(
      "No rates defined yet. Use the tabs above to add your first rate.",
    );
    fireEvent.focus(screen.getByRole("tab", { name: /Hourly/ }));

    expect(screen.getByTestId("rate-list")).toHaveTextContent("HOURLY");
  });

  it("switches to the Rate Sheets tab and renders RateSheetList", async () => {
    mockGql({
      TranslationRates: { translationRates: [] },
      RateSheets: { rateSheets: [] },
    });
    renderTabs();

    await screen.findByText(
      "No rates defined yet. Use the tabs above to add your first rate.",
    );
    fireEvent.focus(screen.getByRole("tab", { name: /Rate Sheets/ }));

    expect(screen.getByTestId("rate-sheet-list")).toBeInTheDocument();
  });
});
