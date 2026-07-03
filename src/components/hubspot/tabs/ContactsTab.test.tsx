import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { HubspotContact } from "@/types/hubspot.types";

const useInfiniteHubspotContactsMock = vi.fn();
const useSearchHubspotContactsMock = vi.fn();
const useCreateContactMock = vi.fn();
const useImportHubspotContactMock = vi.fn();

vi.mock("@/hooks/integrations/useHubspot", () => ({
  useInfiniteHubspotContacts: () => useInfiniteHubspotContactsMock(),
  useSearchHubspotContacts: (query: string) =>
    useSearchHubspotContactsMock(query),
  useCreateContact: () => useCreateContactMock(),
  useImportHubspotContact: () => useImportHubspotContactMock(),
}));

import { ContactsTab } from "./ContactsTab";

function makeContact(
  overrides: Partial<HubspotContact["properties"]> = {},
  id = "1",
): HubspotContact {
  return {
    id,
    properties: {
      firstname: "Jane",
      lastname: "Doe",
      email: "jane@example.com",
      company: "Acme",
      phone: "555-1234",
      ...overrides,
    },
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };
}

function defaultInfinite() {
  return {
    data: { pages: [{ results: [] as HubspotContact[] }] },
    isLoading: false,
    hasNextPage: false,
    isFetchingNextPage: false,
    fetchNextPage: vi.fn(),
  };
}

function defaultSearch() {
  return { data: { results: [] as HubspotContact[] }, isLoading: false };
}

function defaultMutation() {
  return {
    mutate: vi.fn(),
    mutateAsync: vi.fn().mockResolvedValue(undefined),
    isPending: false,
    error: null as Error | null,
  };
}

