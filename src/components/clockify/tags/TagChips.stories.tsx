import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { IntlProvider } from "react-intl";
import { messages } from "@/i18n/messages";
import { TagChips } from "./TagChips";
import type { ClockifyTag } from "@/types/clockify.types";

const tags: ClockifyTag[] = [
  { id: "t1", name: "Urgent", workspaceId: "ws1", archived: false },
  { id: "t2", name: "Client review", workspaceId: "ws1", archived: false },
  { id: "t3", name: "Internal", workspaceId: "ws1", archived: false },
];

const meta: Meta<typeof TagChips> = {
  component: TagChips,
  title: "Molecules/TagChips",
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
    workspaceId: "ws1",
    tags,
    onAdd: () => {},
    onRemove: () => {},
  },
};
export default meta;
type Story = StoryObj<typeof TagChips>;

export const Default: Story = { args: { tagIds: ["t1", "t2"] } };

export const NoTagsSelected: Story = { args: { tagIds: [] } };
