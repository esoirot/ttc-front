import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command";

const meta: Meta<typeof Command> = {
  component: Command,
  title: "Molecules/Command",
};
export default meta;
type Story = StoryObj<typeof Command>;

export const Default: Story = {
  render: () => (
    <Command className="w-56 rounded-lg border border-border">
      <CommandInput placeholder="Search…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandItem>Urgent</CommandItem>
        <CommandItem data-checked="true">Client review</CommandItem>
        <CommandItem>Internal</CommandItem>
      </CommandList>
    </Command>
  ),
};