describe("ContactsTab", () => {
  beforeEach(() => {
    vi.useRealTimers();
    useInfiniteHubspotContactsMock.mockReset();
    useSearchHubspotContactsMock.mockReset();
    useCreateContactMock.mockReset();
    useImportHubspotContactMock.mockReset();
    useInfiniteHubspotContactsMock.mockReturnValue(defaultInfinite());
    useSearchHubspotContactsMock.mockReturnValue(defaultSearch());
    useCreateContactMock.mockReturnValue(defaultMutation());
    useImportHubspotContactMock.mockReturnValue(defaultMutation());
  });

  it("shows Loading… while infinite query loads", () => {
    useInfiniteHubspotContactsMock.mockReturnValue({
      ...defaultInfinite(),
      isLoading: true,
    });
    render(<ContactsTab />);
    expect(screen.getByText("Loading…")).toBeInTheDocument();
  });

  it("shows No contacts yet when the list is empty", () => {
    render(<ContactsTab />);
    expect(screen.getByText("No contacts yet")).toBeInTheDocument();
  });

  it("renders a row per contact with name, email, company, phone", () => {
    useInfiniteHubspotContactsMock.mockReturnValue({
      ...defaultInfinite(),
      data: { pages: [{ results: [makeContact()] }] },
    });
    render(<ContactsTab />);
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("jane@example.com")).toBeInTheDocument();
    expect(screen.getByText("Acme")).toBeInTheDocument();
    expect(screen.getByText("555-1234")).toBeInTheDocument();
  });

  it("shows — for missing name/email/company/phone fields", () => {
    useInfiniteHubspotContactsMock.mockReturnValue({
      ...defaultInfinite(),
      data: {
        pages: [
          {
            results: [
              makeContact({
                firstname: undefined,
                lastname: undefined,
                email: undefined,
                company: undefined,
                phone: undefined,
              }),
            ],
          },
        ],
      },
    });
    render(<ContactsTab />);
    expect(screen.getAllByText("—").length).toBe(4);
  });

  it("shows the loaded count", () => {
    useInfiniteHubspotContactsMock.mockReturnValue({
      ...defaultInfinite(),
      data: {
        pages: [{ results: [makeContact({}, "1"), makeContact({}, "2")] }],
      },
    });
    render(<ContactsTab />);
    expect(screen.getByText("2 contacts loaded")).toBeInTheDocument();
  });

  it("shows Load more when hasNextPage and calls fetchNextPage", () => {
    const fetchNextPage = vi.fn();
    useInfiniteHubspotContactsMock.mockReturnValue({
      ...defaultInfinite(),
      hasNextPage: true,
      fetchNextPage,
    });
    render(<ContactsTab />);
    fireEvent.click(screen.getByRole("button", { name: "Load more" }));
    expect(fetchNextPage).toHaveBeenCalled();
  });

  it("toggles the new contact form", () => {
    render(<ContactsTab />);
    fireEvent.click(screen.getByRole("button", { name: "+ New contact" }));
    expect(screen.getByPlaceholderText("Email *")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByPlaceholderText("Email *")).not.toBeInTheDocument();
  });

  it("Create button is disabled until email is filled", () => {
    render(<ContactsTab />);
    fireEvent.click(screen.getByRole("button", { name: "+ New contact" }));
    expect(screen.getByRole("button", { name: "Create" })).toBeDisabled();
    fireEvent.change(screen.getByPlaceholderText("Email *"), {
      target: { value: "a@b.com" },
    });
    expect(screen.getByRole("button", { name: "Create" })).not.toBeDisabled();
  });

  it("calls createContact.mutateAsync with trimmed fields on Create", async () => {
    const mutateAsync = vi.fn().mockResolvedValue(undefined);
    useCreateContactMock.mockReturnValue({
      mutate: vi.fn(),
      mutateAsync,
      isPending: false,
      error: null,
    });
    render(<ContactsTab />);
    fireEvent.click(screen.getByRole("button", { name: "+ New contact" }));
    fireEvent.change(screen.getByPlaceholderText("Email *"), {
      target: { value: " a@b.com " },
    });
    fireEvent.change(screen.getByPlaceholderText("First name"), {
      target: { value: " Jane " },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create" }));

    await vi.waitFor(() =>
      expect(mutateAsync).toHaveBeenCalledWith({
        email: "a@b.com",
        firstname: "Jane",
      }),
    );
  });

  it("shows Saving… and the error message while/when the create mutation fails", () => {
    useCreateContactMock.mockReturnValue({
      mutate: vi.fn(),
      mutateAsync: vi.fn(),
      isPending: true,
      error: new Error("Contact exists"),
    });
    render(<ContactsTab />);
    fireEvent.click(screen.getByRole("button", { name: "+ New contact" }));
    expect(screen.getByRole("button", { name: "Saving…" })).toBeDisabled();
    expect(screen.getByText("Contact exists")).toBeInTheDocument();
  });

  it("debounces the search input and switches to search results", async () => {
    vi.useFakeTimers();
    useSearchHubspotContactsMock.mockReturnValue({
      data: { results: [makeContact({}, "9")] },
      isLoading: false,
    });
    render(<ContactsTab />);
    fireEvent.change(screen.getByPlaceholderText("Search contacts…"), {
      target: { value: "jane" },
    });
    vi.advanceTimersByTime(300);
    vi.useRealTimers();

    expect(await screen.findByText('1 result for "jane"')).toBeInTheDocument();
  });

  it("shows No contacts found for an empty search result", async () => {
    vi.useFakeTimers();
    render(<ContactsTab />);
    fireEvent.change(screen.getByPlaceholderText("Search contacts…"), {
      target: { value: "zzz" },
    });
    vi.advanceTimersByTime(300);
    vi.useRealTimers();

    expect(await screen.findByText("No contacts found")).toBeInTheDocument();
  });

  it("renders an ImportButton that imports a contact and flips to Imported", async () => {
    const mutateAsync = vi.fn().mockResolvedValue(undefined);
    useImportHubspotContactMock.mockReturnValue({
      mutate: vi.fn(),
      mutateAsync,
      isPending: false,
      error: null,
    });
    useInfiniteHubspotContactsMock.mockReturnValue({
      ...defaultInfinite(),
      data: { pages: [{ results: [makeContact({}, "5")] }] },
    });
    render(<ContactsTab />);
    fireEvent.click(screen.getByRole("button", { name: "Import as client" }));
    expect(mutateAsync).toHaveBeenCalledWith("5");
    expect(await screen.findByText("Imported")).toBeInTheDocument();
  });

  it("shows Importing… while the import mutation is pending", () => {
    useImportHubspotContactMock.mockReturnValue({
      mutate: vi.fn(),
      mutateAsync: vi.fn(),
      isPending: true,
      error: null,
    });
    useInfiniteHubspotContactsMock.mockReturnValue({
      ...defaultInfinite(),
      data: { pages: [{ results: [makeContact()] }] },
    });
    render(<ContactsTab />);
    expect(screen.getByRole("button", { name: "Importing…" })).toBeDisabled();
  });
});
