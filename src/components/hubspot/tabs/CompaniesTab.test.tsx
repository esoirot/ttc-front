import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { HubspotCompany } from "@/types/hubspot.types";

const useInfiniteHubspotCompaniesMock = vi.fn();
const useSearchHubspotCompaniesMock = vi.fn();
const useCreateCompanyMock = vi.fn();

vi.mock("@/hooks/integrations/useHubspot", () => ({
  useInfiniteHubspotCompanies: () => useInfiniteHubspotCompaniesMock(),
  useSearchHubspotCompanies: (query: string) =>
    useSearchHubspotCompaniesMock(query),
  useCreateCompany: () => useCreateCompanyMock(),
}));

import { CompaniesTab } from "./CompaniesTab";

function makeCompany(
  overrides: Partial<HubspotCompany["properties"]> = {},
  id = "1",
): HubspotCompany {
  return {
    id,
    properties: {
      name: "Acme Inc",
      domain: "acme.com",
      phone: "555-1234",
      city: "Paris",
      country: "France",
      ...overrides,
    },
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };
}

function defaultInfinite() {
  return {
    data: { pages: [{ results: [] as HubspotCompany[] }] },
    isLoading: false,
    hasNextPage: false,
    isFetchingNextPage: false,
    fetchNextPage: vi.fn(),
  };
}

function defaultSearch() {
  return { data: { results: [] as HubspotCompany[] }, isLoading: false };
}

function defaultMutation() {
  return {
    mutate: vi.fn(),
    mutateAsync: vi.fn().mockResolvedValue(undefined),
    isPending: false,
    error: null as Error | null,
  };
}

