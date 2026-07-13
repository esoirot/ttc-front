import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WorkspacePicker } from "./WorkspacePicker";

const meta: Meta<typeof WorkspacePicker> = {
  component: WorkspacePicker,
  title: "Molecules/WorkspacePicker",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <Story />
      </QueryClientProvider>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof WorkspacePicker>;

export const Default: Story = {};
