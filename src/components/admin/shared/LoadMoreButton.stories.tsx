import type { Meta, StoryObj } from "@storybook/react-vite";
import { LoadMoreButton } from "./AdminTableChrome";

const meta: Meta<typeof LoadMoreButton> = {
  component: LoadMoreButton,
  title: "Molecules/LoadMoreButton",
  args: {
    onClick: () => {},
  },
};
export default meta;
type Story = StoryObj<typeof LoadMoreButton>;

export const Default: Story = {};
