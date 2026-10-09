import type { Meta, StoryObj } from "@storybook/react-vite";
import { IntlProvider } from "react-intl";
import { messages } from "@/i18n/messages";
import { UrgencyIcon } from "./UrgencyIcon";

const inDays = (n: number) =>
  new Date(Date.now() + n * 24 * 60 * 60 * 1000).toISOString();

const meta: Meta<typeof UrgencyIcon> = {
  component: UrgencyIcon,
  title: "Molecules/UrgencyIcon",
  decorators: [
    (Story) => (
      <IntlProvider locale="en" messages={messages.en}>
        <Story />
      </IntlProvider>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof UrgencyIcon>;

export const DueNow: Story = { args: { due: null } };
export const Late: Story = { args: { due: inDays(-2) } };
export const ThisWeek: Story = { args: { due: inDays(3) } };
export const Later: Story = { args: { due: inDays(20) } };
