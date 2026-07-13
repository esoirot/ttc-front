import type { Meta, StoryObj } from "@storybook/react-vite";
import { ClientForm } from "./ClientForm";

const meta: Meta<typeof ClientForm> = {
  component: ClientForm,
  title: "Molecules/ClientForm",
  args: {
    form: {
      name: "",
      email: "",
      phone: "",
      legalName: "",
      vatNumber: "",
      address: "",
      city: "",
      country: "",
      postalCode: "",
    },
    onChange: () => {},
  },
};
export default meta;
type Story = StoryObj<typeof ClientForm>;

export const Default: Story = {};

export const Filled: Story = {
  args: {
    form: {
      name: "Acme Corp",
      email: "billing@acme.test",
      phone: "+1 555 0100",
      legalName: "Acme Corporation LLC",
      vatNumber: "US123456789",
      address: "123 Market St",
      city: "San Francisco",
      country: "USA",
      postalCode: "94103",
    },
  },
};
