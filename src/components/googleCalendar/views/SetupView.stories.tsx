import type { Meta, StoryObj } from "@storybook/react-vite";
import { IntlProvider } from "react-intl";
import { messages } from "@/i18n/messages";
import { SetupView } from "./SetupView";

const meta: Meta<typeof SetupView> = {
  component: SetupView,
  title: "Molecules/GoogleCalendarSetupView",
  decorators: [
    (Story) => (
      <IntlProvider locale="en" messages={messages.en}>
        <Story />
      </IntlProvider>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof SetupView>;

export const Default: Story = {};
