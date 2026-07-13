import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { TwoFactorVerifyPage } from "./TwoFactorVerifyPage";

const meta: Meta<typeof TwoFactorVerifyPage> = {
  component: TwoFactorVerifyPage,
  title: "Pages/TwoFactorVerifyPage",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter
          initialEntries={[
            {
              pathname: "/2fa/verify",
              state: { tempToken: "mock-temp-token", from: "/" },
            },
          ]}
        >
          <Story />
        </MemoryRouter>
      </QueryClientProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "This page redirects to /login via <Navigate/> when location.state.tempToken is missing — the MemoryRouter decorator supplies mock router state ({ tempToken, from }) so the story reaches the actual TOTP form instead of the redirect.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof TwoFactorVerifyPage>;

export const Default: Story = {};
