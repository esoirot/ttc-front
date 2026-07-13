import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CompanyContact } from "@/types/clients.types";
import { ContactsTab } from "./ContactsTab";

function makeContact(overrides: Partial<CompanyContact> = {}): CompanyContact {
  return {
    id: 1,
    clientId: 1,
    firstName: "Jane",
    lastName: "Doe",
    email: "jane@acme.com",
    phone: "+33 1 23 45 67 89",
    jobTitle: null,
    color: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

const meta: Meta<typeof ContactsTab> = {
  component: ContactsTab,
  title: "Organisms/ClientContactsTab",
  decorators: [
    (Story) => (
      <div className="max-w-lg">
        <Story />
      </div>
    ),
  ],
  args: {
    onDelete: () => {},
    onEdit: () => Promise.resolve(),
    onAdd: () => Promise.resolve(),
    saving: false,
    adding: false,
  },
};
export default meta;
type Story = StoryObj<typeof ContactsTab>;

export const Default: Story = {
  args: {
    contacts: [
      makeContact(),
      makeContact({
        id: 2,
        firstName: "Marc",
        lastName: "Petit",
        email: "marc@acme.com",
        phone: null,
      }),
    ],
  },
};

export const Empty: Story = { args: { contacts: [] } };
