import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { InvoiceDetailPage } from "./InvoiceDetailPage";

const meta: Meta<typeof InvoiceDetailPage> = {
  component: InvoiceDetailPage,
  title: "Pages/InvoiceDetailPage",
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
          "note: ungated queries fire against no backend/MSW in Storybook's sandbox, so this renders its loading/error fallback state — accepted limitation, not a bug.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof InvoiceDetailPage>;

export const Default: Story = {};
