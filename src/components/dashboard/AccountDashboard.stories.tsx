import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { AccountDashboard } from "./AccountDashboard";

const meta: Meta<typeof AccountDashboard> = {
  component: AccountDashboard,
  title: "Organisms/AccountDashboard",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter>
          <Story />
        </MemoryRouter>
      </QueryClientProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "No backend/MSW mocking is configured yet — `useCurrentUser()` and `useDashboard()` fire real queries that fail fast in Storybook's sandbox, so this renders its loading-skeleton state indefinitely. That's an accepted limitation, not a bug.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof AccountDashboard>;

export const Default: Story = {};
