import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { IntlProvider } from "react-intl";
import { messages } from "@/i18n/messages";
import { CreateInvoiceForm } from "./CreateInvoiceForm";

const meta: Meta<typeof CreateInvoiceForm> = {
  component: CreateInvoiceForm,
  title: "Molecules/CreateInvoiceForm",
  decorators: [
    (Story) => (
      <IntlProvider locale="en" messages={messages.en}>
        <QueryClientProvider client={new QueryClient()}>
          <Story />
        </QueryClientProvider>
      </IntlProvider>
    ),
  ],
  args: {
    onClose: () => {},
    onCreated: () => {},
  },
};
export default meta;
type Story = StoryObj<typeof CreateInvoiceForm>;

export const Default: Story = {};
