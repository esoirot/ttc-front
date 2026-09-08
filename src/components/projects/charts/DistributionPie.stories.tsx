import type { Meta, StoryObj } from "@storybook/react-vite";
import { DistributionPie } from "./DistributionPie";

const meta: Meta<typeof DistributionPie> = {
  component: DistributionPie,
  title: "Molecules/DistributionPie",
  args: {
    title: "Time per project",
    subtitle: "June 2026",
    data: [
      { name: "Website copy", value: 7200 },
      { name: "App localization", value: 3600 },
      { name: "Legal docs", value: 1800 },
    ],
    formatValue: (v: number) => `${Math.round(v / 60)}m`,
  },
};
export default meta;
type Story = StoryObj<typeof DistributionPie>;

export const Default: Story = {};

export const WordCounts: Story = {
  args: {
    title: "Words per project",
    subtitle: "All time",
    data: [
      { name: "Website copy", value: 4800 },
      { name: "App localization", value: 12000 },
    ],
    formatValue: (v: number) => v.toLocaleString(),
  },
};

export const NoSubtitle: Story = {
  args: { subtitle: undefined },
};
