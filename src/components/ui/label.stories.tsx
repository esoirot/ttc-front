import type { Meta, StoryObj } from "@storybook/react-vite";
import { Label } from "./label";
import { Input } from "./input";

const meta: Meta<typeof Label> = {
  component: Label,
  title: "Atoms/Label",
};
export default meta;
type Story = StoryObj<typeof Label>;

export const Default: Story = { args: { children: "Email" } };

export const WithInput: Story = {
  render: () => (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="story-email">Email</Label>
      <Input id="story-email" placeholder="you@example.com" />
    </div>
  ),
};
