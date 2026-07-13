import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ColorField } from "./ColorField";

const meta: Meta<typeof ColorField> = {
  component: ColorField,
  title: "Molecules/ColorField",
  render: (args) => {
    function Controlled() {
      const [value, setValue] = useState(args.value);
      return <ColorField {...args} value={value} onChange={setValue} />;
    }
    return (
      <div className="w-[280px]">
        <Controlled />
      </div>
    );
  },
};
export default meta;
type Story = StoryObj<typeof ColorField>;

export const Default: Story = {
  args: { id: "color-default", value: "#D2D5DA" },
};

export const Empty: Story = { args: { id: "color-empty", value: "" } };

export const CustomLabel: Story = {
  args: { id: "color-custom", value: "#3B82F6", label: "Tag color" },
};
