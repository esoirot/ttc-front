import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { IntlProvider } from "react-intl";
import { messages } from "@/i18n/messages";
import { GoogleCalendarTab } from "./GoogleCalendarTab";

const meta: Meta<typeof GoogleCalendarTab> = {
  component: GoogleCalendarTab,
  title: "Organisms/GoogleCalendarTab",
  decorators: [
    (Story) => (
      <IntlProvider locale="en" messages={messages.en}>
        <QueryClientProvider client={new QueryClient()}>
          <div className="max-w-2xl">
            <Story />
          </div>
        </QueryClientProvider>
      </IntlProvider>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof GoogleCalendarTab>;

export const Default: Story = {};
