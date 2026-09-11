import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { IntlProvider } from "react-intl";
import { messages } from "@/i18n/messages";
import { RateSheetList } from "./RateSheetList";

const meta: Meta<typeof RateSheetList> = {
  component: RateSheetList,
  title: "Organisms/RateSheetList",
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
type Story = StoryObj<typeof RateSheetList>;

export const Default: Story = {};
