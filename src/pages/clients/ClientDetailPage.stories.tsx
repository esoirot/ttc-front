import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ClientDetailPage } from "./ClientDetailPage";

const meta: Meta<typeof ClientDetailPage> = {
  component: ClientDetailPage,
  title: "Pages/ClientDetailPage",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter initialEntries={["/clients/1"]}>
          <Routes>
            <Route path="/clients/:id" element={<Story />} />
          </Routes>
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
type Story = StoryObj<typeof ClientDetailPage>;

export const Default: Story = {};
