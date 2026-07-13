import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ClientDetail } from "./ClientDetail";

const meta: Meta<typeof ClientDetail> = {
  component: ClientDetail,
  title: "Organisms/ClientDetail",
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
          "No backend/MSW mocking is configured yet — useClientDetail's queries (useClient/useProjects/useInvoices/useTimeEntries) fire for real and fail fast in Storybook's sandbox, so this settles into the 'Client not found.' state. That's an accepted current limitation, not a per-story bug.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof ClientDetail>;

export const Default: Story = {};
