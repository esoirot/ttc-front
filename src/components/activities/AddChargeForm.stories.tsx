import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AddChargeForm } from "./AddChargeForm";

const meta: Meta<typeof AddChargeForm> = {
  component: AddChargeForm,
  title: "Molecules/AddChargeForm",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <Story />
      </QueryClientProvider>
    ),
  ],
  args: {
    activityId: 1,
    type: "FIXED",
  },
};
export default meta;
type Story = StoryObj<typeof AddChargeForm>;

export const Default: Story = {};

export const Variable: Story = { args: { type: "VARIABLE" } };
