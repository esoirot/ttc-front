import type { Meta, StoryObj } from "@storybook/react-vite";
import { MemoryRouter } from "react-router-dom";
import { DndContext } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import type { Client } from "@/types/clients.types";
import { ProspectCard } from "./ProspectCard";

function makeClient(overrides: Partial<Client> = {}): Client {
  return {
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
    status: "TO_CONTACT",
    contactedAt: null,
    tags: [],
    contacts: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

const meta: Meta<typeof ProspectCard> = {
  component: ProspectCard,
  title: "Organisms/ProspectCard",
  decorators: [
    (Story) => (
      <MemoryRouter>
        <DndContext>
          <SortableContext items={[1]}>
            <div className="max-w-xs">
              <Story />
            </div>
          </SortableContext>
        </DndContext>
      </MemoryRouter>
    ),
  ],
  args: {
    onDelete: () => {},
  },
};
export default meta;
type Story = StoryObj<typeof ProspectCard>;

export const Default: Story = { args: { client: makeClient() } };

export const NotYetContacted: Story = {
  args: { client: makeClient({ contactedAt: null }) },
};

export const Contacted: Story = {
  args: {
    client: makeClient({
      name: "Beta Studios",
      contactedAt: "2026-06-01T00:00:00.000Z",
    }),
  },
};
