import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createIntlWrapper } from "@/test/intlWrapper";
import type { Locale } from "@/i18n/useLocale";
import { InvoicesPageHeader } from "./InvoicesPageHeader";

function renderHeader(
  onToggleCreate = vi.fn(),
  onToggleGenerate = vi.fn(),
  locale: Locale = "en",
) {
  return render(
    <InvoicesPageHeader
      onToggleCreate={onToggleCreate}
      onToggleGenerate={onToggleGenerate}
    />,
    { wrapper: createIntlWrapper(locale) },
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

  it("renders French copy when locale is fr", () => {
    renderHeader(vi.fn(), vi.fn(), "fr");
    expect(
      screen.getByRole("heading", { name: "Factures" }),
    ).toBeInTheDocument();
  });
});
