import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { TwoFactorSetupPage } from "./TwoFactorSetupPage";

const meta: Meta<typeof TwoFactorSetupPage> = {
  component: TwoFactorSetupPage,
  title: "Pages/TwoFactorSetupPage",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter initialEntries={["/settings/2fa"]}>
          <Story />
        </MemoryRouter>
      </QueryClientProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "note: ungated queries fire against no backend/MSW in Storybook's sandbox, so this renders its loading/error fallback state — accepted limitation, not a bug.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof TwoFactorSetupPage>;

export const Default: Story = {};
