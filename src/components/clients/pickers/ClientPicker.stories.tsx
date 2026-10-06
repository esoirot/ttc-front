import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { IntlProvider } from "react-intl";
import { messages } from "@/i18n/messages";
import { ClientPicker } from "./ClientPicker";

const meta: Meta<typeof ClientPicker> = {
  component: ClientPicker,
  title: "Molecules/ClientPicker",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <IntlProvider locale="en" messages={messages.en}>
          <div className="w-64">
            <Story />
          </div>
        </IntlProvider>
      </QueryClientProvider>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof ClientPicker>;

function Picker() {
  const [value, setValue] = useState("");
  return (
    <ClientPicker
      value={value}
      onChange={setValue}
      placeholder="No client"
      noneLabel="No client"
    />
  );
}

export const Default: Story = { render: () => <Picker /> };
