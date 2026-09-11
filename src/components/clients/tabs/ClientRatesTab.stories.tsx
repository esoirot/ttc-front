import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { IntlProvider } from "react-intl";
import { messages } from "@/i18n/messages";
import { ClientRatesTab } from "./ClientRatesTab";

const meta: Meta<typeof ClientRatesTab> = {
  component: ClientRatesTab,
  title: "Organisms/ClientRatesTab",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <IntlProvider locale="en" messages={messages.en}>
          <MemoryRouter>
            <div className="max-w-lg">
              <Story />
            </div>
          </MemoryRouter>
        </IntlProvider>
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
