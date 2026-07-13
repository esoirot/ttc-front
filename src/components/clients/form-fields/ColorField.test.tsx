import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ColorField } from "./ColorField";

describe("ColorField", () => {
  it("renders the text input bound to the current value", () => {
    render(<ColorField id="col" value="#D2D5DA" onChange={vi.fn()} />);
    expect(screen.getByLabelText("Color")).toHaveValue("#D2D5DA");
  });

  it("calls onChange when the text input changes", () => {
    const onChange = vi.fn();
    render(<ColorField id="col" value="" onChange={onChange} />);

    fireEvent.change(screen.getByLabelText("Color"), {
      target: { value: "#FCA5A5" },
    });

    expect(onChange).toHaveBeenCalledWith("#FCA5A5");
  });

  it("opens a preset color picker when the swatch is clicked", () => {
    render(<ColorField id="col" value="" onChange={vi.fn()} />);

    expect(screen.queryByLabelText("#EF4444")).not.toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Pick color"));
    expect(screen.getByLabelText("#EF4444")).toBeInTheDocument();
  });

  it("calls onChange with the preset's hex value when a swatch is picked", () => {
    const onChange = vi.fn();
    render(<ColorField id="col" value="" onChange={onChange} />);

    fireEvent.click(screen.getByLabelText("Pick color"));
    fireEvent.click(screen.getByLabelText("#3B82F6"));

    expect(onChange).toHaveBeenCalledWith("#3B82F6");
  });

  it("uses a custom label when provided", () => {
    render(
      <ColorField id="col" value="" onChange={vi.fn()} label="Tag color" />,
    );
    expect(screen.getByLabelText("Tag color")).toBeInTheDocument();
  });
});
