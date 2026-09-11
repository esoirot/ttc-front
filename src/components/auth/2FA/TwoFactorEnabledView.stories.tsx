import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { IntlProvider } from "react-intl";
import { messages } from "@/i18n/messages";
import { TwoFactorEnabledView } from "./TwoFactorEnabledView";

const meta: Meta<typeof TwoFactorEnabledView> = {
  component: TwoFactorEnabledView,
  title: "Organisms/TwoFactorEnabledView",
  decorators: [
    (Story) => (
      <IntlProvider locale="en" messages={messages.en}>
        <QueryClientProvider client={new QueryClient()}>
          <div className="max-w-sm">
            <Story />
          </div>
        </QueryClientProvider>
      </IntlProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "No backend/MSW mocking is configured yet — `useBackupCodeCount()` fires a real query that fails fast in Storybook's sandbox, so the backup-code count line never renders here. That's an accepted limitation, not a bug.",
      },
    },
  },
  args: {
    onCodesRegenerated: () => {},
  },
};
export default meta;
type Story = StoryObj<typeof TwoFactorEnabledView>;

export const Default: Story = {};
