import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RateSheetList } from "./RateSheetList";

const meta: Meta<typeof RateSheetList> = {
  component: RateSheetList,
  title: "Organisms/RateSheetList",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <Story />
      </QueryClientProvider>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof RateSheetList>;

export const Default: Story = {};
