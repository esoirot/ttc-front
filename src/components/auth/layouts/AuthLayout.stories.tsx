import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@/components/ui/button";
import { AuthLayout } from "./AuthLayout";

const meta: Meta<typeof AuthLayout> = {
  component: AuthLayout,
  title: "Templates/AuthLayout",
};
export default meta;
type Story = StoryObj<typeof AuthLayout>;

export const Default: Story = {
  args: {
    title: "Sign in",
    children: (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          Placeholder content — this template only owns the page shell (centered
          card + title), not the form inside it.
        </p>
        <Button className="w-full">Continue</Button>
      </div>
    ),
  },
};
