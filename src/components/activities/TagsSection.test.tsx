import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { gqlFetch, gqlMutate } = vi.hoisted(() => ({
  gqlFetch: vi.fn(),
  gqlMutate: vi.fn(),
}));

vi.mock("@/lib/apollo", () => ({ gqlFetch, gqlMutate }));

import { QueryClientProvider } from "@tanstack/react-query";
import { createQueryClient } from "@/test/queryClientWrapper";
import { TagsSection } from "./TagsSection";

function renderSection(queryClient = createQueryClient()) {
  return render(
    <QueryClientProvider client={queryClient}>
      <TagsSection />
    </QueryClientProvider>,
  );
}

describe("TagsSection", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("shows an empty state when there are no tags", async () => {
    gqlFetch.mockResolvedValueOnce({ tags: [] });
    renderSection();

    expect(await screen.findByText("No tags yet.")).toBeInTheDocument();
  });

  it("renders a chip per tag", async () => {
    gqlFetch.mockResolvedValueOnce({
      tags: [
        { id: 1, name: "Urgent" },
        { id: 2, name: "Long-term" },
      ],
    });
    renderSection();

    expect(await screen.findByText("Urgent")).toBeInTheDocument();
    expect(screen.getByText("Long-term")).toBeInTheDocument();
  });

  it("disables Add until a non-blank name is entered", async () => {
    gqlFetch.mockResolvedValueOnce({ tags: [] });
    renderSection();

    await screen.findByText("No tags yet.");
    expect(screen.getByRole("button", { name: "Add" })).toBeDisabled();

    fireEvent.change(screen.getByPlaceholderText("New tag name"), {
      target: { value: "Urgent" },
    });
    expect(screen.getByRole("button", { name: "Add" })).not.toBeDisabled();
  });

  it("creates a tag with the trimmed name and clears the input", async () => {
    gqlFetch.mockResolvedValueOnce({ tags: [] });
    gqlMutate.mockResolvedValueOnce({ createTag: { id: 1, name: "Urgent" } });
    renderSection();

    await screen.findByText("No tags yet.");
    fireEvent.change(screen.getByPlaceholderText("New tag name"), {
      target: { value: "  Urgent  " },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add" }));

    await waitFor(() =>
      expect(gqlMutate).toHaveBeenCalledWith(expect.anything(), {
        input: { name: "Urgent" },
      }),
    );
    await waitFor(() =>
      expect(screen.getByPlaceholderText("New tag name")).toHaveValue(""),
    );
  });

  it("deletes a tag when the confirm dialog is accepted", async () => {
    gqlFetch.mockResolvedValueOnce({
      tags: [{ id: 9, name: "Urgent" }],
    });
    gqlMutate.mockResolvedValueOnce({ deleteTag: true });
    renderSection();

    await screen.findByText("Urgent");
    fireEvent.click(screen.getByText("×"));
    fireEvent.click(screen.getByText("Delete"));

    await waitFor(() =>
      expect(gqlMutate).toHaveBeenCalledWith(expect.anything(), { id: 9 }),
    );
  });
});
