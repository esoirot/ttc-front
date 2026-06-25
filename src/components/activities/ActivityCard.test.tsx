import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AnyActivity } from "@/types/activities.types";
import { ActivityCard } from "./ActivityCard";

const navigateMock = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom",
    );
  return { ...actual, useNavigate: () => navigateMock };
});

function makeActivity(overrides: Partial<AnyActivity> = {}): AnyActivity {
  return {
    id: 1,
    userId: 1,
    name: "Freelance",
    activityType: "CUSTOM",
    companyName: null,
    legalForm: null,
    charges: [],
    translationRates: [],
    customFields: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  } as AnyActivity;
}

describe("ActivityCard", () => {
  beforeEach(() => {
    navigateMock.mockReset();
  });

  it("shows the activity name and type badge", () => {
    render(<ActivityCard activity={makeActivity()} onDelete={vi.fn()} />);

    expect(screen.getByText("Freelance")).toBeInTheDocument();
    expect(screen.getByText("Custom")).toBeInTheDocument();
  });

  it("shows companyName and legalForm badges only when set", () => {
    render(
      <ActivityCard
        activity={makeActivity({
          companyName: "Acme SARL",
          legalForm: "SARL",
        })}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByText("Acme SARL")).toBeInTheDocument();
    expect(screen.getByText("SARL")).toBeInTheDocument();
  });

  it("hides companyName and legalForm when null", () => {
    render(<ActivityCard activity={makeActivity()} onDelete={vi.fn()} />);

    expect(screen.queryByText("SARL")).not.toBeInTheDocument();
  });

  it("navigates to the activity detail page when the card is clicked", () => {
    render(
      <ActivityCard activity={makeActivity({ id: 7 })} onDelete={vi.fn()} />,
    );

    fireEvent.click(screen.getByText("Freelance"));
    expect(navigateMock).toHaveBeenCalledWith("/activities/7");
  });

  it("does not navigate when the delete trigger is clicked", () => {
    render(<ActivityCard activity={makeActivity()} onDelete={vi.fn()} />);

    fireEvent.click(screen.getByLabelText("Delete activity"));
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it("calls onDelete with the activity id when delete is confirmed", () => {
    const onDelete = vi.fn();
    render(
      <ActivityCard activity={makeActivity({ id: 9 })} onDelete={onDelete} />,
    );

    fireEvent.click(screen.getByLabelText("Delete activity"));
    fireEvent.click(screen.getByText("Delete"));

    expect(onDelete).toHaveBeenCalledWith(9);
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it("does not call onDelete when the dialog is cancelled", () => {
    const onDelete = vi.fn();
    render(<ActivityCard activity={makeActivity()} onDelete={onDelete} />);

    fireEvent.click(screen.getByLabelText("Delete activity"));
    fireEvent.click(screen.getByText("Cancel"));

    expect(onDelete).not.toHaveBeenCalled();
  });
});
