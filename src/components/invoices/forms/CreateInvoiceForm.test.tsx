import { fireEvent, render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { messages } from "@/i18n/messages";
import type { Locale } from "@/i18n/useLocale";

const useCreateInvoiceMock = vi.fn();
vi.mock("@/hooks/invoices/useInvoices", () => ({
  useCreateInvoice: () => useCreateInvoiceMock(),
}));

vi.mock("@/hooks/clients/useClients", () => ({
  useClientOptions: () => ({
    clients: [{ id: 7, name: "Zeta Corp" }],
    loading: false,
  }),
  useClient: () => ({ client: null }),
}));

import { CreateInvoiceForm } from "./CreateInvoiceForm";

function renderForm(
  overrides: Partial<{
    onClose: () => void;
    onCreated: (id: number) => void;
  }> = {},
  locale: Locale = "en",
) {
  return render(
    <IntlProvider locale={locale} messages={messages[locale]}>
      <CreateInvoiceForm onClose={vi.fn()} onCreated={vi.fn()} {...overrides} />
    </IntlProvider>,
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

  it("submits the picked client", async () => {
    const createInvoice = vi.fn().mockResolvedValue({ id: 1 });
    useCreateInvoiceMock.mockReturnValue({ createInvoice, loading: false });
    renderForm();

    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(screen.getByRole("option", { name: "Zeta Corp" }));
    fireEvent.click(screen.getByRole("button", { name: "Create invoice" }));

    await vi.waitFor(() =>
      expect(createInvoice).toHaveBeenCalledWith({
        clientId: 7,
        dueDate: undefined,
      }),
    );
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
    renderForm();
    expect(screen.getByRole("combobox")).toHaveTextContent("No client");
  });

  it("renders French copy when locale is fr", () => {
    renderForm({}, "fr");
    expect(screen.getByText("Client")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Créer la facture" }),
    ).toBeInTheDocument();
  });
});
