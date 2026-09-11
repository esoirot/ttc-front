import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { IntlProvider } from "react-intl";
import { messages } from "@/i18n/messages";
import { InvoiceMetaCard } from "./InvoiceMetaCard";

const meta: Meta<typeof InvoiceMetaCard> = {
  component: InvoiceMetaCard,
  title: "Organisms/InvoiceMetaCard",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <IntlProvider locale="en" messages={messages.en}>
          <div className="max-w-md">
            <Story />
          </div>
        </IntlProvider>
      </QueryClientProvider>
    ),
  ],
  args: {
    clientId: 1,
    currency: "EUR",
    dueDate: "2026-06-15T00:00:00.000Z",
    notes: "Net 30 payment terms.",
    onUpdate: () => Promise.resolve(),
  },
};
export default meta;
type Story = StoryObj<typeof InvoiceMetaCard>;

export const Default: Story = {};

export const NoClientNoNotes: Story = {
  args: { clientId: null, dueDate: null, notes: null },
};
