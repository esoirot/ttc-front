import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverDescription,
  PopoverTrigger,
} from "./popover";
import { Button } from "./button";

const meta: Meta<typeof Popover> = {
  component: Popover,
  title: "ui/Popover",
};
export default meta;
type Story = StoryObj<typeof Popover>;

export const Default: Story = {
  render: () => (
    <Popover defaultOpen>
      <PopoverTrigger asChild>
        <Button variant="outline">Details</Button>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverTitle>Word count</PopoverTitle>
        <PopoverDescription>
          1,000 words at 0.10 USD/word — estimated 100.00 USD.
        </PopoverDescription>
      </PopoverContent>
    </Popover>
  ),
};
