import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CompanyContact } from "@/types/clients.types";
import { ContactRow } from "./ContactRow";

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

const meta: Meta<typeof ContactRow> = {
  component: ContactRow,
  title: "Organisms/ContactRow",
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
  args: {
    onDelete: () => {},
    onEdit: () => Promise.resolve(),
    saving: false,
  },
};
export default meta;
type Story = StoryObj<typeof ContactRow>;

export const Default: Story = { args: { contact: makeContact() } };

export const NoNameEmailOnly: Story = {
  args: {
    contact: makeContact({
      id: 2,
      firstName: null,
      lastName: null,
      phone: null,
    }),
  },
};

export const Saving: Story = {
  args: { contact: makeContact(), saving: true },
};