describe("CompaniesTab", () => {
  beforeEach(() => {
    useInfiniteHubspotCompaniesMock.mockReset();
    useSearchHubspotCompaniesMock.mockReset();
    useCreateCompanyMock.mockReset();
    useInfiniteHubspotCompaniesMock.mockReturnValue(defaultInfinite());
    useSearchHubspotCompaniesMock.mockReturnValue(defaultSearch());
    useCreateCompanyMock.mockReturnValue(defaultMutation());
  });

  it("shows Loading… while infinite query loads", () => {
    useInfiniteHubspotCompaniesMock.mockReturnValue({
      ...defaultInfinite(),
      isLoading: true,
    });
    render(<CompaniesTab />);
    expect(screen.getByText("Loading…")).toBeInTheDocument();
  });

  it("shows No companies yet when the list is empty", () => {
    render(<CompaniesTab />);
    expect(screen.getByText("No companies yet")).toBeInTheDocument();
  });

  it("renders a row per company with name, domain, phone, location", () => {
    useInfiniteHubspotCompaniesMock.mockReturnValue({
      ...defaultInfinite(),
      data: { pages: [{ results: [makeCompany()] }] },
    });
    render(<CompaniesTab />);
    expect(screen.getByText("Acme Inc")).toBeInTheDocument();
    expect(screen.getByText("acme.com")).toBeInTheDocument();
    expect(screen.getByText("555-1234")).toBeInTheDocument();
    expect(screen.getByText("Paris, France")).toBeInTheDocument();
  });

  it("shows — for missing name/domain/phone/location fields", () => {
    useInfiniteHubspotCompaniesMock.mockReturnValue({
      ...defaultInfinite(),
      data: {
        pages: [
          {
            results: [
              makeCompany({
                name: undefined,
                domain: undefined,
                phone: undefined,
                city: undefined,
                country: undefined,
              }),
            ],
          },
        ],
      },
    });
    render(<CompaniesTab />);
    expect(screen.getAllByText("—").length).toBe(4);
  });

  it("shows the singular loaded count for 1 company", () => {
    useInfiniteHubspotCompaniesMock.mockReturnValue({
      ...defaultInfinite(),
      data: { pages: [{ results: [makeCompany()] }] },
    });
    render(<CompaniesTab />);
    expect(screen.getByText("1 company loaded")).toBeInTheDocument();
  });

  it("shows the plural loaded count for 2+ companies", () => {
    useInfiniteHubspotCompaniesMock.mockReturnValue({
      ...defaultInfinite(),
      data: {
        pages: [{ results: [makeCompany({}, "1"), makeCompany({}, "2")] }],
      },
    });
    render(<CompaniesTab />);
    expect(screen.getByText("2 companies loaded")).toBeInTheDocument();
  });

  it("shows Load more when hasNextPage and calls fetchNextPage", () => {
    const fetchNextPage = vi.fn();
    useInfiniteHubspotCompaniesMock.mockReturnValue({
      ...defaultInfinite(),
      hasNextPage: true,
      fetchNextPage,
    });
    render(<CompaniesTab />);
    fireEvent.click(screen.getByRole("button", { name: "Load more" }));
    expect(fetchNextPage).toHaveBeenCalled();
  });

  it("toggles the new company form", () => {
    render(<CompaniesTab />);
    fireEvent.click(screen.getByRole("button", { name: "+ New company" }));
    expect(screen.getByPlaceholderText("Company name *")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(
      screen.queryByPlaceholderText("Company name *"),
    ).not.toBeInTheDocument();
  });

  it("Create button is disabled until name is filled", () => {
    render(<CompaniesTab />);
    fireEvent.click(screen.getByRole("button", { name: "+ New company" }));
    expect(screen.getByRole("button", { name: "Create" })).toBeDisabled();
    fireEvent.change(screen.getByPlaceholderText("Company name *"), {
      target: { value: "Acme" },
    });
    expect(screen.getByRole("button", { name: "Create" })).not.toBeDisabled();
  });

  it("calls createCompany.mutateAsync with trimmed fields on Create", async () => {
    const mutateAsync = vi.fn().mockResolvedValue(undefined);
    useCreateCompanyMock.mockReturnValue({
      mutate: vi.fn(),
      mutateAsync,
      isPending: false,
      error: null,
    });
    render(<CompaniesTab />);
    fireEvent.click(screen.getByRole("button", { name: "+ New company" }));
    fireEvent.change(screen.getByPlaceholderText("Company name *"), {
      target: { value: " Acme " },
    });
    fireEvent.change(screen.getByPlaceholderText("Domain (e.g. acme.com)"), {
      target: { value: " acme.com " },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create" }));

    await vi.waitFor(() =>
      expect(mutateAsync).toHaveBeenCalledWith({
        name: "Acme",
        domain: "acme.com",
      }),
    );
  });

  it("shows Saving… and the error message while/when the create mutation fails", () => {
    useCreateCompanyMock.mockReturnValue({
      mutate: vi.fn(),
      mutateAsync: vi.fn(),
      isPending: true,
      error: new Error("Company exists"),
    });
    render(<CompaniesTab />);
    fireEvent.click(screen.getByRole("button", { name: "+ New company" }));
    expect(screen.getByRole("button", { name: "Saving…" })).toBeDisabled();
    expect(screen.getByText("Company exists")).toBeInTheDocument();
  });

  it("debounces the search input and switches to search results", async () => {
    vi.useFakeTimers();
    useSearchHubspotCompaniesMock.mockReturnValue({
      data: { results: [makeCompany({}, "9")] },
      isLoading: false,
    });
    render(<CompaniesTab />);
    fireEvent.change(screen.getByPlaceholderText("Search companies…"), {
      target: { value: "acme" },
    });
    vi.advanceTimersByTime(300);
    vi.useRealTimers();

    expect(await screen.findByText('1 result for "acme"')).toBeInTheDocument();
  });

  it("shows No companies found for an empty search result", async () => {
    vi.useFakeTimers();
    render(<CompaniesTab />);
    fireEvent.change(screen.getByPlaceholderText("Search companies…"), {
      target: { value: "zzz" },
    });
    vi.advanceTimersByTime(300);
    vi.useRealTimers();

    expect(await screen.findByText("No companies found")).toBeInTheDocument();
  });
});
