import type { Meta, StoryObj } from "@storybook/react-vite";
import { IntlProvider } from "react-intl";
import { messages } from "@/i18n/messages";
import { InvoicesPageHeader } from "./InvoicesPageHeader";

const meta: Meta<typeof InvoicesPageHeader> = {
  component: InvoicesPageHeader,
  title: "Molecules/InvoicesPageHeader",
  decorators: [
    (Story) => (
      <IntlProvider locale="en" messages={messages.en}>
        <Story />
      </IntlProvider>
    ),
  ],
  args: {
    onToggleCreate: () => {},
    onToggleGenerate: () => {},
  },
};
export default meta;
type Story = StoryObj<typeof InvoicesPageHeader>;

export const Default: Story = {};
