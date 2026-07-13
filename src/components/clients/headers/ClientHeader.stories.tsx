import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Client } from "@/types/clients.types";
import { ClientHeader } from "./ClientHeader";

function makeClient(overrides: Partial<Client> = {}): Client {
  return {
    id: 1,
    userId: 1,
    name: "Acme Corp",
    legalName: "Acme Corporation Ltd",
    email: "contact@acme.com",
    phone: "+33 1 23 45 67 89",
    company: null,
    address: "12 Rue de la Paix",
    addressLine2: "Suite 200",
    city: "Paris",
    country: "France",
    state: "Île-de-France",
    postalCode: "75002",
    vatNumber: "FR12345678901",
    legalForm: "SAS",
    color: "#D2D5DA",
    notes: "VIP account, prefers email contact.",
    hubspotId: "hs-123",
    clientType: "COMPANY",
    firstName: null,
    lastName: null,
    paymentDelayDays: 30,
    taxRate: 20,
    billingEndOfMonth: true,
    website: "https://acme.com",
    industry: "TECHNOLOGY",
    status: "CLIENT",
    contactedAt: "2026-05-01T00:00:00.000Z",
    tags: [{ id: 1, name: "VIP" }],
    contacts: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

const meta: Meta<typeof ClientHeader> = {
  component: ClientHeader,
  title: "Organisms/ClientHeader",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <div className="max-w-2xl">
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
  args: {
    onUpdate: () => Promise.resolve(),
    saving: false,
  },
};
export default meta;
type Story = StoryObj<typeof ClientHeader>;

export const Default: Story = { args: { client: makeClient() } };

export const Individual: Story = {
  args: {
    client: makeClient({
      id: 2,
      name: "John Smith",
      legalName: null,
      clientType: "INDIVIDUAL",
      firstName: "John",
      lastName: "Smith",
      hubspotId: null,
      paymentDelayDays: null,
      taxRate: null,
      billingEndOfMonth: false,
      tags: [],
    }),
  },
};

export const Saving: Story = {
  args: { client: makeClient(), saving: true },
};
