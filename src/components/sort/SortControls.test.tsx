import { fireEvent, render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { describe, expect, it, vi } from "vitest";
import { messages } from "@/i18n/messages";
import type { Locale } from "@/i18n/useLocale";
import { CLIENT_SORT_FIELD_LABELS } from "@/constants/clients";
import { SortControls } from "./SortControls";

function renderControls(
  props: Partial<
    Parameters<typeof SortControls<"LAST_NAME" | "FIRST_NAME">>[0]
  > = {},
  locale: Locale = "en",
) {
  const onFieldChange = vi.fn();
  const onDirectionChange = vi.fn();
  render(
    <IntlProvider locale={locale} messages={messages[locale]}>
      <SortControls
        idPrefix="x"
        fields={["LAST_NAME", "FIRST_NAME"]}
        fieldLabels={CLIENT_SORT_FIELD_LABELS}
        field="LAST_NAME"
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
    renderControls({ field: "FIRST_NAME", direction: "desc" });
    expect(screen.getByLabelText("Sort")).toHaveTextContent("First name");
    expect(screen.getByLabelText("Order")).toHaveTextContent("Descending");
  });

  it("reports a new field and a new direction", async () => {
    const { onFieldChange, onDirectionChange } = renderControls();

    fireEvent.click(screen.getByLabelText("Sort"));
    fireEvent.click(await screen.findByRole("option", { name: "First name" }));
    expect(onFieldChange).toHaveBeenCalledWith("FIRST_NAME");

    fireEvent.click(screen.getByLabelText("Order"));
    fireEvent.click(await screen.findByRole("option", { name: "Descending" }));
    expect(onDirectionChange).toHaveBeenCalledWith("desc");
  });

  it("speaks French", () => {
    renderControls({}, "fr");
    expect(screen.getByLabelText("Trier")).toHaveTextContent("Nom");
    expect(screen.getByLabelText("Ordre")).toHaveTextContent("Croissant");
  });
});
