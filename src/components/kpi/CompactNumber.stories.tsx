import type { Meta, StoryObj } from "@storybook/react-vite";
import { IntlProvider } from "react-intl";
import { CompactNumber } from "./CompactNumber";

const meta: Meta<typeof CompactNumber> = {
  component: CompactNumber,
  title: "Atoms/CompactNumber",
  decorators: [
    (Story) => (
      <IntlProvider locale="en">
        <Story />
      </IntlProvider>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof CompactNumber>;

export const BelowOneMillion: Story = {
  args: { value: 950_000 },
};

export const WithDecimals: Story = {
  args: { value: 12_345.6, fractionDigits: 2 },
};

export const Millions: Story = {
  args: { value: 8_240_000, fractionDigits: 2 },
};

export const Billions: Story = {
  args: { value: 10_000_000_000 },
};

export const Trillions: Story = {
  args: { value: 1_000_000_000_000 },
};
