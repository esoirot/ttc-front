import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "./button";

const meta: Meta<typeof Button> = {
  component: Button,
  title: "ui/Button",
  args: { children: "Button" },
};
export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {};

export const Outline: Story = { args: { variant: "outline" } };

export const Secondary: Story = { args: { variant: "secondary" } };

export const Ghost: Story = { args: { variant: "ghost" } };

export const Destructive: Story = {
  args: { variant: "destructive", children: "Delete" },
};

export const Link: Story = { args: { variant: "link" } };

export const Disabled: Story = { args: { disabled: true } };

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Button size="xs">XS</Button>
      <Button size="sm">SM</Button>
      <Button size="default">Default</Button>
      <Button size="lg">LG</Button>
      <Button size="icon-xs">🔍</Button>
      <Button size="icon-sm">🔍</Button>
      <Button size="icon">🔍</Button>
      <Button size="icon-lg">🔍</Button>
    </div>
  ),
};
