import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("../tabs/ContactsTab", () => ({
  ContactsTab: () => <div>Contacts tab content</div>,
}));
vi.mock("../tabs/CompaniesTab", () => ({
  CompaniesTab: () => <div>Companies tab content</div>,
}));
vi.mock("../tabs/DealsTab", () => ({
  DealsTab: () => <div>Deals tab content</div>,
}));

import { createIntlWrapper } from "@/test/intlWrapper";
import { ConnectedView } from "./ConnectedView";

const wrapper = createIntlWrapper();

describe("ConnectedView", () => {
  it("shows the Contacts tab by default", () => {
    render(<ConnectedView />, { wrapper });
    expect(screen.getByText("Contacts tab content")).toBeInTheDocument();
  });

  it("switches to the Companies tab on click", () => {
    render(<ConnectedView />, { wrapper });
    const trigger = screen.getByRole("tab", { name: "Companies" });
    fireEvent.mouseDown(trigger);
    trigger.focus();
    fireEvent.click(trigger);
    expect(screen.getByText("Companies tab content")).toBeInTheDocument();
  });

  it("switches to the Deals tab on click", () => {
    render(<ConnectedView />, { wrapper });
    const trigger = screen.getByRole("tab", { name: "Deals" });
    fireEvent.mouseDown(trigger);
    trigger.focus();
    fireEvent.click(trigger);
    expect(screen.getByText("Deals tab content")).toBeInTheDocument();
  });

  it("renders French copy when locale is fr", () => {
    render(<ConnectedView />, { wrapper: createIntlWrapper("fr") });
    expect(
      screen.getByRole("tab", { name: "Entreprises" }),
    ).toBeInTheDocument();
  });
});
