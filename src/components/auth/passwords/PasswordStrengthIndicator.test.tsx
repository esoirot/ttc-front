import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PasswordStrengthIndicator } from "./PasswordStrengthIndicator";

describe("PasswordStrengthIndicator", () => {
  it("renders nothing for an empty password", () => {
    const { container } = render(<PasswordStrengthIndicator password="" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders bars but no label for a password under 8 chars", () => {
    render(<PasswordStrengthIndicator password="short" />);
    expect(screen.queryByText("Weak")).not.toBeInTheDocument();
    expect(screen.queryByText("Medium")).not.toBeInTheDocument();
    expect(screen.queryByText("Strong")).not.toBeInTheDocument();
  });

  it("shows Weak for an 8-11 char password without upper+digit mix", () => {
    render(<PasswordStrengthIndicator password="abcdefgh" />);
    expect(screen.getByText("Weak")).toBeInTheDocument();
  });

  it("shows Medium for a 12+ char password without upper+digit mix", () => {
    render(<PasswordStrengthIndicator password="abcdefghijklm" />);
    expect(screen.getByText("Medium")).toBeInTheDocument();
  });

  it("shows Strong for a 12+ char password with upper and digit", () => {
    render(<PasswordStrengthIndicator password="Abcdefghijkl1" />);
    expect(screen.getByText("Strong")).toBeInTheDocument();
  });
});
