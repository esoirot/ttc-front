import type { Meta, StoryObj } from "@storybook/react-vite";
import { DescriptionCombobox } from "./DescriptionCombobox";

const recentDescriptions = ["Translation", "Proofreading", "Editing"];

const meta: Meta<typeof DescriptionCombobox> = {
  component: DescriptionCombobox,
  title: "Molecules/DescriptionCombobox",
  args: {
    value: "",
    onChange: () => {},
    onEnter: () => {},
    recentDescriptions,
  },
};
export default meta;
type Story = StoryObj<typeof DescriptionCombobox>;

export const Default: Story = {};

export const WithValue: Story = {
  args: { value: "Translation" },
};

export const CustomPlaceholder: Story = {
  args: { placeholder: "What did you work on?" },
};

export const NoRecentDescriptions: Story = {
  args: { recentDescriptions: [] },
};
