import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RateList } from "./RateList";

const meta: Meta<typeof RateList> = {
  component: RateList,
  title: "Organisms/RateList",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <Story />
      </QueryClientProvider>
    ),
  ],
  args: {
    type: "HOURLY",
  },
};
export default meta;
type Story = StoryObj<typeof RateList>;

export const Hourly: Story = {};

export const PerWord: Story = { args: { type: "PER_WORD" } };

export const FixedFee: Story = { args: { type: "FIXED" } };
