import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { IntlProvider } from "react-intl";
import { messages } from "@/i18n/messages";
import { TimeEntriesView } from "./TimeEntriesView";

const meta: Meta<typeof TimeEntriesView> = {
  component: TimeEntriesView,
  title: "Organisms/TimeEntriesView",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <IntlProvider locale="en" messages={messages.en}>
          <Story />
        </IntlProvider>
      </QueryClientProvider>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof TimeEntriesView>;

export const Default: Story = {};
