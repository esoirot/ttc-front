import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { RegisterPage } from "./RegisterPage";

const meta: Meta<typeof RegisterPage> = {
  component: RegisterPage,
  title: "Pages/RegisterPage",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter initialEntries={["/register"]}>
          <Story />
        </MemoryRouter>
      </QueryClientProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "No backend/MSW mocking is configured yet — the form renders fully client-side (AuthLayout + RegisterForm + GoogleOAuthButton) with no ungated queries on mount, so it always renders the ready state.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof RegisterPage>;

export const Default: Story = {};
