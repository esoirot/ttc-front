import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Client } from "@/types/clients.types";
import type { Project } from "@/types/projects.types";
import { GenerateInvoiceForm } from "./GenerateInvoiceForm";

const clients: Client[] = [
  {
    id: 1,
    userId: 1,
    name: "Acme Corp",
    legalName: null,
    email: null,
    phone: null,
    company: null,
    address: null,
    addressLine2: null,
    city: null,
    country: null,
    state: null,
    postalCode: null,
    vatNumber: null,
    legalForm: null,
    color: null,
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
    status: "CLIENT",
    contactedAt: null,
    tags: [],
    contacts: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];

const projects: Project[] = [
  {
    id: 1,
    userId: 1,
    clientId: 1,
    title: "Translate user manual",
    description: null,
    status: "ACTIVE",
    sourceLanguage: "EN",
    targetLanguage: "FR",
    wordCount: 12000,
    unitPrice: 0.12,
    fixedFee: null,
    hourlyRate: null,
    perWordRate: null,
    currency: "EUR",
    deadline: null,
    startDate: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: 2,
    userId: 1,
    clientId: null,
    title: "Marketing copy localization",
    description: null,
    status: "ACTIVE",
    sourceLanguage: "EN",
    targetLanguage: "DE",
    wordCount: null,
    unitPrice: null,
    fixedFee: 800,
    hourlyRate: null,
    perWordRate: null,
    currency: "EUR",
    deadline: null,
    startDate: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];

const meta: Meta<typeof GenerateInvoiceForm> = {
  component: GenerateInvoiceForm,
  title: "Molecules/GenerateInvoiceForm",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <Story />
      </QueryClientProvider>
    ),
  ],
  args: {
    clients,
    projects,
    onClose: () => {},
    onGenerated: () => {},
  },
};
export default meta;
type Story = StoryObj<typeof GenerateInvoiceForm>;

export const Default: Story = {};

export const NoProjects: Story = { args: { projects: [] } };
