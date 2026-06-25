import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DescriptionCombobox } from "./DescriptionCombobox";

function baseProps(
  overrides: Partial<Parameters<typeof DescriptionCombobox>[0]> = {},
) {
  return {
    value: "",
    onChange: vi.fn(),
    recentDescriptions: ["Translation", "Proofreading", "Editing"],
    ...overrides,
  };
}

describe("DescriptionCombobox", () => {
  it("renders with the given placeholder and value", () => {
    render(
      <DescriptionCombobox
        {...baseProps({ value: "Hello", placeholder: "Custom placeholder" })}
      />,
    );

    expect(screen.getByPlaceholderText("Custom placeholder")).toHaveValue(
      "Hello",
    );
  });

  it("calls onChange when typing", () => {
    const onChange = vi.fn();
    render(<DescriptionCombobox {...baseProps({ onChange })} />);

    fireEvent.change(screen.getByPlaceholderText("What are you working on?"), {
      target: { value: "Tra" },
    });

    expect(onChange).toHaveBeenCalledWith("Tra");
  });

  it("shows filtered suggestions matching the current value on focus", () => {
    render(<DescriptionCombobox {...baseProps({ value: "tra" })} />);

    fireEvent.focus(screen.getByPlaceholderText("What are you working on?"));

    expect(screen.getByText("Translation")).toBeInTheDocument();
    expect(screen.queryByText("Proofreading")).not.toBeInTheDocument();
  });

  it("excludes a suggestion that exactly matches the current value", () => {
    render(<DescriptionCombobox {...baseProps({ value: "Translation" })} />);

    fireEvent.focus(screen.getByPlaceholderText("What are you working on?"));

    expect(screen.queryByText("Translation")).not.toBeInTheDocument();
  });

  it("hides the dropdown when there are no matching suggestions", () => {
    render(<DescriptionCombobox {...baseProps({ value: "xyz" })} />);

    fireEvent.focus(screen.getByPlaceholderText("What are you working on?"));

    expect(screen.queryByText("Translation")).not.toBeInTheDocument();
  });

  it("selects a suggestion via mousedown and calls onChange with it", () => {
    const onChange = vi.fn();
    render(<DescriptionCombobox {...baseProps({ value: "", onChange })} />);

    fireEvent.focus(screen.getByPlaceholderText("What are you working on?"));
    fireEvent.mouseDown(screen.getByText("Translation"));

    expect(onChange).toHaveBeenCalledWith("Translation");
  });

  it("calls onEnter when Enter is pressed and the dropdown is closed", () => {
    const onEnter = vi.fn();
    render(<DescriptionCombobox {...baseProps({ value: "xyz", onEnter })} />);

    const input = screen.getByPlaceholderText("What are you working on?");
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onEnter).toHaveBeenCalled();
  });

  it("ArrowDown highlights the first item, then Enter selects it", () => {
    const onChange = vi.fn();
    render(<DescriptionCombobox {...baseProps({ value: "", onChange })} />);

    const input = screen.getByPlaceholderText("What are you working on?");
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onChange).toHaveBeenCalledWith("Translation");
  });

  it("Escape closes the dropdown", () => {
    render(<DescriptionCombobox {...baseProps({ value: "" })} />);

    const input = screen.getByPlaceholderText("What are you working on?");
    fireEvent.focus(input);
    expect(screen.getByText("Translation")).toBeInTheDocument();

    fireEvent.keyDown(input, { key: "Escape" });
    expect(screen.queryByText("Translation")).not.toBeInTheDocument();
  });
});
