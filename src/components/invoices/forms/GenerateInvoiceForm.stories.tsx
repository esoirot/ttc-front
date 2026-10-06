import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { IntlProvider } from "react-intl";
import { messages } from "@/i18n/messages";
import { GenerateInvoiceForm } from "./GenerateInvoiceForm";

const meta: Meta<typeof GenerateInvoiceForm> = {
  component: GenerateInvoiceForm,
  title: "Molecules/GenerateInvoiceForm",
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
    onGenerated: () => {},
  },
};
export default meta;
type Story = StoryObj<typeof GenerateInvoiceForm>;

export const Default: Story = {};
