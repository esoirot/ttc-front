import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectForm } from "./ConnectForm";

const meta: Meta<typeof ConnectForm> = {
  component: ConnectForm,
  title: "Molecules/ConnectForm",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <Story />
      </QueryClientProvider>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof ConnectForm>;

export const Default: Story = {};
