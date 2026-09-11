import type { Meta, StoryObj } from "@storybook/react-vite";
import { IntlProvider } from "react-intl";
import { messages } from "@/i18n/messages";
import { TimePageHeader } from "./TimePageHeader";

const meta: Meta<typeof TimePageHeader> = {
  component: TimePageHeader,
  title: "Molecules/TimePageHeader",
  decorators: [
    (Story) => (
      <IntlProvider locale="en" messages={messages.en}>
        <Story />
      </IntlProvider>
    ),
  ],
  args: {
    workspaceId: "ws-1",
    showManual: false,
    showImport: false,
    onToggleManual: () => {},
    onToggleImport: () => {},
  },
};
export default meta;
type Story = StoryObj<typeof TimePageHeader>;

export const Default: Story = {};

export const NoClockifyWorkspace: Story = {
  args: { workspaceId: null },
};

export const ManualFormOpen: Story = {
  args: { showManual: true },
};

export const ImportFormOpen: Story = {
  args: { showImport: true },
};
