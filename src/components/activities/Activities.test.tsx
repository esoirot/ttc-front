import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { gqlFetch, gqlMutate } = vi.hoisted(() => ({
  gqlFetch: vi.fn(),
  gqlMutate: vi.fn(),
}));

vi.mock("@/lib/apollo", () => ({ gqlFetch, gqlMutate }));

const navigateMock = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom",
    );
  return { ...actual, useNavigate: () => navigateMock };
});

import { QueryClientProvider } from "@tanstack/react-query";
import { createQueryClient } from "@/test/queryClientWrapper";
import type { AnyActivity } from "@/types/activities.types";
import { Activities } from "./Activities";

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

function renderActivities() {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <Activities />
    </QueryClientProvider>,
  );
}

describe("Activities", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
    navigateMock.mockReset();
  });

  it("shows a loading state while activities are fetching", () => {
    gqlFetch.mockReturnValue(new Promise(() => {}));
    renderActivities();

    expect(screen.getByText("Loading…")).toBeInTheDocument();
  });

  it("shows an empty state when there are no activities", async () => {
    gqlFetch.mockResolvedValueOnce({ myActivities: [] });
    renderActivities();

    expect(
      await screen.findByText("No activities yet. Create one to get started."),
    ).toBeInTheDocument();
  });

  it("renders a card per activity", async () => {
    gqlFetch.mockResolvedValueOnce({
      myActivities: [
        makeActivity({ id: 1, name: "Freelance" }),
        makeActivity({ id: 2, name: "Agency work" }),
      ],
    });
    renderActivities();

    expect(await screen.findByText("Freelance")).toBeInTheDocument();
    expect(screen.getByText("Agency work")).toBeInTheDocument();
  });

  it("toggles the create form and hides the New Activity button while open", async () => {
    gqlFetch.mockResolvedValueOnce({ myActivities: [] });
    renderActivities();

    await screen.findByText("No activities yet. Create one to get started.");
    fireEvent.click(screen.getByText("New Activity"));

    expect(screen.getByLabelText("Activity name")).toBeInTheDocument();
    expect(screen.queryByText("New Activity")).not.toBeInTheDocument();
  });

  it("deletes an activity via its card's confirm dialog", async () => {
    gqlFetch.mockResolvedValueOnce({
      myActivities: [makeActivity({ id: 5, name: "ToDelete" })],
    });
    gqlMutate.mockResolvedValueOnce({ deleteActivity: true });
    renderActivities();

    await screen.findByText("ToDelete");
    fireEvent.click(screen.getByLabelText("Delete activity"));
    fireEvent.click(screen.getByText("Delete"));

    await waitFor(() =>
      expect(gqlMutate).toHaveBeenCalledWith(expect.anything(), { id: 5 }),
    );
  });
});
