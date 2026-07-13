import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { AdminRatesPage } from "./AdminRatesPage";

const meta: Meta<typeof AdminRatesPage> = {
  component: AdminRatesPage,
  title: "Pages/AdminRatesPage",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter initialEntries={["/admin/rates"]}>
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
type Story = StoryObj<typeof AdminRatesPage>;

export const Default: Story = {};
