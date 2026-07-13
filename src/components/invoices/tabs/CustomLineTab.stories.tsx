import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CustomLineTab } from "./CustomLineTab";

const meta: Meta<typeof CustomLineTab> = {
  component: CustomLineTab,
  title: "Organisms/CustomLineTab",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <div className="max-w-lg">
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
  args: {
    invoiceId: 1,
    onAdd: () => Promise.resolve({}),
    adding: false,
  },
};
export default meta;
type Story = StoryObj<typeof CustomLineTab>;

export const Default: Story = {};

export const Adding: Story = {
  args: { adding: true },
};
