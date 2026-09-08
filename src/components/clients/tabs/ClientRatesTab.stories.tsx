import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { ClientRatesTab } from "./ClientRatesTab";

const meta: Meta<typeof ClientRatesTab> = {
  component: ClientRatesTab,
  title: "Organisms/ClientRatesTab",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter>
          <div className="max-w-lg">
            <Story />
          </div>
        </MemoryRouter>
      </QueryClientProvider>
    ),
  ],
  args: {
    clientId: 5,
  },
};
export default meta;
type Story = StoryObj<typeof ClientRatesTab>;

export const Default: Story = {};
