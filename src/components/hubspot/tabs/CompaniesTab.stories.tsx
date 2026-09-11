import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { IntlProvider } from "react-intl";
import { messages } from "@/i18n/messages";
import { CompaniesTab } from "./CompaniesTab";

const meta: Meta<typeof CompaniesTab> = {
  component: CompaniesTab,
  title: "Organisms/CompaniesTab",
  decorators: [
    (Story) => (
      <IntlProvider locale="en" messages={messages.en}>
        <QueryClientProvider client={new QueryClient()}>
          <div className="max-w-4xl">
            <Story />
          </div>
        </QueryClientProvider>
      </IntlProvider>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof CompaniesTab>;

export const Default: Story = {};
