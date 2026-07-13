import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Tag } from "@/types/tags.types";
import { ManualEntryForm } from "./ManualEntryForm";

const tags: Tag[] = [
  { id: 1, name: "Urgent" },
  { id: 2, name: "Client review" },
];

const recentDescriptions = ["Translation", "Proofreading", "Editing"];

const meta: Meta<typeof ManualEntryForm> = {
  component: ManualEntryForm,
  title: "Molecules/ManualEntryForm",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <Story />
      </QueryClientProvider>
    ),
  ],
  args: {
    onClose: () => {},
    recentDescriptions,
    tags,
  },
};
export default meta;
type Story = StoryObj<typeof ManualEntryForm>;

export const Default: Story = {};

export const NoTagsOrRecentDescriptions: Story = {
  args: { tags: [], recentDescriptions: [] },
};
