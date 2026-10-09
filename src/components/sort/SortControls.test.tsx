import { fireEvent, render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { describe, expect, it, vi } from "vitest";
import { messages } from "@/i18n/messages";
import type { Locale } from "@/i18n/useLocale";
import { SortControls } from "./SortControls";

const LABELS = {
  name: { id: "x.name", defaultMessage: "Name" },
  date: { id: "x.date", defaultMessage: "Date" },
};

function renderControls(
  props: Partial<Parameters<typeof SortControls<"name" | "date">>[0]> = {},
  locale: Locale = "en",
) {
  const onFieldChange = vi.fn();
  const onDirectionChange = vi.fn();
  render(
    <IntlProvider locale={locale} messages={messages[locale]}>
      <SortControls
        idPrefix="x"
        fields={["name", "date"]}
        fieldLabels={LABELS}
        field="name"
        direction="asc"
        onFieldChange={onFieldChange}
        onDirectionChange={onDirectionChange}
        {...props}
      />
    </IntlProvider>,
  );
  return { onFieldChange, onDirectionChange };
}

describe("SortControls", () => {
  it("shows the current field and direction", () => {
    renderControls({ field: "date", direction: "desc" });
    expect(screen.getByLabelText("Sort")).toHaveTextContent("Date");
    expect(screen.getByLabelText("Order")).toHaveTextContent("Descending");
  });

  it("reports a new field and a new direction", async () => {
    const { onFieldChange, onDirectionChange } = renderControls();

    fireEvent.click(screen.getByLabelText("Sort"));
    fireEvent.click(await screen.findByRole("option", { name: "Date" }));
    expect(onFieldChange).toHaveBeenCalledWith("date");

    fireEvent.click(screen.getByLabelText("Order"));
    fireEvent.click(await screen.findByRole("option", { name: "Descending" }));
    expect(onDirectionChange).toHaveBeenCalledWith("desc");
  });

  it("speaks French", () => {
    renderControls({}, "fr");
    expect(screen.getByLabelText("Trier")).toBeInTheDocument();
    expect(screen.getByLabelText("Ordre")).toHaveTextContent("Croissant");
  });
});
