import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TagsSection } from "./TagsSection";

const meta: Meta<typeof TagsSection> = {
  component: TagsSection,
  title: "Organisms/TagsSection",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <div className="max-w-md border border-border rounded-md p-4">
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "No backend/MSW mocking is configured yet — `useTags()` fires a real query that fails fast in Storybook's sandbox and settles into the empty state below. That's an accepted limitation, not a bug.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof TagsSection>;

export const Default: Story = {};
