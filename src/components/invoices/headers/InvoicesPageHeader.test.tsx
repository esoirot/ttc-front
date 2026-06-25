import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { InvoicesPageHeader } from "./InvoicesPageHeader";

function renderHeader(onToggleCreate = vi.fn(), onToggleGenerate = vi.fn()) {
  return render(
    <InvoicesPageHeader
      onToggleCreate={onToggleCreate}
      onToggleGenerate={onToggleGenerate}
    />,
  );
}

describe("InvoicesPageHeader", () => {
  it('renders "Invoices" heading', () => {
    renderHeader();
    expect(
      screen.getByRole("heading", { name: "Invoices" }),
    ).toBeInTheDocument();
  });

  it("calls onToggleCreate when New invoice is clicked", () => {
    const onToggleCreate = vi.fn();
    renderHeader(onToggleCreate);
    fireEvent.click(screen.getByRole("button", { name: "New invoice" }));
    expect(onToggleCreate).toHaveBeenCalled();
  });

  it("calls onToggleGenerate when Generate from project is clicked", () => {
    const onToggleGenerate = vi.fn();
    renderHeader(vi.fn(), onToggleGenerate);
    fireEvent.click(
      screen.getByRole("button", { name: "Generate from project" }),
    );
    expect(onToggleGenerate).toHaveBeenCalled();
  });
});
