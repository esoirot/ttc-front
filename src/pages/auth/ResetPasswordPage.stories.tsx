import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { ResetPasswordPage } from "./ResetPasswordPage";

const meta: Meta<typeof ResetPasswordPage> = {
  component: ResetPasswordPage,
  title: "Pages/ResetPasswordPage",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter
          initialEntries={["/reset-password?token=mock-reset-token"]}
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
          "This page reads ?token= from the URL and shows an 'Invalid link' fallback when it's missing — the MemoryRouter decorator supplies a mock ?token= so the story reaches the actual new-password form instead of the fallback.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof ResetPasswordPage>;

export const Default: Story = {};
