import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ClientForm } from "./ClientForm";

const EMPTY_FORM = {
  name: "",
  email: "",
  phone: "",
  legalName: "",
  vatNumber: "",
  address: "",
  city: "",
  country: "",
  postalCode: "",
};

describe("ClientForm", () => {
  it("renders every field label", () => {
    render(<ClientForm form={EMPTY_FORM} onChange={vi.fn()} />);

    for (const label of [
      "Name *",
      "Email",
      "Phone",
      "Legal name",
      "VAT number",
      "Address",
      "City",
      "Country",
      "Postal code",
    ]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it("renders current values from the form prop", () => {
    render(
      <ClientForm
        form={{ ...EMPTY_FORM, name: "Acme", city: "Paris" }}
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByDisplayValue("Acme")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Paris")).toBeInTheDocument();
  });

  it("calls onChange with the merged form when a field is typed in", () => {
    const onChange = vi.fn();
    render(<ClientForm form={EMPTY_FORM} onChange={onChange} />);

    fireEvent.change(screen.getByPlaceholderText("Acme Corp"), {
      target: { value: "Acme" },
    });

    expect(onChange).toHaveBeenCalledWith({ ...EMPTY_FORM, name: "Acme" });
  });
});
