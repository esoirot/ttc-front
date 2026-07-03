import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Client } from "@/types/clients.types";

const useCreateInvoiceMock = vi.fn();
vi.mock("@/hooks/invoices/useInvoices", () => ({
  useCreateInvoice: () => useCreateInvoiceMock(),
}));

import { CreateInvoiceForm } from "./CreateInvoiceForm";

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

function renderForm(
  overrides: Partial<{
    clients: Client[];
    onClose: () => void;
    onCreated: (id: number) => void;
  }> = {},
) {
  return render(
    <CreateInvoiceForm
      clients={[]}
      onClose={vi.fn()}
      onCreated={vi.fn()}
      {...overrides}
    />,
  );
}

describe("CreateInvoiceForm", () => {
  beforeEach(() => {
    useCreateInvoiceMock.mockReset();
    useCreateInvoiceMock.mockReturnValue({
      createInvoice: vi.fn().mockResolvedValue({ id: 1 }),
      loading: false,
    });
  });

  it("renders Client and Due date fields", () => {
    renderForm();
    expect(screen.getByText("Client")).toBeInTheDocument();
    expect(screen.getByLabelText("Due date")).toBeInTheDocument();
  });

  it("calls setDueDate as the due date input changes", () => {
    renderForm();
    fireEvent.change(screen.getByLabelText("Due date"), {
      target: { value: "2026-06-01" },
    });
    expect(screen.getByLabelText("Due date")).toHaveValue("2026-06-01");
  });

  it("submits with no client and no due date, calls onClose and onCreated", async () => {
    const createInvoice = vi.fn().mockResolvedValue({ id: 42 });
    const onClose = vi.fn();
    const onCreated = vi.fn();
    useCreateInvoiceMock.mockReturnValue({ createInvoice, loading: false });
    renderForm({ onClose, onCreated });

    fireEvent.click(screen.getByRole("button", { name: "Create invoice" }));

    await vi.waitFor(() =>
      expect(createInvoice).toHaveBeenCalledWith({
        clientId: undefined,
        dueDate: undefined,
      }),
    );
    expect(onClose).toHaveBeenCalled();
    expect(onCreated).toHaveBeenCalledWith(42);
  });

  it("submits with a due date set", async () => {
    const createInvoice = vi.fn().mockResolvedValue({ id: 1 });
    useCreateInvoiceMock.mockReturnValue({ createInvoice, loading: false });
    renderForm();

    fireEvent.change(screen.getByLabelText("Due date"), {
      target: { value: "2026-06-01" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create invoice" }));

    await vi.waitFor(() =>
      expect(createInvoice).toHaveBeenCalledWith({
        clientId: undefined,
        dueDate: "2026-06-01",
      }),
    );
  });

  it("does not call onCreated when the result has no id", async () => {
    const createInvoice = vi.fn().mockResolvedValue({});
    const onCreated = vi.fn();
    useCreateInvoiceMock.mockReturnValue({ createInvoice, loading: false });
    renderForm({ onCreated });

    fireEvent.click(screen.getByRole("button", { name: "Create invoice" }));

    await vi.waitFor(() => expect(createInvoice).toHaveBeenCalled());
    expect(onCreated).not.toHaveBeenCalled();
  });

  it("shows Creating… and disables the button while loading", () => {
    useCreateInvoiceMock.mockReturnValue({
      createInvoice: vi.fn(),
      loading: true,
    });
    renderForm();
    expect(screen.getByRole("button", { name: "Creating…" })).toBeDisabled();
  });

  it("shows 'No client' as the default selection", () => {
    renderForm({ clients: [makeClient({ id: 1, name: "Acme" })] });
    expect(screen.getByRole("combobox")).toHaveTextContent("No client");
  });
});
