import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { IntlProvider } from "react-intl";
import { messages } from "@/i18n/messages";
import { ProfileTab } from "./ProfileTab";

const meta: Meta<typeof ProfileTab> = {
  component: ProfileTab,
  title: "Organisms/ProfileTab",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <IntlProvider locale="en" messages={messages.en}>
          <div className="max-w-2xl">
            <Story />
          </div>
        </IntlProvider>
      </QueryClientProvider>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof ProfileTab>;

export const Default: Story = {};
