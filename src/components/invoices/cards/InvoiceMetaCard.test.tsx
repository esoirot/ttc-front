import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Client } from "@/types/clients.types";

const useClientsMock = vi.fn();
vi.mock("@/hooks/clients/useClients", () => ({
  useClients: () => useClientsMock(),
}));

import { InvoiceMetaCard } from "./InvoiceMetaCard";

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

function renderCard(
  overrides: Partial<{
    clientId: number | null;
    currency: string;
    dueDate: string | null;
    notes: string | null;
    onUpdate: (input: unknown) => Promise<unknown>;
  }> = {},
) {
  return render(
    <InvoiceMetaCard
      clientId={null}
      currency="EUR"
      dueDate={null}
      notes={null}
      onUpdate={vi.fn().mockResolvedValue(undefined)}
      {...overrides}
    />,
  );
}

describe("InvoiceMetaCard", () => {
  beforeEach(() => {
    useClientsMock.mockReset();
    useClientsMock.mockReturnValue({ clients: [] });
  });

  it("shows 'No client' when clientId is null", () => {
    renderCard({ clientId: null });
    expect(screen.getByText("No client")).toBeInTheDocument();
  });

  it("shows the resolved client name for a known clientId", () => {
    useClientsMock.mockReturnValue({
      clients: [makeClient({ id: 3, name: "Acme Corp" })],
    });
    renderCard({ clientId: 3 });
    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
  });

  it("shows a fallback label for an unknown clientId", () => {
    useClientsMock.mockReturnValue({ clients: [] });
    renderCard({ clientId: 9 });
    expect(screen.getByText("Client #9")).toBeInTheDocument();
  });

  it("shows the currency and dash for missing due date and notes", () => {
    renderCard({ currency: "USD" });
    expect(screen.getByText("USD")).toBeInTheDocument();
    expect(screen.getAllByText("—").length).toBe(2);
  });

  it("shows the due date and notes when set", () => {
    renderCard({ dueDate: "2026-06-15T00:00:00.000Z", notes: "Pay ASAP" });
    expect(screen.getByText("2026-06-15")).toBeInTheDocument();
    expect(screen.getByText("Pay ASAP")).toBeInTheDocument();
  });

  it("switches to edit mode showing prefilled fields on Edit click", () => {
    const { container } = renderCard({
      currency: "USD",
      dueDate: "2026-06-15T00:00:00.000Z",
      notes: "Pay ASAP",
    });
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    const dateInput = container.querySelector('input[type="date"]');
    expect(dateInput).toHaveValue("2026-06-15");
    expect(screen.getByPlaceholderText("Internal notes…")).toHaveValue(
      "Pay ASAP",
    );
  });

  it("cancel discards edits and returns to view mode", () => {
    renderCard({ notes: "Original" });
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.change(screen.getByPlaceholderText("Internal notes…"), {
      target: { value: "Changed" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.getByText("Original")).toBeInTheDocument();
  });

  it("saves edited due date and notes", async () => {
    const onUpdate = vi.fn().mockResolvedValue(undefined);
    const { container } = renderCard({ onUpdate });
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    const dateInput = container.querySelector('input[type="date"]');
    if (!dateInput) throw new Error("date input not found");
    fireEvent.change(dateInput, {
      target: { value: "2026-07-01" },
    });
    fireEvent.change(screen.getByPlaceholderText("Internal notes…"), {
      target: { value: "Updated notes" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await vi.waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          dueDate: "2026-07-01",
          notes: "Updated notes",
        }),
      ),
    );
    await vi.waitFor(() =>
      expect(
        screen.queryByPlaceholderText("Internal notes…"),
      ).not.toBeInTheDocument(),
    );
  });

  it("shows Saving… while the save is in flight", async () => {
    let resolveUpdate: () => void = () => {};
    const onUpdate = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveUpdate = resolve;
        }),
    );
    renderCard({ onUpdate });
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(screen.getByRole("button", { name: "Saving…" })).toBeDisabled();
    resolveUpdate();
    await vi.waitFor(() =>
      expect(
        screen.queryByPlaceholderText("Internal notes…"),
      ).not.toBeInTheDocument(),
    );
  });
});
