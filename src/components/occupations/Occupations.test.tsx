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
import { IntlProvider } from "react-intl";
import { messages } from "@/i18n/messages";
import type { AnyOccupation } from "@/types/occupations.types";
import { Occupations } from "./Occupations";

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

function renderOccupations(locale: "en" | "fr" = "en") {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <IntlProvider locale={locale} messages={messages[locale]}>
        <Occupations />
      </IntlProvider>
    </QueryClientProvider>,
  );
}

describe("Occupations", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
    navigateMock.mockReset();
  });

  it("shows a loading state while occupations are fetching", () => {
    gqlFetch.mockReturnValue(new Promise(() => {}));
    renderOccupations();

    expect(screen.getByText("Loading…")).toBeInTheDocument();
  });

  it("shows an empty state when there are no occupations", async () => {
    gqlFetch.mockResolvedValueOnce({ myOccupations: [] });
    renderOccupations();

    expect(
      await screen.findByText("No occupations yet. Create one to get started."),
    ).toBeInTheDocument();
  });

  it("renders a card per occupation", async () => {
    gqlFetch.mockResolvedValueOnce({
      myOccupations: [
        makeOccupation({ id: 1, name: "Freelance" }),
        makeOccupation({ id: 2, name: "Agency work" }),
      ],
    });
    renderOccupations();

    expect(await screen.findByText("Freelance")).toBeInTheDocument();
    expect(screen.getByText("Agency work")).toBeInTheDocument();
  });

  it("toggles the create form and hides the New Occupation button while open", async () => {
    gqlFetch.mockResolvedValueOnce({ myOccupations: [] });
    renderOccupations();

    await screen.findByText("No occupations yet. Create one to get started.");
    fireEvent.click(screen.getByText("New Occupation"));

    expect(screen.getByLabelText("Occupation name")).toBeInTheDocument();
    expect(screen.queryByText("New Occupation")).not.toBeInTheDocument();
  });

  it("deletes an occupation via its card's confirm dialog", async () => {
    gqlFetch.mockResolvedValueOnce({
      myOccupations: [makeOccupation({ id: 5, name: "ToDelete" })],
    });
    gqlMutate.mockResolvedValueOnce({ deleteOccupation: true });
    renderOccupations();

    await screen.findByText("ToDelete");
    fireEvent.click(screen.getByLabelText("Delete occupation"));
    fireEvent.click(screen.getByText("Delete"));

    await waitFor(() =>
      expect(gqlMutate).toHaveBeenCalledWith(expect.anything(), { id: 5 }),
    );
  });

  it("renders French copy when locale is fr", async () => {
    gqlFetch.mockResolvedValueOnce({ myOccupations: [] });
    renderOccupations("fr");

    expect(
      await screen.findByText(
        "Aucun métier pour l'instant. Créez-en un pour commencer.",
      ),
    ).toBeInTheDocument();
  });
});
