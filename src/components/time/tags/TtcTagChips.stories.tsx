import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { screen, userEvent, within } from "storybook/test";
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
    onChange: () => {},
  },
};
export default meta;
type Story = StoryObj<typeof TtcTagChips>;

export const Empty: Story = { args: { tagIds: [] } };

export const WithSelectedTags: Story = { args: { tagIds: [1, 2] } };

export const PopoverOpenWithSelections: Story = {
  render: () => {
    function Wrapper() {
      const [tagIds, setTagIds] = useState([1, 2]);
      return <TtcTagChips tagIds={tagIds} tags={tags} onChange={setTagIds} />;
    }
    return <Wrapper />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Edit tags" }));
  },
};

export const PopoverOpenWithPendingNewTag: Story = {
  render: () => {
    function Wrapper() {
      const [tagIds, setTagIds] = useState<number[]>([]);
      return <TtcTagChips tagIds={tagIds} tags={tags} onChange={setTagIds} />;
    }
    return <Wrapper />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "+ tag" }));
    await userEvent.type(
      await screen.findByPlaceholderText("Search or add tag…"),
      "Design review",
    );
    await userEvent.click(
      await screen.findByRole("option", { name: 'Add "Design review"' }),
    );
  },
};
