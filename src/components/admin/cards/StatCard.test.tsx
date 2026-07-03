import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatCard } from "./StatCard";

describe("StatCard", () => {
  it("shows the label and value", () => {
    render(<StatCard label="Users" value={42} loading={false} />);
    expect(screen.getByText("Users")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("shows a skeleton instead of the value while loading", () => {
    const { container } = render(
      <StatCard label="Users" value={42} loading={true} />,
    );
    expect(screen.queryByText("42")).not.toBeInTheDocument();
    expect(
      container.querySelector('[data-slot="skeleton"]'),
    ).toBeInTheDocument();
  });

  it("renders a string value", () => {
    render(<StatCard label="Revenue" value="€1,000" loading={false} />);
    expect(screen.getByText("€1,000")).toBeInTheDocument();
  });
});
