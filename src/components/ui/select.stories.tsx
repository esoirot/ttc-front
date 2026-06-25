import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

const meta: Meta<typeof Select> = {
  component: Select,
  title: "ui/Select",
};
export default meta;
type Story = StoryObj<typeof Select>;

export const Default: Story = {
  render: () => (
    <Select defaultValue="EUR">
      <SelectTrigger className="w-32">
        <SelectValue placeholder="Currency" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="EUR">EUR</SelectItem>
        <SelectItem value="USD">USD</SelectItem>
        <SelectItem value="GBP">GBP</SelectItem>
      </SelectContent>
    </Select>
  ),
};
