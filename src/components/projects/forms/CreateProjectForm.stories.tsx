import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { IntlProvider } from "react-intl";
import { messages } from "@/i18n/messages";
import { CreateProjectForm } from "./CreateProjectForm";

const meta: Meta<typeof CreateProjectForm> = {
  component: CreateProjectForm,
  title: "Molecules/CreateProjectForm",
  decorators: [
    (Story) => (
      <IntlProvider locale="en" messages={messages.en}>
        <QueryClientProvider client={new QueryClient()}>
          <Story />
        </QueryClientProvider>
      </IntlProvider>
    ),
  ],
  args: {
    onClose: () => {},
  },
};
export default meta;
type Story = StoryObj<typeof CreateProjectForm>;

export const Default: Story = {};
