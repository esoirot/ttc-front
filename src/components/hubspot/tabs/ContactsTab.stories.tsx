import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ContactsTab } from "./ContactsTab";

const meta: Meta<typeof ContactsTab> = {
  component: ContactsTab,
  title: "Organisms/HubspotContactsTab",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <div className="max-w-4xl">
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof ContactsTab>;

export const Default: Story = {};
