import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { IntlProvider } from "react-intl";
import { messages } from "@/i18n/messages";
import { ProjectPicker } from "./ProjectPicker";

const meta: Meta<typeof ProjectPicker> = {
  component: ProjectPicker,
  title: "Molecules/ProjectPicker",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <IntlProvider locale="en" messages={messages.en}>
          <div className="w-64">
            <Story />
          </div>
        </IntlProvider>
      </QueryClientProvider>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof ProjectPicker>;

function Picker() {
  const [value, setValue] = useState("");
  return (
    <ProjectPicker
      value={value}
      onChange={setValue}
      placeholder="No project"
      noneLabel="No project"
    />
  );
}

export const Default: Story = { render: () => <Picker /> };
