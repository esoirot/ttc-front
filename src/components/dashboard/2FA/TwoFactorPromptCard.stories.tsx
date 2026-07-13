import type { Meta, StoryObj } from "@storybook/react-vite";
import { MemoryRouter } from "react-router-dom";
import { TwoFactorPromptCard } from "./TwoFactorPromptCard";

const meta: Meta<typeof TwoFactorPromptCard> = {
  component: TwoFactorPromptCard,
  title: "Molecules/TwoFactorPromptCard",
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof TwoFactorPromptCard>;

export const Default: Story = {};
