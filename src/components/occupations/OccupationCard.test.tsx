import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createIntlWrapper } from "@/test/intlWrapper";
import type { AnyOccupation } from "@/types/occupations.types";
import { OccupationCard } from "./OccupationCard";

const wrapper = createIntlWrapper();

const navigateMock = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom",
    );
  return { ...actual, useNavigate: () => navigateMock };
});

function makeOccupation(overrides: Partial<AnyOccupation> = {}): AnyOccupation {
  return {
    id: 1,
    userId: 1,
    name: "Freelance",
    occupationType: "CUSTOM",
    companyName: null,
    legalForm: null,
    charges: [],
    translationRates: [],
    customFields: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  } as AnyOccupation;
}

describe("OccupationCard", () => {
  beforeEach(() => {
    navigateMock.mockReset();
  });

  it("shows the occupation name and type badge", () => {
    render(
      <OccupationCard occupation={makeOccupation()} onDelete={vi.fn()} />,
      {
        wrapper,
      },
    );

    expect(screen.getByText("Freelance")).toBeInTheDocument();
    expect(screen.getByText("Custom")).toBeInTheDocument();
  });

  it("shows companyName and legalForm badges only when set", () => {
    render(
      <OccupationCard
        occupation={makeOccupation({
          companyName: "Acme SARL",
          legalForm: "SARL",
        })}
        onDelete={vi.fn()}
      />,
      { wrapper },
    );

    expect(screen.getByText("Acme SARL")).toBeInTheDocument();
    expect(screen.getByText("SARL")).toBeInTheDocument();
  });

  it("hides companyName and legalForm when null", () => {
    render(
      <OccupationCard occupation={makeOccupation()} onDelete={vi.fn()} />,
      {
        wrapper,
      },
    );

    expect(screen.queryByText("SARL")).not.toBeInTheDocument();
  });

  it("navigates to the occupation detail page when the card is clicked", () => {
    render(
      <OccupationCard
        occupation={makeOccupation({ id: 7 })}
        onDelete={vi.fn()}
      />,
      { wrapper },
    );

    fireEvent.click(screen.getByText("Freelance"));
    expect(navigateMock).toHaveBeenCalledWith("/occupations/7");
  });

  it("does not navigate when the delete trigger is clicked", () => {
    render(
      <OccupationCard occupation={makeOccupation()} onDelete={vi.fn()} />,
      {
        wrapper,
      },
    );

    fireEvent.click(screen.getByLabelText("Delete occupation"));
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it("calls onDelete with the occupation id when delete is confirmed", () => {
    const onDelete = vi.fn();
    render(
      <OccupationCard
        occupation={makeOccupation({ id: 9 })}
        onDelete={onDelete}
      />,
      { wrapper },
    );

    fireEvent.click(screen.getByLabelText("Delete occupation"));
    fireEvent.click(screen.getByText("Delete"));

    expect(onDelete).toHaveBeenCalledWith(9);
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it("does not call onDelete when the dialog is cancelled", () => {
    const onDelete = vi.fn();
    render(
      <OccupationCard occupation={makeOccupation()} onDelete={onDelete} />,
      {
        wrapper,
      },
    );

    fireEvent.click(screen.getByLabelText("Delete occupation"));
    fireEvent.click(screen.getByText("Cancel"));

    expect(onDelete).not.toHaveBeenCalled();
  });
});
