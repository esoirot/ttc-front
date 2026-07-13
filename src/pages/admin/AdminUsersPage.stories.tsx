import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { AdminUsersPage } from "./AdminUsersPage";

const meta: Meta<typeof AdminUsersPage> = {
  component: AdminUsersPage,
  title: "Pages/AdminUsersPage",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter initialEntries={["/admin/users"]}>
          <Story />
        </MemoryRouter>
      </QueryClientProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "note: ungated queries fire against no backend/MSW in Storybook's sandbox, so this renders its loading/error fallback state — accepted limitation, not a bug. Role-gated content (this is an admin page, gated by useCurrentUser) also falls back accordingly.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof AdminUsersPage>;

export const Default: Story = {};
