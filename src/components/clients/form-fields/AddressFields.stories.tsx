import type { Meta, StoryObj } from "@storybook/react-vite";
import { AddressFields } from "./AddressFields";

const meta: Meta<typeof AddressFields> = {
  component: AddressFields,
  title: "Molecules/AddressFields",
  args: {
    address: "123 Main St",
    addressLine2: "Suite 200",
    city: "Paris",
    state: "Ile-de-France",
    postalCode: "75001",
    country: "France",
    onChange: () => {},
  },
  render: (args) => (
    <div className="grid grid-cols-2 gap-3 w-[480px]">
      <AddressFields {...args} />
    </div>
  ),
};
export default meta;
type Story = StoryObj<typeof AddressFields>;

export const Default: Story = {};

export const Empty: Story = {
  args: {
    address: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  },
};
