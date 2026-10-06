import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createIntlWrapper } from "@/test/intlWrapper";
import type { Locale } from "@/i18n/useLocale";
import type { AnyOccupation } from "@/types/occupations.types";
import { OccupationChips } from "./OccupationChips";

const OCCUPATIONS: AnyOccupation[] = [
  {
    id: 1,
    userId: 1,
    name: "Translation",
    occupationType: "TRANSLATOR",
    charges: [],
    translationRates: [],
    languagePairs: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: 2,
    userId: 1,
    name: "Proofreading",
    occupationType: "CORRECTOR",
    charges: [],
    translationRates: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: 3,
    userId: 1,
    name: "Consulting",
    occupationType: "CUSTOM",
    charges: [],
    translationRates: [],
    customFields: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];

function renderChips(
  overrides: Partial<Parameters<typeof OccupationChips>[0]> = {},
  locale: Locale = "en",
) {
  return render(
    <OccupationChips
      occupationIds={[]}
      occupations={OCCUPATIONS}
      onChange={vi.fn()}
      {...overrides}
    />,
    { wrapper: createIntlWrapper(locale) },
  );
}

function openEditor() {
  fireEvent.click(screen.getByRole("button", { name: /occupation/i }));
}

describe("OccupationChips", () => {
  it("renders a read-only chip per active occupation id", () => {
    renderChips({ occupationIds: [1, 2] });

    expect(screen.getByText("Translation")).toBeInTheDocument();
    expect(screen.getByText("Proofreading")).toBeInTheDocument();
  });

  it("shows a committed chip's name from linkedOccupations even when the catalog hasn't loaded it yet", () => {
    renderChips({
      occupations: [],
      occupationIds: [1],
      linkedOccupations: [{ id: 1, name: "Translation" }],
    });

    expect(screen.getByText("Translation")).toBeInTheDocument();
  });

  it("prefers the live catalog name over linkedOccupations when both have the id", () => {
    renderChips({
      occupationIds: [1],
      linkedOccupations: [{ id: 1, name: "Stale Name" }],
    });

    expect(screen.getByText("Translation")).toBeInTheDocument();
    expect(screen.queryByText("Stale Name")).not.toBeInTheDocument();
  });

  it("removes a committed chip instantly via its x, without opening the editor", () => {
    const onChange = vi.fn();
    renderChips({ occupationIds: [1, 2], onChange });

    const chip = screen.getByText("Translation").closest("span")!;
    fireEvent.click(chip.querySelector("button")!);

    expect(onChange).toHaveBeenCalledWith([2]);
  });

  it("seeds staged state from occupationIds — Save with no edits reproduces the same ids", () => {
    const onChange = vi.fn();
    renderChips({ occupationIds: [1], onChange });

    openEditor();
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(onChange).toHaveBeenCalledWith([1]);
  });

  it("toggling an existing occupation on does not call onChange until Save", () => {
    const onChange = vi.fn();
    renderChips({ occupationIds: [1], onChange });

    openEditor();
    fireEvent.click(screen.getByText("Proofreading"));
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onChange).toHaveBeenCalledWith([1, 2]);
  });

  it("toggling an already-attached occupation off stages its removal, applied on Save", () => {
    const onChange = vi.fn();
    renderChips({ occupationIds: [1, 2], onChange });

    openEditor();
    fireEvent.click(screen.getByRole("option", { name: "Translation" }));
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onChange).toHaveBeenCalledWith([2]);
  });

  it("applies a combined add + remove as a single Save call with the correct final ids", () => {
    const onChange = vi.fn();
    renderChips({ occupationIds: [1, 2], onChange });

    openEditor();
    fireEvent.click(screen.getByRole("option", { name: "Translation" })); // stage removal of 1
    fireEvent.click(screen.getByRole("option", { name: "Consulting" })); // stage addition of 3
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith([2, 3]);
  });

  it("Cancel discards all staged changes with zero onChange calls", () => {
    const onChange = vi.fn();
    renderChips({ occupationIds: [1], onChange });

    openEditor();
    fireEvent.click(screen.getByText("Proofreading"));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onChange).not.toHaveBeenCalled();

    openEditor();
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onChange).toHaveBeenCalledWith([1]);
  });

  it("renders French copy when locale is fr", () => {
    renderChips({}, "fr");
    expect(
      screen.getByRole("button", { name: "+ métier" }),
    ).toBeInTheDocument();
  });
});
