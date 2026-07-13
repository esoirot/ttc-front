import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { InvoiceDetail } from "./InvoiceDetail";

const meta: Meta<typeof InvoiceDetail> = {
  component: InvoiceDetail,
  title: "Organisms/InvoiceDetail",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter initialEntries={["/invoices/1"]}>
          <Routes>
            <Route path="/invoices/:id" element={<Story />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "No backend/MSW mocking is configured yet — useInvoiceDetail's queries (useInvoice/useCurrentUser) fire for real and fail fast in Storybook's sandbox, so this settles into the 'Invoice not found.' state. That's an accepted current limitation, not a per-story bug.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof InvoiceDetail>;

export const Default: Story = {};
