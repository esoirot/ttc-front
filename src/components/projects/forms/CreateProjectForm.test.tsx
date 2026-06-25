import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryClient } from "@/test/queryClientWrapper";

const { gqlFetch, gqlMutate } = vi.hoisted(() => ({
  gqlFetch: vi.fn(),
  gqlMutate: vi.fn(),
}));

vi.mock("@/lib/apollo", () => ({ gqlFetch, gqlMutate }));

import { CreateProjectForm } from "./CreateProjectForm";

function renderForm(onClose = vi.fn()) {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <CreateProjectForm clients={[]} onClose={onClose} />
    </QueryClientProvider>,
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
    fireEvent.change(screen.getByLabelText("Source language"), {
      target: { value: "EN" },
    });
    fireEvent.change(screen.getByLabelText("Target language"), {
      target: { value: "FR" },
    });
    fireEvent.click(screen.getByText("Create project"));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(gqlMutate.mock.calls[0][1]).toMatchObject({
      input: {
        title: "New project",
        sourceLanguage: "EN",
        targetLanguage: "FR",
      },
    });
  });
});
