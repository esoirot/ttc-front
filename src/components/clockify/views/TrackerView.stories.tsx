import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { IntlProvider } from "react-intl";
import { messages } from "@/i18n/messages";
import { TrackerView } from "./TrackerView";

const meta: Meta<typeof TrackerView> = {
  component: TrackerView,
  title: "Organisms/TrackerView",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <IntlProvider locale="en" messages={messages.en}>
          <div className="max-w-4xl">
            <Story />
          </div>
        </IntlProvider>
      </QueryClientProvider>
    ),
  ],
  args: {
    workspaceId: "ws-1",
  },
};
export default meta;
type Story = StoryObj<typeof TrackerView>;

export const Default: Story = {};
