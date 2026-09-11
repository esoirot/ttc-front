import type { Meta, StoryObj } from "@storybook/react-vite";
import { IntlProvider } from "react-intl";
import { messages } from "@/i18n/messages";
import { GoogleOAuthButton } from "./GoogleOAuthButton";

const meta: Meta<typeof GoogleOAuthButton> = {
  component: GoogleOAuthButton,
  title: "Molecules/GoogleOAuthButton",
  args: {},
  decorators: [
    (Story) => (
      <IntlProvider locale="en" messages={messages.en}>
        <Story />
      </IntlProvider>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof GoogleOAuthButton>;

export const Default: Story = {};

export const WithRedirectDestination: Story = {
  args: { from: "/projects" },
};
