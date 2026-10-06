import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { IntlProvider } from "react-intl";
import { messages } from "@/i18n/messages";
import type { SearchSelectProps } from "@/types/shared-ui.types";
import { SearchSelect } from "./SearchSelect";

const clients = [
  { value: "1", label: "Acme" },
  { value: "2", label: "Beta Translations" },
  { value: "3", label: "Zeta Corp" },
];

function Interactive(props: Partial<SearchSelectProps>) {
  const [open, setOpen] = useState(props.open ?? false);
  const [search, setSearch] = useState("");
  const [value, setValue] = useState(props.value ?? "");
  const options = clients.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <div className="w-64">
      <SearchSelect
        placeholder="No client"
        noneLabel="No client"
        options={options}
        {...props}
        value={value}
        onChange={setValue}
        open={open}
        onOpenChange={setOpen}
        search={search}
        onSearchChange={setSearch}
      />
    </div>
  );
}

const meta: Meta<typeof SearchSelect> = {
  component: SearchSelect,
  title: "Molecules/SearchSelect",
  decorators: [
    (Story) => (
      <IntlProvider locale="en" messages={messages.en}>
        <Story />
      </IntlProvider>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof SearchSelect>;

export const Empty: Story = { render: () => <Interactive /> };

export const Selected: Story = { render: () => <Interactive value="2" /> };

export const SelectionNotLoaded: Story = {
  render: () => <Interactive value="1450" selectedLabel="Omega Ltd" />,
};

export const Open: Story = { render: () => <Interactive open /> };

export const Loading: Story = {
  render: () => <Interactive open options={[]} loading />,
};

export const NoResults: Story = {
  render: () => <Interactive open options={[]} />,
};
