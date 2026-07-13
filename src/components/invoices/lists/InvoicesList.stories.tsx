import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { InvoicesList } from "./InvoicesList";

const meta: Meta<typeof InvoicesList> = {
  component: InvoicesList,
  title: "Organisms/InvoicesList",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter>
          <Story />
        </MemoryRouter>
      </QueryClientProvider>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof InvoicesList>;

export const Default: Story = {};
