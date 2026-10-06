import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { IntlProvider } from "react-intl";
import { messages } from "@/i18n/messages";
import { AddChargeForm } from "./AddChargeForm";

const meta: Meta<typeof AddChargeForm> = {
  component: AddChargeForm,
  title: "Molecules/AddChargeForm",
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
    occupationId: 1,
    type: "FIXED",
  },
};
export default meta;
type Story = StoryObj<typeof AddChargeForm>;

export const Default: Story = {};

export const Variable: Story = { args: { type: "VARIABLE" } };
