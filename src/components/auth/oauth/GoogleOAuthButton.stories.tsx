import type { Meta, StoryObj } from "@storybook/react-vite";
import { GoogleOAuthButton } from "./GoogleOAuthButton";

const meta: Meta<typeof GoogleOAuthButton> = {
  component: GoogleOAuthButton,
  title: "Molecules/GoogleOAuthButton",
  args: {},
};
export default meta;
type Story = StoryObj<typeof GoogleOAuthButton>;

export const Default: Story = {};

export const WithRedirectDestination: Story = {
  args: { from: "/projects" },
};
