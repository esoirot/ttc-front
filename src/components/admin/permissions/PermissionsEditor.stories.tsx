import type { Meta, StoryObj } from "@storybook/react-vite";
import { PermissionsEditor } from "./PermissionsEditor";

const meta: Meta<typeof PermissionsEditor> = {
  component: PermissionsEditor,
  title: "Molecules/PermissionsEditor",
  args: {
    value: ["MANAGE_CLIENTS", "MANAGE_PROJECTS"],
    onChange: () => {},
  },
};
export default meta;
type Story = StoryObj<typeof PermissionsEditor>;

export const Default: Story = {};

export const NoneSelected: Story = {
  args: {
    value: [],
  },
};

export const AllSelected: Story = {
  args: {
    value: [
      "MANAGE_USERS",
      "MANAGE_CLIENTS",
      "MANAGE_PROJECTS",
      "MANAGE_INVOICES",
      "MANAGE_TIME",
      "MANAGE_RATES",
    ],
  },
};
