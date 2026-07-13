import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CompaniesTab } from "./CompaniesTab";

const meta: Meta<typeof CompaniesTab> = {
  component: CompaniesTab,
  title: "Organisms/CompaniesTab",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <div className="max-w-4xl">
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof CompaniesTab>;

export const Default: Story = {};
