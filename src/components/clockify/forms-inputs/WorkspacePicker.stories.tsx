import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { IntlProvider } from "react-intl";
import { messages } from "@/i18n/messages";
import { WorkspacePicker } from "./WorkspacePicker";

const meta: Meta<typeof WorkspacePicker> = {
  component: WorkspacePicker,
  title: "Molecules/WorkspacePicker",
  decorators: [
    (Story) => (
      <IntlProvider locale="en" messages={messages.en}>
        <QueryClientProvider client={new QueryClient()}>
          <Story />
        </QueryClientProvider>
      </IntlProvider>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof WorkspacePicker>;

export const Default: Story = {};
