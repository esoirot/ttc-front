import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { apiGet, apiPost, apiPatch, apiDelete } = vi.hoisted(() => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
  apiPatch: vi.fn(),
  apiDelete: vi.fn(),
}));

vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api");
  return { ...actual, apiGet, apiPost, apiPatch, apiDelete };
});

import { QueryClientProvider } from "@tanstack/react-query";
import { IntlProvider } from "react-intl";
import { createQueryClient } from "@/test/queryClientWrapper";
import { messages } from "@/i18n/messages";
import type { Locale } from "@/i18n/useLocale";
import { ClockifyImportForm } from "./ClockifyImportForm";

function renderForm(
  refetch = vi.fn(),
  onClose = vi.fn(),
  locale: Locale = "en",
) {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <IntlProvider locale={locale} messages={messages[locale]}>
        <ClockifyImportForm
          workspaceId="ws-1"
          refetch={refetch}
          onClose={onClose}
        />
      </IntlProvider>
    </QueryClientProvider>,
  );
}

describe("ClockifyImportForm", () => {
  beforeEach(() => {
    apiGet.mockReset();
    apiPost.mockReset();
    apiPatch.mockReset();
    apiDelete.mockReset();
  });

  it("pre-fills From with 7 days ago and To with today", () => {
    renderForm();

    const today = new Date().toISOString().slice(0, 10);
    const weekAgo = new Date(Date.now() - 7 * 86400_000)
      .toISOString()
      .slice(0, 10);

    expect(screen.getByLabelText("From")).toHaveValue(weekAgo);
    expect(screen.getByLabelText("To")).toHaveValue(today);
  });

  it("calls onClose when Cancel is clicked", () => {
    const onClose = vi.fn();
    renderForm(vi.fn(), onClose);

    fireEvent.click(screen.getByText("Cancel"));
    expect(onClose).toHaveBeenCalled();
  });

  it("imports the selected range, shows the result, and refetches", async () => {
    apiPost.mockResolvedValueOnce({ imported: 3, skipped: 1 });
    const refetch = vi.fn();
    renderForm(refetch);

    fireEvent.change(screen.getByLabelText("From"), {
      target: { value: "2026-06-01" },
    });
    fireEvent.change(screen.getByLabelText("To"), {
      target: { value: "2026-06-10" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Import" }));

    await waitFor(() =>
      expect(apiPost).toHaveBeenCalledWith(
        "/clockify/workspaces/ws-1/entries/import",
        {
          start: new Date(2026, 5, 1).toISOString(),
          end: new Date(2026, 5, 10, 23, 59, 59, 999).toISOString(),
        },
      ),
    );
    expect(
      await screen.findByText("Imported 3, skipped 1 (already in TTC)."),
    ).toBeInTheDocument();
    expect(refetch).toHaveBeenCalled();
  });

  it("shows the error message when the import fails", async () => {
    apiPost.mockRejectedValueOnce(new Error("Workspace not connected"));
    renderForm();

    fireEvent.click(screen.getByRole("button", { name: "Import" }));

    expect(
      await screen.findByText("Workspace not connected"),
    ).toBeInTheDocument();
  });

  it("shows 'Importing…' and disables submit while pending", async () => {
    let resolveImport!: (v: { imported: number; skipped: number }) => void;
    apiPost.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveImport = resolve;
      }),
    );
    renderForm();

    fireEvent.click(screen.getByRole("button", { name: "Import" }));

    expect(
      await screen.findByRole("button", { name: "Importing…" }),
    ).toBeDisabled();

    resolveImport({ imported: 0, skipped: 0 });
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Import" })).not.toBeDisabled(),
    );
  });

  it("renders French copy when locale is fr", () => {
    renderForm(vi.fn(), vi.fn(), "fr");

    expect(
      screen.getByText("Importer les entrées Clockify dans TTC"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Importer" }),
    ).toBeInTheDocument();
  });
});
