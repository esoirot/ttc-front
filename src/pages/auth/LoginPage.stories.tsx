import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { LoginPage } from "./LoginPage";

const meta: Meta<typeof LoginPage> = {
  component: LoginPage,
  title: "Pages/LoginPage",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter initialEntries={["/login"]}>
          <Story />
        </MemoryRouter>
      </QueryClientProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "No backend/MSW mocking is configured yet — `useCurrentUser()` fires a real query that fails fast in Storybook's sandbox and settles into the logged-out form below. That's an accepted limitation, not a bug.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof LoginPage>;

export const Default: Story = {};
