import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ProfileTab } from "./ProfileTab";

const meta: Meta<typeof ProfileTab> = {
  component: ProfileTab,
  title: "Organisms/ProfileTab",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <div className="max-w-2xl">
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof ProfileTab>;

export const Default: Story = {};
