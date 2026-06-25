import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LanguagePairsInput } from "./LanguagePairsInput";

describe("LanguagePairsInput", () => {
  it("renders no rows when pairs is empty", () => {
    render(
      <LanguagePairsInput
        pairs={[]}
        onAdd={vi.fn()}
        onUpdate={vi.fn()}
        onRemove={vi.fn()}
      />,
    );

    expect(screen.queryByLabelText("Remove pair")).not.toBeInTheDocument();
  });

  it("renders one row per pair", () => {
    render(
      <LanguagePairsInput
        pairs={[
          { fromLanguage: "EN", toLanguage: "FR" },
          { fromLanguage: "DE", toLanguage: "ES" },
        ]}
        onAdd={vi.fn()}
        onUpdate={vi.fn()}
        onRemove={vi.fn()}
      />,
    );

    expect(screen.getAllByLabelText("Remove pair")).toHaveLength(2);
  });

  it("calls onAdd when '+ Add pair' is clicked", () => {
    const onAdd = vi.fn();
    render(
      <LanguagePairsInput
        pairs={[]}
        onAdd={onAdd}
        onUpdate={vi.fn()}
        onRemove={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText("+ Add pair"));
    expect(onAdd).toHaveBeenCalled();
  });

  it("calls onRemove with the row index when ✕ is clicked", () => {
    const onRemove = vi.fn();
    render(
      <LanguagePairsInput
        pairs={[
          { fromLanguage: "EN", toLanguage: "FR" },
          { fromLanguage: "DE", toLanguage: "ES" },
        ]}
        onAdd={vi.fn()}
        onUpdate={vi.fn()}
        onRemove={onRemove}
      />,
    );

    fireEvent.click(screen.getAllByLabelText("Remove pair")[1]);
    expect(onRemove).toHaveBeenCalledWith(1);
  });

  it("shows a 'Same language' warning when from/to match", () => {
    render(
      <LanguagePairsInput
        pairs={[{ fromLanguage: "EN", toLanguage: "EN" }]}
        onAdd={vi.fn()}
        onUpdate={vi.fn()}
        onRemove={vi.fn()}
      />,
    );

    expect(screen.getByText("Same language")).toBeInTheDocument();
  });

  it("hides the warning when from/to differ", () => {
    render(
      <LanguagePairsInput
        pairs={[{ fromLanguage: "EN", toLanguage: "FR" }]}
        onAdd={vi.fn()}
        onUpdate={vi.fn()}
        onRemove={vi.fn()}
      />,
    );

    expect(screen.queryByText("Same language")).not.toBeInTheDocument();
  });

  it("hides the warning when either language is unset", () => {
    render(
      <LanguagePairsInput
        pairs={[{ fromLanguage: "", toLanguage: "" }]}
        onAdd={vi.fn()}
        onUpdate={vi.fn()}
        onRemove={vi.fn()}
      />,
    );

    expect(screen.queryByText("Same language")).not.toBeInTheDocument();
  });
});
