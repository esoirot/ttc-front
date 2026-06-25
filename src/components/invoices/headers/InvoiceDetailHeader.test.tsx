import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { InvoiceDetailHeader } from "./InvoiceDetailHeader";
import type { InvoiceStatus } from "@/types/invoices.types";

function renderHeader(
  props: Partial<Parameters<typeof InvoiceDetailHeader>[0]> = {},
) {
  return render(
    <InvoiceDetailHeader
      number="INV-001"
      status="DRAFT"
      dueDate={null}
      logoUrl={null}
      downloading={false}
      onStatusChange={vi.fn()}
      onDownloadPdf={vi.fn()}
      onDelete={vi.fn()}
      {...props}
    />,
  );
}

describe("InvoiceDetailHeader", () => {
  it("renders the invoice number as a heading", () => {
    renderHeader();
    expect(
      screen.getByRole("heading", { name: "INV-001" }),
    ).toBeInTheDocument();
  });

  it("shows the status badge", () => {
    renderHeader({ status: "SENT" });
    expect(screen.getByText("SENT")).toBeInTheDocument();
  });

  it("shows due date when provided", () => {
    renderHeader({ dueDate: "2026-12-31T00:00:00.000Z" });
    expect(screen.getByText("Due 2026-12-31")).toBeInTheDocument();
  });

  it("hides due date when null", () => {
    renderHeader({ dueDate: null });
    expect(screen.queryByText(/Due/)).not.toBeInTheDocument();
  });

  it("renders company logo when logoUrl is set", () => {
    renderHeader({ logoUrl: "https://example.com/logo.png" });
    expect(screen.getByAltText("Company logo")).toBeInTheDocument();
  });

  it("does not render logo when logoUrl is null", () => {
    renderHeader({ logoUrl: null });
    expect(screen.queryByAltText("Company logo")).not.toBeInTheDocument();
  });

  it("calls onDownloadPdf when Download PDF is clicked", () => {
    const onDownloadPdf = vi.fn();
    renderHeader({ onDownloadPdf });
    fireEvent.click(screen.getByRole("button", { name: "Download PDF" }));
    expect(onDownloadPdf).toHaveBeenCalled();
  });

  it("shows Generating… and disables button when downloading=true", () => {
    renderHeader({ downloading: true });
    expect(screen.getByRole("button", { name: "Generating…" })).toBeDisabled();
  });

  it.each<[InvoiceStatus, string[]]>([
    ["DRAFT", ["Mark SENT", "Mark CANCELLED"]],
    ["SENT", ["Mark PAID", "Mark OVERDUE"]],
    ["OVERDUE", ["Mark PAID"]],
  ])("shows correct transition buttons for %s status", (status, buttons) => {
    renderHeader({ status });
    for (const label of buttons) {
      expect(screen.getByRole("button", { name: label })).toBeInTheDocument();
    }
  });

  it("shows no transition buttons for PAID status", () => {
    renderHeader({ status: "PAID" });
    expect(
      screen.queryByRole("button", { name: /^Mark / }),
    ).not.toBeInTheDocument();
  });

  it("calls onStatusChange with the next status when Mark button clicked", () => {
    const onStatusChange = vi.fn();
    renderHeader({ status: "DRAFT", onStatusChange });
    fireEvent.click(screen.getByRole("button", { name: "Mark SENT" }));
    expect(onStatusChange).toHaveBeenCalledWith("SENT");
  });

  it("shows Delete button only for DRAFT status", () => {
    renderHeader({ status: "DRAFT" });
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
  });

  it("does not show Delete button for non-DRAFT status", () => {
    renderHeader({ status: "SENT" });
    expect(
      screen.queryByRole("button", { name: "Delete" }),
    ).not.toBeInTheDocument();
  });

  it("calls onDelete after confirming in the alert dialog", () => {
    const onDelete = vi.fn();
    renderHeader({ status: "DRAFT", onDelete });

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    const dialog = screen.getByRole("alertdialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Delete" }));

    expect(onDelete).toHaveBeenCalled();
  });

  it("does not call onDelete when Cancel is clicked in the dialog", () => {
    const onDelete = vi.fn();
    renderHeader({ status: "DRAFT", onDelete });

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onDelete).not.toHaveBeenCalled();
  });
});
