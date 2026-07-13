import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AddressFields } from "./AddressFields";

const baseProps = {
  address: "",
  addressLine2: "",
  city: "",
  country: "",
  state: "",
  postalCode: "",
};

describe("AddressFields", () => {
  it("renders all six fields with their current values", () => {
    render(
      <AddressFields
        address="123 Main St"
        addressLine2="Suite 200"
        city="Paris"
        country="France"
        state="Ile-de-France"
        postalCode="75001"
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByLabelText("Address")).toHaveValue("123 Main St");
    expect(screen.getByLabelText("Address line 2")).toHaveValue("Suite 200");
    expect(screen.getByLabelText("City")).toHaveValue("Paris");
    expect(screen.getByLabelText("Postal code")).toHaveValue("75001");
    expect(screen.getByLabelText("State / Province")).toHaveValue(
      "Ile-de-France",
    );
    expect(screen.getByLabelText("Country")).toHaveValue("France");
  });

  it("calls onChange with the field name and new value", () => {
    const onChange = vi.fn();
    render(<AddressFields {...baseProps} onChange={onChange} />);

    fireEvent.change(screen.getByLabelText("City"), {
      target: { value: "Lyon" },
    });

    expect(onChange).toHaveBeenCalledWith("city", "Lyon");
  });

  it("namespaces input ids with the given idPrefix", () => {
    render(
      <AddressFields {...baseProps} onChange={vi.fn()} idPrefix="custom" />,
    );

    expect(screen.getByLabelText("Address")).toHaveAttribute(
      "id",
      "custom-address",
    );
  });

  it("uses 'addr' as the default idPrefix when none is provided", () => {
    render(<AddressFields {...baseProps} onChange={vi.fn()} />);
    expect(screen.getByLabelText("Address")).toHaveAttribute(
      "id",
      "addr-address",
    );
  });

  it("calls onChange with 'address' when the Address input changes", () => {
    const onChange = vi.fn();
    render(<AddressFields {...baseProps} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText("Address"), {
      target: { value: "10 Rue de Rivoli" },
    });
    expect(onChange).toHaveBeenCalledWith("address", "10 Rue de Rivoli");
  });

  it("calls onChange with 'addressLine2' when the Address line 2 input changes", () => {
    const onChange = vi.fn();
    render(<AddressFields {...baseProps} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText("Address line 2"), {
      target: { value: "Suite 300" },
    });
    expect(onChange).toHaveBeenCalledWith("addressLine2", "Suite 300");
  });

  it("calls onChange with 'postalCode' when the Postal code input changes", () => {
    const onChange = vi.fn();
    render(<AddressFields {...baseProps} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText("Postal code"), {
      target: { value: "69001" },
    });
    expect(onChange).toHaveBeenCalledWith("postalCode", "69001");
  });

  it("calls onChange with 'state' when the State / Province input changes", () => {
    const onChange = vi.fn();
    render(<AddressFields {...baseProps} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText("State / Province"), {
      target: { value: "Ontario" },
    });
    expect(onChange).toHaveBeenCalledWith("state", "Ontario");
  });

  it("calls onChange with 'country' when the Country input changes", () => {
    const onChange = vi.fn();
    render(<AddressFields {...baseProps} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText("Country"), {
      target: { value: "Germany" },
    });
    expect(onChange).toHaveBeenCalledWith("country", "Germany");
  });
});
