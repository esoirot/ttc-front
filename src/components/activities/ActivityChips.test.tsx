import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { AnyActivity } from "@/types/activities.types";
import { ActivityChips } from "./ActivityChips";

const ACTIVITIES: AnyActivity[] = [
  {
    id: 1,
    userId: 1,
    name: "Translation",
    activityType: "TRANSLATOR",
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
    activityType: "CORRECTOR",
    charges: [],
    translationRates: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: 3,
    userId: 1,
    name: "Consulting",
    activityType: "CUSTOM",
    charges: [],
    translationRates: [],
    customFields: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];

function renderChips(
  overrides: Partial<Parameters<typeof ActivityChips>[0]> = {},
) {
  return render(
    <ActivityChips
      activityIds={[]}
      activities={ACTIVITIES}
      onChange={vi.fn()}
      {...overrides}
    />,
  );
}

function openEditor() {
  fireEvent.click(screen.getByRole("button", { name: /activit/i }));
}

describe("ActivityChips", () => {
  it("renders a read-only chip per active activity id", () => {
    renderChips({ activityIds: [1, 2] });

    expect(screen.getByText("Translation")).toBeInTheDocument();
    expect(screen.getByText("Proofreading")).toBeInTheDocument();
  });

  it("removes a committed chip instantly via its x, without opening the editor", () => {
    const onChange = vi.fn();
    renderChips({ activityIds: [1, 2], onChange });

    const chip = screen.getByText("Translation").closest("span")!;
    fireEvent.click(chip.querySelector("button")!);

    expect(onChange).toHaveBeenCalledWith([2]);
  });

  it("seeds staged state from activityIds — Save with no edits reproduces the same ids", () => {
    const onChange = vi.fn();
    renderChips({ activityIds: [1], onChange });

    openEditor();
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(onChange).toHaveBeenCalledWith([1]);
  });

  it("toggling an existing activity on does not call onChange until Save", () => {
    const onChange = vi.fn();
    renderChips({ activityIds: [1], onChange });

    openEditor();
    fireEvent.click(screen.getByText("Proofreading"));
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onChange).toHaveBeenCalledWith([1, 2]);
  });

  it("toggling an already-attached activity off stages its removal, applied on Save", () => {
    const onChange = vi.fn();
    renderChips({ activityIds: [1, 2], onChange });

    openEditor();
    fireEvent.click(screen.getByRole("option", { name: "Translation" }));
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onChange).toHaveBeenCalledWith([2]);
  });

  it("applies a combined add + remove as a single Save call with the correct final ids", () => {
    const onChange = vi.fn();
    renderChips({ activityIds: [1, 2], onChange });

    openEditor();
    fireEvent.click(screen.getByRole("option", { name: "Translation" })); // stage removal of 1
    fireEvent.click(screen.getByRole("option", { name: "Consulting" })); // stage addition of 3
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith([2, 3]);
  });

  it("Cancel discards all staged changes with zero onChange calls", () => {
    const onChange = vi.fn();
    renderChips({ activityIds: [1], onChange });

    openEditor();
    fireEvent.click(screen.getByText("Proofreading"));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onChange).not.toHaveBeenCalled();

    openEditor();
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onChange).toHaveBeenCalledWith([1]);
  });
});
