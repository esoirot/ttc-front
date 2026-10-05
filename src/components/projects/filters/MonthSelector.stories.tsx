import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { IntlProvider } from "react-intl";
import { messages } from "@/i18n/messages";
import { MonthSelector } from "./MonthSelector";

const latest = new Date(2026, 9, 1);

const meta: Meta<typeof MonthSelector> = {
  component: MonthSelector,
  title: "Molecules/MonthSelector",
  decorators: [
    (Story) => (
      <IntlProvider locale="en" messages={messages.en}>
        <Story />
      </IntlProvider>
    ),
  ],
  args: { min: new Date(2024, 2, 1), max: latest },
  render: function Render(args) {
    const [month, setMonth] = useState(args.month);
    return <MonthSelector {...args} month={month} onChange={setMonth} />;
  },
};
export default meta;
type Story = StoryObj<typeof MonthSelector>;

export const LatestMonth: Story = { args: { month: latest } };

export const EarlierMonth: Story = { args: { month: new Date(2026, 6, 1) } };
