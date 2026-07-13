import type { Meta, StoryObj } from "@storybook/react-vite";
import { SetupView } from "./SetupView";

const meta: Meta<typeof SetupView> = {
  component: SetupView,
  title: "Molecules/HubspotSetupView",
};
export default meta;
type Story = StoryObj<typeof SetupView>;

export const Default: Story = {};
