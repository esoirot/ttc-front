import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { ForgotPasswordPage } from "./ForgotPasswordPage";

const meta: Meta<typeof ForgotPasswordPage> = {
  component: ForgotPasswordPage,
  title: "Pages/ForgotPasswordPage",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter initialEntries={["/forgot-password"]}>
          <Story />
        </MemoryRouter>
      </QueryClientProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "No backend/MSW mocking is configured yet — the form renders fully client-side with no ungated queries on mount, so it always renders the ready state.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof ForgotPasswordPage>;

export const Default: Story = {};
