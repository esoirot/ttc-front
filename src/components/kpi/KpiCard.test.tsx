import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { KpiCard, KpiGrid } from "./KpiCard";

describe("KpiCard", () => {
  it("shows its label and value", () => {
    render(<KpiCard label="Hours This Month" value="12h 30m" />);
    expect(screen.getByText("Hours This Month")).toBeInTheDocument();
    expect(screen.getByText("12h 30m")).toBeInTheDocument();
  });

  it("shows a unit next to the value", () => {
    render(<KpiCard label="Revenue" value="1200.00" unit="EUR" />);
    expect(screen.getByText("EUR")).toBeInTheDocument();
  });

  it("links to a page when given a destination", () => {
    render(
      <MemoryRouter>
        <KpiCard label="Active Projects" value={4} to="/projects" />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole("link", { name: /Active Projects/ }),
    ).toHaveAttribute("href", "/projects");
  });

  it("is not a link without a destination", () => {
    render(<KpiCard label="Revenue" value="0.00" />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("accepts rich content instead of a single value", () => {
    render(
      <KpiCard label="Pricing">
        <p>Fixed 500 EUR</p>
        <p>25 EUR/hr</p>
      </KpiCard>,
    );
    expect(screen.getByText("Fixed 500 EUR")).toBeInTheDocument();
    expect(screen.getByText("25 EUR/hr")).toBeInTheDocument();
  });
});

describe("KpiGrid", () => {
  it("lays its cards out in equal fixed-width columns", () => {
    render(
      <KpiGrid>
        <KpiCard label="A" value={1} />
        <KpiCard label="B" value={2} />
      </KpiGrid>,
    );
    const grid = screen.getByText("A").closest('[data-slot="kpi-grid"]');
    expect(grid).toHaveClass("grid-cols-[repeat(auto-fill,14rem)]");
    expect(grid?.children).toHaveLength(2);
  });
});
