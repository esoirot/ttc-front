import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AdminRatesTable } from "./AdminRatesTable";

const meta: Meta<typeof AdminRatesTable> = {
  component: AdminRatesTable,
  title: "Organisms/AdminRatesTable",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <Story />
      </QueryClientProvider>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof AdminRatesTable>;

export const Default: Story = {};
