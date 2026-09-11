import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { IntlProvider } from "react-intl";
import { messages } from "@/i18n/messages";
import type { Charge } from "@/types/activities.types";
import { ChargeRow } from "./ChargeRow";

function makeCharge(overrides: Partial<Charge> = {}): Charge {
  return {
    id: 1,
    activityId: 10,
    name: "Travel",
    amount: 2000,
    type: "FIXED",
    ...overrides,
  };
}

const meta: Meta<typeof ChargeRow> = {
  component: ChargeRow,
  title: "Organisms/ChargeRow",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <IntlProvider locale="en" messages={messages.en}>
          <div className="max-w-md border border-border rounded-md px-3">
            <Story />
          </div>
        </IntlProvider>
      </QueryClientProvider>
    ),
  ],
  args: {
    activityId: 10,
  },
};
export default meta;
type Story = StoryObj<typeof ChargeRow>;

export const Fixed: Story = { args: { charge: makeCharge() } };

export const Variable: Story = {
  args: {
    charge: makeCharge({
      id: 2,
      name: "Software subscription",
      amount: 4999,
      type: "VARIABLE",
    }),
  },
};
