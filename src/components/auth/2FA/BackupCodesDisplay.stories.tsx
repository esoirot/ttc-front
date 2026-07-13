import type { Meta, StoryObj } from "@storybook/react-vite";
import { BackupCodesDisplay } from "./BackupCodesDisplay";

const meta: Meta<typeof BackupCodesDisplay> = {
  component: BackupCodesDisplay,
  title: "Molecules/BackupCodesDisplay",
  args: {
    codes: [
      "4F7A-9K2L",
      "8B3C-1M6N",
      "2D5E-7P4Q",
      "6R9S-3T8U",
      "1V4W-5X2Y",
      "9Z6A-8B1C",
      "3D7E-4F9G",
      "5H2J-6K3L",
    ],
    onDone: () => {},
  },
};
export default meta;
type Story = StoryObj<typeof BackupCodesDisplay>;

export const Default: Story = {};
