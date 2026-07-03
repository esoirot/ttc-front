import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Client } from "@/types/clients.types";
import type { Project } from "@/types/projects.types";

const useGenerateInvoiceMock = vi.fn();
vi.mock("@/hooks/invoices/useInvoices", () => ({
  useGenerateInvoice: () => useGenerateInvoiceMock(),
}));

import { GenerateInvoiceForm } from "./GenerateInvoiceForm";

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

function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    id: 1,
    userId: 1,
    clientId: null,
    title: "Translate manual",
    description: null,
    status: "ACTIVE",
    sourceLanguage: null,
    targetLanguage: null,
    wordCount: null,
    unitPrice: null,
    fixedFee: null,
    hourlyRate: null,
    perWordRate: null,
    currency: "EUR",
    deadline: null,
    startDate: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function renderForm(
  overrides: Partial<{
    clients: Client[];
    projects: Project[];
    onClose: () => void;
    onGenerated: (id: number) => void;
  }> = {},
) {
  return render(
    <GenerateInvoiceForm
      clients={[]}
      projects={[]}
      onClose={vi.fn()}
      onGenerated={vi.fn()}
      {...overrides}
    />,
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
    renderForm({
      clients: [makeClient()],
      projects: [makeProject()],
    });
    const [projectSelect, clientSelect] = screen.getAllByRole("combobox");
    expect(projectSelect).toHaveTextContent("Select project");
    expect(clientSelect).toHaveTextContent("No client");
  });
});
