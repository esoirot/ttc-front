import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { IntlProvider } from "react-intl";
import { messages } from "@/i18n/messages";
import { InvoicesList } from "./InvoicesList";

const meta: Meta<typeof InvoicesList> = {
  component: InvoicesList,
  title: "Organisms/InvoicesList",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <IntlProvider locale="en" messages={messages.en}>
          <MemoryRouter>
            <Story />
          </MemoryRouter>
        </IntlProvider>
      </QueryClientProvider>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof InvoicesList>;

export const Default: Story = {};
