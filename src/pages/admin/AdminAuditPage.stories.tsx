import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { AdminAuditPage } from "./AdminAuditPage";

const meta: Meta<typeof AdminAuditPage> = {
  component: AdminAuditPage,
  title: "Pages/AdminAuditPage",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter initialEntries={["/admin/audit"]}>
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
type Story = StoryObj<typeof AdminAuditPage>;

export const Default: Story = {};
