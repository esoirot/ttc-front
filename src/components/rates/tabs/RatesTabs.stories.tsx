import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RatesTabs } from "./RatesTabs";

const meta: Meta<typeof RatesTabs> = {
  component: RatesTabs,
  title: "Organisms/RatesTabs",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <Story />
      </QueryClientProvider>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof RatesTabs>;

export const Default: Story = {};
