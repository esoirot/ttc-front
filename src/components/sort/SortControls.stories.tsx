import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { IntlProvider } from "react-intl";
import { messages } from "@/i18n/messages";
import { CLIENT_SORT_FIELD_LABELS } from "@/constants/clients";
import type { ClientSortField } from "@/types/clients.types";
import { SortControls, type SortDirection } from "./SortControls";

function Controlled({ fields }: { fields: readonly ClientSortField[] }) {
  const [field, setField] = useState(fields[0]);
  const [direction, setDirection] = useState<SortDirection>("asc");
  return (
    <div className="flex gap-3">
      <SortControls
        idPrefix="story"
        fields={fields}
        fieldLabels={CLIENT_SORT_FIELD_LABELS}
        field={field}
        direction={direction}
        onFieldChange={setField}
        onDirectionChange={setDirection}
      />
    </div>
  );
}

const meta: Meta<typeof Controlled> = {
  component: Controlled,
  title: "Molecules/SortControls",
  decorators: [
    (Story) => (
      <IntlProvider locale="en" messages={messages.en}>
        <Story />
      </IntlProvider>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof Controlled>;

export const OneField: Story = { args: { fields: ["NAME"] } };

export const TwoFields: Story = {
  args: { fields: ["LAST_NAME", "FIRST_NAME"] },
};
