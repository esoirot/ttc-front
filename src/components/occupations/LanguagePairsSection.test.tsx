import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { gqlFetch, gqlMutate } = vi.hoisted(() => ({
  gqlFetch: vi.fn(),
  gqlMutate: vi.fn(),
}));

vi.mock("@/lib/apollo", () => ({ gqlFetch, gqlMutate }));

import { QueryClientProvider } from "@tanstack/react-query";
import { IntlProvider } from "react-intl";
import { createQueryClient } from "@/test/queryClientWrapper";
import { messages } from "@/i18n/messages";
import type { Locale } from "@/i18n/useLocale";
import type { LanguagePair } from "@/types/occupations.types";
import { LanguagePairsSection } from "./LanguagePairsSection";

function makePair(overrides: Partial<LanguagePair> = {}): LanguagePair {
  return {
    id: 1,
    occupationId: 5,
    fromLanguage: "EN",
    toLanguage: "FR",
    ...overrides,
  };
}

function renderSection(
  initialPairs: LanguagePair[] = [],
  locale: Locale = "en",
) {
  return render(
    <IntlProvider locale={locale} messages={messages[locale]}>
      <QueryClientProvider client={createQueryClient()}>
        <LanguagePairsSection occupationId={5} initialPairs={initialPairs} />
      </QueryClientProvider>
    </IntlProvider>,
  );
}

describe("LanguagePairsSection", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("renders one row per initial pair", () => {
    renderSection([
      makePair({ id: 1 }),
      makePair({ id: 2, fromLanguage: "DE", toLanguage: "ES" }),
    ]);

    expect(screen.getAllByLabelText("Remove pair")).toHaveLength(2);
  });

  it("disables Save when there are no pairs", () => {
    renderSection([]);

    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
  });

  it("+ Add pair appends an empty row and disables Save until both languages are picked", () => {
    renderSection([]);

    fireEvent.click(screen.getByText("+ Add pair"));

    expect(screen.getAllByLabelText("Remove pair")).toHaveLength(1);
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
  });

  it("Remove pair deletes the row at that index", () => {
    renderSection([
      makePair({ id: 1 }),
      makePair({ id: 2, fromLanguage: "DE", toLanguage: "ES" }),
    ]);

    fireEvent.click(screen.getAllByLabelText("Remove pair")[0]);

    expect(screen.getAllByLabelText("Remove pair")).toHaveLength(1);
  });

  it("shows a 'Same language' warning and disables Save when from equals to", () => {
    renderSection([makePair({ fromLanguage: "EN", toLanguage: "EN" })]);

    expect(screen.getByText("Same language")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
  });

  it("submits the pairs and shows Saved. on success", async () => {
    gqlMutate.mockResolvedValueOnce({ updateOccupation: { id: 5 } });
    renderSection([makePair({ fromLanguage: "EN", toLanguage: "FR" })]);

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(gqlMutate).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          input: expect.objectContaining({
            id: 5,
            languagePairs: [{ fromLanguage: "EN", toLanguage: "FR" }],
          }),
        }),
      ),
    );
    expect(await screen.findByText("Saved.")).toBeInTheDocument();
  });

  it("renders French copy when locale is fr", () => {
    renderSection([], "fr");
    expect(
      screen.getByRole("button", { name: "Enregistrer" }),
    ).toBeInTheDocument();
  });
});
