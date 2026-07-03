import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { HubspotDeal } from "@/types/hubspot.types";

const useInfiniteHubspotDealsMock = vi.fn();
const useSearchHubspotDealsMock = vi.fn();
const useCreateDealMock = vi.fn();

vi.mock("@/hooks/integrations/useHubspot", () => ({
  useInfiniteHubspotDeals: () => useInfiniteHubspotDealsMock(),
  useSearchHubspotDeals: (query: string) => useSearchHubspotDealsMock(query),
  useCreateDeal: () => useCreateDealMock(),
}));

import { DealsTab } from "./DealsTab";

function makeDeal(
  overrides: Partial<HubspotDeal["properties"]> = {},
  id = "1",
): HubspotDeal {
  return {
    id,
    properties: {
      dealname: "Big Contract",
      amount: "1000",
      dealstage: "negotiation",
      closedate: "2026-12-31T00:00:00.000Z",
      ...overrides,
    },
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };
}

function defaultInfinite() {
  return {
    data: { pages: [{ results: [] as HubspotDeal[] }] },
    isLoading: false,
    hasNextPage: false,
    isFetchingNextPage: false,
    fetchNextPage: vi.fn(),
  };
}

function defaultSearch() {
  return { data: { results: [] as HubspotDeal[] }, isLoading: false };
}

function defaultMutation() {
  return {
    mutate: vi.fn(),
    mutateAsync: vi.fn().mockResolvedValue(undefined),
    isPending: false,
    error: null as Error | null,
  };
}

