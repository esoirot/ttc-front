import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createIntlWrapper } from "@/test/intlWrapper";
import { CompactNumber } from "./CompactNumber";

function renderNumber(
  value: number,
  { fractionDigits, locale = "en" as "en" | "fr" } = {} as {
    fractionDigits?: number;
    locale?: "en" | "fr";
  },
) {
  const { container } = render(
    <CompactNumber value={value} fractionDigits={fractionDigits} />,
    { wrapper: createIntlWrapper(locale) },
  );
  return container.firstElementChild as HTMLElement;
}

describe("CompactNumber", () => {
  it("shows values below one million in full", () => {
    const el = renderNumber(950_000);
    expect(el).toHaveTextContent("950,000");
    expect(el).not.toHaveAttribute("title");
  });

  it("keeps the requested decimals below one million", () => {
    expect(renderNumber(12_345.6, { fractionDigits: 2 })).toHaveTextContent(
      "12,345.60",
    );
  });

  it("shortens one million to 1M", () => {
    expect(renderNumber(1_000_000)).toHaveTextContent(/^1M$/);
  });

  it("shortens millions, billions and trillions", () => {
    expect(renderNumber(8_240_000)).toHaveTextContent(/^8\.2M$/);
  });

  it("shortens billions", () => {
    expect(renderNumber(10_000_000_000)).toHaveTextContent(/^10B$/);
  });

  it("shortens trillions", () => {
    expect(renderNumber(1_000_000_000_000)).toHaveTextContent(/^1T$/);
  });

  it("shows the full value on hover when shortened", () => {
    expect(renderNumber(8_240_000, { fractionDigits: 2 })).toHaveAttribute(
      "title",
      "8,240,000.00",
    );
  });

  it("shortens large negative values too", () => {
    expect(renderNumber(-2_500_000)).toHaveTextContent(/^-2\.5M$/);
  });

  it("uses the French short forms", () => {
    expect(renderNumber(10_000_000_000, { locale: "fr" })).toHaveTextContent(
      /^10\sMd$/,
    );
  });
});
