import type { Meta, StoryObj } from "@storybook/react-vite";
import { IntlProvider } from "react-intl";
import { MemoryRouter } from "react-router-dom";
import { messages } from "@/i18n/messages";
import { RouteErrorPage } from "./RouteErrorPage";

const meta: Meta<typeof RouteErrorPage> = {
  component: RouteErrorPage,
  title: "Molecules/RouteErrorPage",
  decorators: [
    (Story) => (
      <IntlProvider locale="en" defaultLocale="en" messages={messages.en}>
        <MemoryRouter>
          <Story />
        </MemoryRouter>
      </IntlProvider>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof RouteErrorPage>;

export const Default: Story = {};