describe("DealsTab", () => {
  beforeEach(() => {
    useInfiniteHubspotDealsMock.mockReset();
    useSearchHubspotDealsMock.mockReset();
    useCreateDealMock.mockReset();
    useInfiniteHubspotDealsMock.mockReturnValue(defaultInfinite());
    useSearchHubspotDealsMock.mockReturnValue(defaultSearch());
    useCreateDealMock.mockReturnValue(defaultMutation());
  });

  it("shows Loading… while infinite query loads", () => {
    useInfiniteHubspotDealsMock.mockReturnValue({
      ...defaultInfinite(),
      isLoading: true,
    });
    render(<DealsTab />);
    expect(screen.getByText("Loading…")).toBeInTheDocument();
  });

  it("shows No deals yet when the list is empty", () => {
    render(<DealsTab />);
    expect(screen.getByText("No deals yet")).toBeInTheDocument();
  });

  it("renders a row per deal with name, amount, stage, close date", () => {
    useInfiniteHubspotDealsMock.mockReturnValue({
      ...defaultInfinite(),
      data: { pages: [{ results: [makeDeal()] }] },
    });
    render(<DealsTab />);
    expect(screen.getByText("Big Contract")).toBeInTheDocument();
    expect(screen.getByText("$1000")).toBeInTheDocument();
    expect(screen.getByText("negotiation")).toBeInTheDocument();
    expect(screen.getByText("2026-12-31")).toBeInTheDocument();
  });

  it("shows — for missing name/amount/stage/close date fields", () => {
    useInfiniteHubspotDealsMock.mockReturnValue({
      ...defaultInfinite(),
      data: {
        pages: [
          {
            results: [
              makeDeal({
                dealname: undefined,
                amount: undefined,
                dealstage: undefined,
                closedate: undefined,
              }),
            ],
          },
        ],
      },
    });
    render(<DealsTab />);
    expect(screen.getAllByText("—").length).toBe(4);
  });

  it("shows the singular loaded count for 1 deal", () => {
    useInfiniteHubspotDealsMock.mockReturnValue({
      ...defaultInfinite(),
      data: { pages: [{ results: [makeDeal()] }] },
    });
    render(<DealsTab />);
    expect(screen.getByText("1 deal loaded")).toBeInTheDocument();
  });

  it("shows the plural loaded count for 2+ deals", () => {
    useInfiniteHubspotDealsMock.mockReturnValue({
      ...defaultInfinite(),
      data: { pages: [{ results: [makeDeal({}, "1"), makeDeal({}, "2")] }] },
    });
    render(<DealsTab />);
    expect(screen.getByText("2 deals loaded")).toBeInTheDocument();
  });

  it("shows Load more when hasNextPage and calls fetchNextPage", () => {
    const fetchNextPage = vi.fn();
    useInfiniteHubspotDealsMock.mockReturnValue({
      ...defaultInfinite(),
      hasNextPage: true,
      fetchNextPage,
    });
    render(<DealsTab />);
    fireEvent.click(screen.getByRole("button", { name: "Load more" }));
    expect(fetchNextPage).toHaveBeenCalled();
  });

  it("toggles the new deal form", () => {
    render(<DealsTab />);
    fireEvent.click(screen.getByRole("button", { name: "+ New deal" }));
    expect(screen.getByPlaceholderText("Deal name *")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(
      screen.queryByPlaceholderText("Deal name *"),
    ).not.toBeInTheDocument();
  });

  it("Create button is disabled until dealname is filled", () => {
    render(<DealsTab />);
    fireEvent.click(screen.getByRole("button", { name: "+ New deal" }));
    expect(screen.getByRole("button", { name: "Create" })).toBeDisabled();
    fireEvent.change(screen.getByPlaceholderText("Deal name *"), {
      target: { value: "Big deal" },
    });
    expect(screen.getByRole("button", { name: "Create" })).not.toBeDisabled();
  });

  it("calls createDeal.mutateAsync with trimmed fields and closedate on Create", async () => {
    const mutateAsync = vi.fn().mockResolvedValue(undefined);
    useCreateDealMock.mockReturnValue({
      mutate: vi.fn(),
      mutateAsync,
      isPending: false,
      error: null,
    });
    const { container } = render(<DealsTab />);
    fireEvent.click(screen.getByRole("button", { name: "+ New deal" }));
    fireEvent.change(screen.getByPlaceholderText("Deal name *"), {
      target: { value: " Big deal " },
    });
    fireEvent.change(screen.getByPlaceholderText("Amount"), {
      target: { value: "500" },
    });
    const dateInput = container.querySelector('input[type="date"]');
    if (!dateInput) throw new Error("date input not found");
    fireEvent.change(dateInput, {
      target: { value: "2026-06-01" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create" }));

    await vi.waitFor(() =>
      expect(mutateAsync).toHaveBeenCalledWith({
        dealname: "Big deal",
        amount: "500",
        closedate: "2026-06-01",
      }),
    );
  });

  it("shows Saving… and the error message while/when the create mutation fails", () => {
    useCreateDealMock.mockReturnValue({
      mutate: vi.fn(),
      mutateAsync: vi.fn(),
      isPending: true,
      error: new Error("Deal exists"),
    });
    render(<DealsTab />);
    fireEvent.click(screen.getByRole("button", { name: "+ New deal" }));
    expect(screen.getByRole("button", { name: "Saving…" })).toBeDisabled();
    expect(screen.getByText("Deal exists")).toBeInTheDocument();
  });

  it("debounces the search input and switches to search results", async () => {
    vi.useFakeTimers();
    useSearchHubspotDealsMock.mockReturnValue({
      data: { results: [makeDeal({}, "9")] },
      isLoading: false,
    });
    render(<DealsTab />);
    fireEvent.change(screen.getByPlaceholderText("Search deals…"), {
      target: { value: "big" },
    });
    vi.advanceTimersByTime(300);
    vi.useRealTimers();

    expect(await screen.findByText('1 result for "big"')).toBeInTheDocument();
  });

  it("shows No deals found for an empty search result", async () => {
    vi.useFakeTimers();
    render(<DealsTab />);
    fireEvent.change(screen.getByPlaceholderText("Search deals…"), {
      target: { value: "zzz" },
    });
    vi.advanceTimersByTime(300);
    vi.useRealTimers();

    expect(await screen.findByText("No deals found")).toBeInTheDocument();
  });
});
