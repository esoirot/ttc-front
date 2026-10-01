import type { Meta, StoryObj } from "@storybook/react-vite";
import { toast } from "sonner";
import { Button } from "./button";
import { Toaster } from "./sonner";

const meta: Meta<typeof Toaster> = {
  component: Toaster,
  title: "Atoms/Sonner",
};
export default meta;
type Story = StoryObj<typeof Toaster>;

export const ErrorToast: Story = {
  render: () => (
    <>
      <Toaster richColors closeButton />
      <Button onClick={() => toast.error("Could not save changes")}>
        Show error toast
      </Button>
    </>
  ),
};
