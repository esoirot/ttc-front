import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  PieChart: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  Pie: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Cell: () => null,
  Tooltip: ({
    formatter,
  }: {
    formatter: (value: number) => [string, string];
  }) => <div data-testid="tooltip-preview">{formatter(1234)[0]}</div>,
  Legend: ({
    formatter,
  }: {
    formatter: (
      value: string,
      entry: { payload: { name: string; value: number } },
    ) => string;
  }) => (
    <div data-testid="legend-preview">
      {formatter("Short title", {
        payload: { name: "Short title", value: 5000 },
      })}
    </div>
  ),
}));

import { DistributionPie } from "./DistributionPie";

describe("DistributionPie", () => {
  it("shows the title and optional subtitle", () => {
    render(
      <DistributionPie
        title="Time per task"
        subtitle="June 2026"
        data={[{ name: "A", value: 100 }]}
        formatValue={(v) => `${v}s`}
      />,
    );
    expect(screen.getByText("Time per task")).toBeInTheDocument();
    expect(screen.getByText("June 2026")).toBeInTheDocument();
  });

  it("omits the subtitle line when none is given", () => {
    render(
      <DistributionPie
        title="Words per project"
        data={[{ name: "A", value: 100 }]}
        formatValue={(v) => `${v}`}
      />,
    );
    expect(screen.queryByText("June 2026")).not.toBeInTheDocument();
  });

  it("formats the tooltip and legend values with the given formatValue", () => {
    render(
      <DistributionPie
        title="Words per project"
        data={[{ name: "A", value: 100 }]}
        formatValue={(v) => `${v.toLocaleString()} words`}
      />,
    );
    expect(screen.getByTestId("tooltip-preview")).toHaveTextContent(
      "1,234 words",
    );
    expect(screen.getByTestId("legend-preview")).toHaveTextContent(
      "Short title — 5,000 words",
    );
  });

  it("shows the emptyMessage instead of the chart when data is empty", () => {
    render(
      <DistributionPie
        title="Time per project"
        subtitle="September 2026"
        data={[]}
        formatValue={(v) => `${v}`}
        emptyMessage="No time logged yet this month."
      />,
    );
    expect(screen.getByText("Time per project")).toBeInTheDocument();
    expect(
      screen.getByText("No time logged yet this month."),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("tooltip-preview")).not.toBeInTheDocument();
  });

  it("still renders the chart when data is empty but no emptyMessage is given", () => {
    render(
      <DistributionPie
        title="Time per task"
        data={[]}
        formatValue={(v) => `${v}`}
      />,
    );
    expect(screen.getByTestId("tooltip-preview")).toBeInTheDocument();
  });
});
