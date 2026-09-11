import type { Meta, StoryObj } from "@storybook/react-vite";
import { MemoryRouter } from "react-router-dom";
import { IntlProvider } from "react-intl";
import { messages } from "@/i18n/messages";
import { TwoFactorPromptCard } from "./TwoFactorPromptCard";

const meta: Meta<typeof TwoFactorPromptCard> = {
  component: TwoFactorPromptCard,
  title: "Molecules/TwoFactorPromptCard",
  decorators: [
    (Story) => (
      <IntlProvider locale="en" messages={messages.en}>
        <MemoryRouter>
          <Story />
        </MemoryRouter>
      </IntlProvider>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof TwoFactorPromptCard>;

export const Default: Story = {};
