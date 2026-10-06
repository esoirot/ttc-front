import { fireEvent, render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { messages } from "@/i18n/messages";
import type { Locale } from "@/i18n/useLocale";

const useGenerateInvoiceMock = vi.fn();
vi.mock("@/hooks/invoices/useInvoices", () => ({
  useGenerateInvoice: () => useGenerateInvoiceMock(),
}));

vi.mock("@/hooks/clients/useClients", () => ({
  useClientOptions: () => ({ clients: [], loading: false }),
  useClient: () => ({ client: null }),
}));

vi.mock("@/hooks/projects/useProjects", () => ({
  useProjectOptions: () => ({
    projects: [{ id: 3, title: "Translate manual" }],
    loading: false,
  }),
  useProject: () => ({ project: null }),
}));

import { GenerateInvoiceForm } from "./GenerateInvoiceForm";

function renderForm(
  overrides: Partial<{
    onClose: () => void;
    onGenerated: (id: number) => void;
  }> = {},
  locale: Locale = "en",
) {
  return render(
    <IntlProvider locale={locale} messages={messages[locale]}>
      <GenerateInvoiceForm
        onClose={vi.fn()}
        onGenerated={vi.fn()}
        {...overrides}
      />
    </IntlProvider>,
  );
}

describe("GenerateInvoiceForm", () => {
  beforeEach(() => {
    useGenerateInvoiceMock.mockReset();
    useGenerateInvoiceMock.mockReturnValue({
      generateInvoice: vi.fn().mockResolvedValue({ id: 1 }),
      loading: false,
    });
  });

  it("renders Project, Client, and Due date fields", () => {
    renderForm();
    expect(screen.getByText("Project *")).toBeInTheDocument();
    expect(screen.getByText("Client")).toBeInTheDocument();
    expect(screen.getByLabelText("Due date")).toBeInTheDocument();
  });

  it("shows the pricing explainer text", () => {
    renderForm();
    expect(
      screen.getByText(/Invoice line items generated from project pricing/),
    ).toBeInTheDocument();
  });

  it("Generate invoice button is disabled when no project is selected", () => {
    renderForm();
    expect(
      screen.getByRole("button", { name: "Generate invoice" }),
    ).toBeDisabled();
  });

  it("does not call generateInvoice on submit when no project is selected", () => {
    const generateInvoice = vi.fn();
    useGenerateInvoiceMock.mockReturnValue({ generateInvoice, loading: false });
    const { container } = renderForm();
    const form = container.querySelector("form");
    if (!form) throw new Error("form not found");
    fireEvent.submit(form);
    expect(generateInvoice).not.toHaveBeenCalled();
  });

  it("generates an invoice for the picked project", async () => {
    const generateInvoice = vi.fn().mockResolvedValue({ id: 9 });
    const onGenerated = vi.fn();
    useGenerateInvoiceMock.mockReturnValue({ generateInvoice, loading: false });
    renderForm({ onGenerated });

    fireEvent.click(screen.getAllByRole("combobox")[0]);
    fireEvent.click(screen.getByRole("option", { name: "Translate manual" }));
    fireEvent.click(screen.getByRole("button", { name: "Generate invoice" }));

    await vi.waitFor(() =>
      expect(generateInvoice).toHaveBeenCalledWith(
        expect.objectContaining({ projectId: 3 }),
      ),
    );
    expect(onGenerated).toHaveBeenCalledWith(9);
  });

  it("shows Generating… and disables the button while loading", () => {
    useGenerateInvoiceMock.mockReturnValue({
      generateInvoice: vi.fn(),
      loading: true,
    });
    renderForm();
    expect(screen.getByRole("button", { name: "Generating…" })).toBeDisabled();
  });

  it("calls setDueDate as the due date input changes", () => {
    renderForm();
    fireEvent.change(screen.getByLabelText("Due date"), {
      target: { value: "2026-06-01" },
    });
    expect(screen.getByLabelText("Due date")).toHaveValue("2026-06-01");
  });

  it("shows 'Select project' and 'No client' as default selections", () => {
    renderForm();
    const [projectSelect, clientSelect] = screen.getAllByRole("combobox");
    expect(projectSelect).toHaveTextContent("Select project");
    expect(clientSelect).toHaveTextContent("No client");
  });

  it("renders French copy when locale is fr", () => {
    renderForm({}, "fr");
    expect(screen.getByText("Projet *")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Générer la facture" }),
    ).toBeInTheDocument();
  });
});
