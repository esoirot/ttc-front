import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createIntlWrapper } from "@/test/intlWrapper";
import { SetupView } from "./SetupView";

const wrapper = createIntlWrapper();

describe("SetupView", () => {
  it("shows the title and connect button", () => {
    render(<SetupView />, { wrapper });
    expect(
      screen.getByRole("heading", { name: "Connect Google Calendar" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Connect Google Calendar" }),
    ).toBeInTheDocument();
  });

  it("renders French copy when locale is fr", () => {
    render(<SetupView />, { wrapper: createIntlWrapper("fr") });
    expect(
      screen.getByRole("heading", { name: "Connecter Google Agenda" }),
    ).toBeInTheDocument();
  });
});
