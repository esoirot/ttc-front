import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { IntlProvider } from "react-intl";
import { messages } from "@/i18n/messages";
import { CustomFieldsSection } from "./CustomFieldsSection";

const meta: Meta<typeof CustomFieldsSection> = {
  component: CustomFieldsSection,
  title: "Molecules/CustomFieldsSection",
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
    activityId: 1,
    initialFields: [
      { id: 1, activityId: 1, key: "Platform", value: "Upwork" },
      { id: 2, activityId: 1, key: "Rate basis", value: "Hourly" },
    ],
  },
};
export default meta;
type Story = StoryObj<typeof CustomFieldsSection>;

export const Default: Story = {};

export const Empty: Story = { args: { initialFields: [] } };
