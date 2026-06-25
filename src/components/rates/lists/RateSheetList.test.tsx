import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { gqlFetch, gqlMutate } = vi.hoisted(() => ({
  gqlFetch: vi.fn(),
  gqlMutate: vi.fn(),
}));
vi.mock("@/lib/apollo", () => ({ gqlFetch, gqlMutate }));

let rateSheetFormProps: Record<string, unknown> = {};
vi.mock("../forms/RateSheetForm", () => ({
  RateSheetForm: (props: Record<string, unknown>) => {
    rateSheetFormProps = props;
    return <div data-testid="rate-sheet-form" />;
  },
}));

let rateSheetRowProps: Record<string, unknown>[] = [];
vi.mock("../rows/RateSheetRow", () => ({
  RateSheetRow: (props: Record<string, unknown>) => {
    rateSheetRowProps.push(props);
    return (
      <div data-testid="rate-sheet-row">
        {(props.sheet as { name: string }).name}
      </div>
    );
  },
}));

import { QueryClientProvider } from "@tanstack/react-query";
import { createQueryClient } from "@/test/queryClientWrapper";
import { defaultMatchRates } from "@/constants/matchRateItems";
import type { RateSheet } from "@/types/rate-sheets.types";
import { RateSheetList } from "./RateSheetList";

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

function renderList() {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <RateSheetList />
    </QueryClientProvider>,
  );
}

describe("RateSheetList", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
    rateSheetFormProps = {};
    rateSheetRowProps = [];
  });

  it("shows skeletons while loading", () => {
    gqlFetch.mockReturnValue(new Promise(() => {}));
    const { container } = renderList();

    expect(
      container.querySelectorAll('[class*="animate-pulse"]').length,
    ).toBeGreaterThan(0);
  });

  it("shows the empty state when there are no rate sheets", async () => {
    mockGql({
      RateSheets: { rateSheets: [] },
      Clients: { clients: { items: [], total: 0, nextCursor: null } },
    });
    renderList();

    expect(
      await screen.findByText(
        "No rate sheets yet. Create your first translation rate sheet below.",
      ),
    ).toBeInTheDocument();
  });

  it("renders a RateSheetRow per sheet", async () => {
    mockGql({
      RateSheets: {
        rateSheets: [
          makeRateSheet({ id: 1, name: "A" }),
          makeRateSheet({ id: 2, name: "B" }),
        ],
      },
      Clients: { clients: { items: [], total: 0, nextCursor: null } },
    });
    renderList();

    expect(await screen.findAllByTestId("rate-sheet-row")).toHaveLength(2);
  });

  it("resolves clientName from the clients list by clientId", async () => {
    mockGql({
      RateSheets: {
        rateSheets: [makeRateSheet({ id: 1, clientId: 3 })],
      },
      Clients: {
        clients: {
          items: [{ id: 3, name: "Acme" }],
          total: 1,
          nextCursor: null,
        },
      },
    });
    renderList();

    await screen.findByTestId("rate-sheet-row");
    expect(rateSheetRowProps[0].clientName).toBe("Acme");
  });

  it("shows the '+ New Rate Sheet' button when the form is closed", async () => {
    mockGql({
      RateSheets: { rateSheets: [] },
      Clients: { clients: { items: [], total: 0, nextCursor: null } },
    });
    renderList();

    expect(await screen.findByText("+ New Rate Sheet")).toBeInTheDocument();
  });

  it("clicking + New Rate Sheet shows the create form", async () => {
    mockGql({
      RateSheets: { rateSheets: [] },
      Clients: { clients: { items: [], total: 0, nextCursor: null } },
    });
    renderList();

    fireEvent.click(await screen.findByText("+ New Rate Sheet"));

    expect(screen.getByTestId("rate-sheet-form")).toBeInTheDocument();
    expect(screen.queryByText("+ New Rate Sheet")).not.toBeInTheDocument();
  });

  it("creates a rate sheet via the form's onSave and closes the form", async () => {
    gqlMutate.mockResolvedValueOnce({
      createRateSheet: makeRateSheet({ id: 5, name: "New" }),
    });
    mockGql({
      RateSheets: { rateSheets: [] },
      Clients: { clients: { items: [], total: 0, nextCursor: null } },
    });
    renderList();

    fireEvent.click(await screen.findByText("+ New Rate Sheet"));
    await act(async () => {
      await (rateSheetFormProps.onSave as (data: unknown) => Promise<void>)({
        name: "New",
      });
    });

    expect(gqlMutate).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ input: { name: "New" } }),
    );
  });

  it("clicking a row's onEdit shows the RateSheetForm pre-filled with that sheet", async () => {
    mockGql({
      RateSheets: { rateSheets: [makeRateSheet({ id: 9, name: "Edit me" })] },
      Clients: { clients: { items: [], total: 0, nextCursor: null } },
    });
    renderList();

    await screen.findByTestId("rate-sheet-row");
    act(() => {
      (rateSheetRowProps[0].onEdit as () => void)();
    });

    expect(screen.getByTestId("rate-sheet-form")).toBeInTheDocument();
    expect(rateSheetFormProps.initial).toEqual(
      expect.objectContaining({ id: 9, name: "Edit me" }),
    );
  });

  it("edit form's onSave calls updateRateSheet with the sheet id merged in", async () => {
    gqlMutate.mockResolvedValueOnce({
      updateRateSheet: makeRateSheet({ id: 9, name: "Renamed" }),
    });
    mockGql({
      RateSheets: { rateSheets: [makeRateSheet({ id: 9, name: "Old" })] },
      Clients: { clients: { items: [], total: 0, nextCursor: null } },
    });
    renderList();

    await screen.findByTestId("rate-sheet-row");
    act(() => {
      (rateSheetRowProps[0].onEdit as () => void)();
    });
    await act(async () => {
      await (rateSheetFormProps.onSave as (data: unknown) => Promise<void>)({
        name: "Renamed",
      });
    });

    expect(gqlMutate).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ input: { id: 9, name: "Renamed" } }),
    );
  });

  it("row's onDelete calls deleteRateSheet with that sheet's id", async () => {
    gqlMutate.mockResolvedValueOnce({ deleteRateSheet: true });
    mockGql({
      RateSheets: { rateSheets: [makeRateSheet({ id: 9 })] },
      Clients: { clients: { items: [], total: 0, nextCursor: null } },
    });
    renderList();

    await screen.findByTestId("rate-sheet-row");
    (rateSheetRowProps[0].onDelete as () => void)();

    await waitFor(() =>
      expect(gqlMutate).toHaveBeenCalledWith(expect.anything(), { id: 9 }),
    );
  });
});
