import type { Meta, StoryObj } from "@storybook/react-vite";
import { ExportCsvButton } from "./ExportCsvButton";

const meta: Meta<typeof ExportCsvButton> = {
  component: ExportCsvButton,
  title: "Molecules/ExportCsvButton",
  args: {
    rows: [
      { id: 1, name: "Acme Corp", email: "billing@acme.test" },
      { id: 2, name: "Globex Inc", email: "ap@globex.test" },
    ],
    filename: "clients.csv",
  },
};
export default meta;
type Story = StoryObj<typeof ExportCsvButton>;

export const Default: Story = {};

export const Empty: Story = {
  args: {
    rows: [],
    filename: "empty.csv",
  },
};
