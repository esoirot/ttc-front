import type { Meta, StoryObj } from "@storybook/react-vite";
import { IntlProvider } from "react-intl";
import { messages } from "@/i18n/messages";
import { LanguagePairsInput } from "./LanguagePairsInput";

const meta: Meta<typeof LanguagePairsInput> = {
  component: LanguagePairsInput,
  title: "Molecules/LanguagePairsInput",
  decorators: [
    (Story) => (
      <IntlProvider locale="en" messages={messages.en}>
        <Story />
      </IntlProvider>
    ),
  ],
  args: {
    pairs: [{ fromLanguage: "EN", toLanguage: "FR" }],
    onAdd: () => {},
    onUpdate: () => {},
    onRemove: () => {},
  },
};
export default meta;
type Story = StoryObj<typeof LanguagePairsInput>;

export const Default: Story = {};

export const Empty: Story = { args: { pairs: [] } };

export const MultiplePairs: Story = {
  args: {
    pairs: [
      { fromLanguage: "EN", toLanguage: "FR" },
      { fromLanguage: "DE", toLanguage: "ES" },
    ],
  },
};

export const SameLanguageWarning: Story = {
  args: { pairs: [{ fromLanguage: "EN", toLanguage: "EN" }] },
};
