import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { IntlProvider } from "react-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryClient } from "@/test/queryClientWrapper";
import { messages } from "@/i18n/messages";
import type { Locale } from "@/i18n/useLocale";

const { gqlFetch, gqlMutate } = vi.hoisted(() => ({
  gqlFetch: vi.fn(),
  gqlMutate: vi.fn(),
}));

vi.mock("@/lib/apollo", () => ({ gqlFetch, gqlMutate }));

import { CreateProjectForm } from "./CreateProjectForm";

function renderForm(onClose = vi.fn(), locale: Locale = "en") {
  return render(
    <IntlProvider locale={locale} messages={messages[locale]}>
      <QueryClientProvider client={createQueryClient()}>
        <CreateProjectForm clients={[]} onClose={onClose} />
      </QueryClientProvider>
    </IntlProvider>,
  );
}

describe("CreateProjectForm", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("shows a validation error when title is blank", () => {
    renderForm();

    fireEvent.click(screen.getByText("Create project"));

    expect(screen.getByText("Title is required")).toBeInTheDocument();
    expect(gqlMutate).not.toHaveBeenCalled();
  });

  it("creates the project and closes the form on success", async () => {
    gqlMutate.mockResolvedValueOnce({ createProject: { id: 9 } });
    const onClose = vi.fn();
    renderForm(onClose);

    fireEvent.change(screen.getByLabelText("Title *"), {
      target: { value: "New project" },
    });
    fireEvent.click(screen.getByLabelText("Source language"));
    fireEvent.click(screen.getByRole("option", { name: "EN — English" }));
    fireEvent.click(screen.getByLabelText("Target language"));
    fireEvent.click(screen.getByRole("option", { name: "FR — French" }));
    fireEvent.click(screen.getByText("Create project"));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(gqlMutate.mock.calls[0][1]).toMatchObject({
      input: {
        title: "New project",
        sourceLanguage: "EN",
        targetLanguage: "FR",
      },
    });
  }, 15_000);

  it("renders French copy when locale is fr", () => {
    renderForm(vi.fn(), "fr");
    fireEvent.click(screen.getByText("Créer le projet"));
    expect(screen.getByText("Le titre est requis")).toBeInTheDocument();
  });
});
