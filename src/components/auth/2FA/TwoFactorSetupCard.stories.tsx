import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TwoFactorSetupCard } from "./TwoFactorSetupCard";

const meta: Meta<typeof TwoFactorSetupCard> = {
  component: TwoFactorSetupCard,
  title: "Organisms/TwoFactorSetupCard",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <div className="max-w-md">
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "No backend/MSW mocking is configured yet — `useCurrentUser()` fires a real query that fails fast in Storybook's sandbox and settles into the not-enabled `TwoFactorSetupFlow` panel below. That's an accepted limitation, not a bug.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof TwoFactorSetupCard>;

export const Default: Story = {};
