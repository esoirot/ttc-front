import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { SetupView } from "./SetupView";

describe("SetupView", () => {
  const originalLocation = window.location;

  beforeEach(() => {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...originalLocation, href: "" },
    });
  });

  afterEach(() => {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
    });
  });

  it("renders the connect heading and button", () => {
    render(<SetupView />);
    expect(
      screen.getByRole("heading", { name: "Connect HubSpot" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Connect HubSpot" }),
    ).toBeInTheDocument();
  });

  it("navigates to the hubspot auth endpoint on click", () => {
    render(<SetupView />);
    fireEvent.click(screen.getByRole("button", { name: "Connect HubSpot" }));
    expect(window.location.href).toContain("/hubspot/auth");
  });
});
