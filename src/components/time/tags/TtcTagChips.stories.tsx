import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TtcTagChips } from "./TtcTagChips";

const tags = [
  { id: 1, name: "Urgent" },
  { id: 2, name: "Client review" },
  { id: 3, name: "Internal" },
];

const meta: Meta<typeof TtcTagChips> = {
  component: TtcTagChips,
  title: "Molecules/TtcTagChips",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <Story />
      </QueryClientProvider>
    ),
  ],
  args: {
    tags,
    onAdd: () => {},
    onRemove: () => {},
  },
};
export default meta;
type Story = StoryObj<typeof TtcTagChips>;

export const Empty: Story = { args: { tagIds: [] } };

export const WithSelectedTags: Story = { args: { tagIds: [1, 2] } };
