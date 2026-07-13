import type { Meta, StoryObj } from "@storybook/react-vite";
import { MemoryRouter } from "react-router-dom";
import type { Client } from "@/types/clients.types";
import { ClientCard } from "./ClientCard";

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
    addressLine2: null,
    city: "Paris",
    country: "France",
    state: null,
    postalCode: "75002",
    vatNumber: "FR12345678901",
    legalForm: null,
    color: null,
    notes: null,
    hubspotId: null,
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
    contacts: [
      {
        id: 1,
        clientId: 1,
        firstName: "Jane",
        lastName: "Doe",
        email: "jane@acme.com",
        phone: null,
        jobTitle: null,
        color: null,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    ],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

const meta: Meta<typeof ClientCard> = {
  component: ClientCard,
  title: "Organisms/ClientCard",
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div className="max-w-2xl">
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
  args: {
    onDelete: () => {},
  },
};
export default meta;
type Story = StoryObj<typeof ClientCard>;

export const Default: Story = { args: { client: makeClient() } };

export const Individual: Story = {
  args: {
    client: makeClient({
      id: 2,
      name: "John Smith",
      legalName: null,
      clientType: "INDIVIDUAL",
      industry: null,
      tags: [],
      contacts: [],
    }),
  },
};

export const ManyTagsAndContacts: Story = {
  args: {
    client: makeClient({
      id: 3,
      name: "Globex Inc",
      tags: [
        { id: 1, name: "VIP" },
        { id: 2, name: "Priority" },
        { id: 3, name: "Legal review" },
      ],
      contacts: [
        {
          id: 1,
          clientId: 3,
          firstName: "Jane",
          lastName: "Doe",
          email: "jane@globex.com",
          phone: null,
          jobTitle: null,
          color: null,
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
        {
          id: 2,
          clientId: 3,
          firstName: "Bob",
          lastName: "Lee",
          email: "bob@globex.com",
          phone: null,
          jobTitle: null,
          color: null,
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
      ],
      hubspotId: "hs-123",
    }),
  },
};
