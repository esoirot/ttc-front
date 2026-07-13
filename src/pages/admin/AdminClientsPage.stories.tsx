import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { AdminClientsPage } from "./AdminClientsPage";

const meta: Meta<typeof AdminClientsPage> = {
  component: AdminClientsPage,
  title: "Pages/AdminClientsPage",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter initialEntries={["/admin/clients"]}>
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
type Story = StoryObj<typeof AdminClientsPage>;

export const Default: Story = {};
