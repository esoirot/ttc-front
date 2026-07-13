import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Project } from "@/types/projects.types";
import type { Client } from "@/types/clients.types";
import { ProjectHeader } from "./ProjectHeader";

function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    id: 1,
    userId: 1,
    clientId: 1,
    title: "Translate manual",
    description: "Technical manual translation, 40 pages.",
    status: "ACTIVE",
    sourceLanguage: "EN",
    targetLanguage: "FR",
    wordCount: 12000,
    unitPrice: null,
    fixedFee: null,
    hourlyRate: 45,
    perWordRate: null,
    currency: "EUR",
    deadline: "2026-08-15T00:00:00.000Z",
    startDate: "2026-07-01T00:00:00.000Z",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function makeClient(overrides: Partial<Client> = {}): Client {
  return {
    id: 1,
    userId: 1,
    name: "Acme Corp",
    legalName: "Acme Corporation Ltd.",
    email: "contact@acme.com",
    phone: "+1 555 0100",
    company: "Acme",
    address: "123 Main St",
    addressLine2: null,
    city: "Springfield",
    country: "US",
    state: null,
    postalCode: "12345",
    vatNumber: "US123456789",
    legalForm: null,
    color: null,
    notes: null,
    hubspotId: null,
    clientType: "COMPANY",
    firstName: null,
    lastName: null,
    paymentDelayDays: 30,
    taxRate: 0,
    billingEndOfMonth: false,
    website: "https://acme.com",
    industry: "TECHNOLOGY",
    status: "CLIENT",
    contactedAt: null,
    tags: [],
    contacts: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

const clients: Client[] = [makeClient()];

const meta: Meta<typeof ProjectHeader> = {
  component: ProjectHeader,
  title: "Organisms/ProjectHeader",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <Story />
      </QueryClientProvider>
    ),
  ],
  args: {
    project: makeProject(),
    clients,
    onUpdate: () => Promise.resolve(),
    saving: false,
  },
};
export default meta;
type Story = StoryObj<typeof ProjectHeader>;

export const Default: Story = {};

export const NoClient: Story = {
  args: {
    project: makeProject({ clientId: null, hourlyRate: null }),
  },
};

export const Saving: Story = {
  args: { saving: true },
};
