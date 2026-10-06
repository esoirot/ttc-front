import type { Meta, StoryObj } from "@storybook/react-vite";
import { MemoryRouter } from "react-router-dom";
import { KpiCard, KpiGrid } from "./KpiCard";

const meta: Meta<typeof KpiCard> = {
  component: KpiCard,
  title: "Molecules/KpiCard",
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof KpiCard>;

export const Grid: Story = {
  render: () => (
    <KpiGrid>
      <KpiCard label="Active Projects" value={4} to="/projects" />
      <KpiCard label="Hours This Month" value="12h 30m" mono />
      <KpiCard label="Revenue This Month" value="1240.00" unit="EUR" />
      <KpiCard label="Pricing">
        <p className="text-lg">Fixed 500 EUR</p>
        <p className="text-lg">25 EUR/hr</p>
      </KpiCard>
    </KpiGrid>
  ),
};
