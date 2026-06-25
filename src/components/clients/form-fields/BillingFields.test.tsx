import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BillingFields } from "./BillingFields";

describe("BillingFields", () => {
  it("renders the delay, tax rate, and checked state of end-of-month", () => {
    render(
      <BillingFields
        paymentDelayDays="30"
        taxRate="20"
        billingEndOfMonth={true}
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByLabelText("Payment delay (days)")).toHaveValue(30);
    expect(screen.getByLabelText("Tax rate (%)")).toHaveValue(20);
    expect(screen.getByLabelText("Bill at end of month")).toBeChecked();
  });

  it("calls onChange with the field name and string value for number inputs", () => {
    const onChange = vi.fn();
    render(
      <BillingFields
        paymentDelayDays=""
        taxRate=""
        billingEndOfMonth={false}
        onChange={onChange}
      />,
    );

    fireEvent.change(screen.getByLabelText("Payment delay (days)"), {
      target: { value: "15" },
    });

    expect(onChange).toHaveBeenCalledWith("paymentDelayDays", "15");
  });

  it("calls onChange with a boolean when the checkbox is toggled", () => {
    const onChange = vi.fn();
    render(
      <BillingFields
        paymentDelayDays=""
        taxRate=""
        billingEndOfMonth={false}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByLabelText("Bill at end of month"));

    expect(onChange).toHaveBeenCalledWith("billingEndOfMonth", true);
  });

  it("calls onChange with 'taxRate' when the Tax rate input changes", () => {
    const onChange = vi.fn();
    render(
      <BillingFields
        paymentDelayDays=""
        taxRate=""
        billingEndOfMonth={false}
        onChange={onChange}
      />,
    );
    fireEvent.change(screen.getByLabelText("Tax rate (%)"), {
      target: { value: "20" },
    });
    expect(onChange).toHaveBeenCalledWith("taxRate", "20");
  });

  it("calls onChange with false when a checked checkbox is unchecked", () => {
    const onChange = vi.fn();
    render(
      <BillingFields
        paymentDelayDays=""
        taxRate=""
        billingEndOfMonth={true}
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getByLabelText("Bill at end of month"));
    expect(onChange).toHaveBeenCalledWith("billingEndOfMonth", false);
  });

  it("uses 'billing' as the default idPrefix when none is provided", () => {
    render(
      <BillingFields
        paymentDelayDays=""
        taxRate=""
        billingEndOfMonth={false}
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByLabelText("Payment delay (days)")).toHaveAttribute(
      "id",
      "billing-delay",
    );
  });
});
