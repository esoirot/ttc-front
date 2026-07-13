import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ObjectivesForm } from "./ObjectivesForm";

const meta: Meta<typeof ObjectivesForm> = {
  component: ObjectivesForm,
  title: "Molecules/ObjectivesForm",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <Story />
      </QueryClientProvider>
    ),
  ],
  args: {
    activityId: 1,
    initial: {
      objectiveQ1: 500000,
      objectiveQ2: 750000,
      objectiveQ3: 600000,
      objectiveQ4: 900000,
    },
  },
};
export default meta;
type Story = StoryObj<typeof ObjectivesForm>;

export const Default: Story = {};

export const Empty: Story = {
  args: {
    initial: {
      objectiveQ1: null,
      objectiveQ2: null,
      objectiveQ3: null,
      objectiveQ4: null,
    },
  },
};
