import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createIntlWrapper } from "@/test/intlWrapper";

const wrapper = createIntlWrapper();

vi.mock("../tabs/TimeEntriesTab", () => ({
  TimeEntriesTab: () => <div>Time entries tab</div>,
}));
vi.mock("../tabs/CustomLineTab", () => ({
  CustomLineTab: () => <div>Custom line tab</div>,
}));

import { AddItemDialog } from "./AddItemDialog";

function renderDialog(open = true, locale: "en" | "fr" = "en") {
  return render(
    <AddItemDialog
      invoiceId={1}
      alreadyAddedEntryIds={new Set()}
      onAdd={vi.fn()}
      adding={false}
      open={open}
      onOpenChange={vi.fn()}
    />,
    { wrapper: locale === "en" ? wrapper : createIntlWrapper("fr") },
  );
}

describe("AddItemDialog", () => {
  it("shows the Add line item title and both tabs when open", () => {
    renderDialog(true);
    expect(screen.getByText("Add line item")).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: "Time Entries" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: "Custom Line" }),
    ).toBeInTheDocument();
  });

  it("shows the Time Entries tab content by default", () => {
    renderDialog(true);
    expect(screen.getByText("Time entries tab")).toBeInTheDocument();
  });

  it("renders nothing when closed", () => {
    renderDialog(false);
    expect(screen.queryByText("Add line item")).not.toBeInTheDocument();
  });

  it("renders French copy when locale is fr", () => {
    renderDialog(true, "fr");
    expect(screen.getByText("Ajouter une ligne")).toBeInTheDocument();
  });
});
