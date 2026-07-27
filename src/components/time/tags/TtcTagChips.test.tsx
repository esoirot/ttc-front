import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { gqlFetch, gqlMutate } = vi.hoisted(() => ({
  gqlFetch: vi.fn(),
  gqlMutate: vi.fn(),
}));

vi.mock("@/lib/apollo", () => ({ gqlFetch, gqlMutate }));

import { QueryClientProvider } from "@tanstack/react-query";
import { createQueryClient } from "@/test/queryClientWrapper";
import type { Tag } from "@/types/tags.types";
import { TtcTagChips } from "./TtcTagChips";

const TAGS: Tag[] = [
  { id: 1, name: "Urgent", userId: 1 } as Tag,
  { id: 2, name: "Client A", userId: 1 } as Tag,
  { id: 3, name: "Internal", userId: 1 } as Tag,
];

function renderChips(
  overrides: Partial<Parameters<typeof TtcTagChips>[0]> = {},
) {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <TtcTagChips tagIds={[]} tags={TAGS} onChange={vi.fn()} {...overrides} />
    </QueryClientProvider>,
  );
}

function openEditor() {
  fireEvent.click(screen.getByRole("button", { name: /tag/i }));
}

describe("TtcTagChips", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("renders a read-only chip per active tag id", () => {
    renderChips({ tagIds: [1, 2] });

    expect(screen.getByText("Urgent")).toBeInTheDocument();
    expect(screen.getByText("Client A")).toBeInTheDocument();
  });

  it("removes a committed chip instantly via its x, without opening the editor", () => {
    const onChange = vi.fn();
    renderChips({ tagIds: [1, 2], onChange });

    const chip = screen.getByText("Urgent").closest("span")!;
    fireEvent.click(chip.querySelector("button")!);

    expect(onChange).toHaveBeenCalledWith([2]);
  });

  it("seeds staged state from tagIds — Save with no edits reproduces the same ids", () => {
    const onChange = vi.fn();
    renderChips({ tagIds: [1], onChange });

    openEditor();
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(onChange).toHaveBeenCalledWith([1]);
  });

  it("toggling an existing tag on does not call onChange until Save", () => {
    const onChange = vi.fn();
    renderChips({ tagIds: [1], onChange });

    openEditor();
    fireEvent.click(screen.getByText("Client A"));
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onChange).toHaveBeenCalledWith([1, 2]);
  });

  it("toggling an already-attached tag off stages its removal, applied on Save", () => {
    const onChange = vi.fn();
    renderChips({ tagIds: [1, 2], onChange });

    openEditor();
    fireEvent.click(screen.getByRole("option", { name: "Urgent" }));
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onChange).toHaveBeenCalledWith([2]);
  });

  it("applies a combined add + remove as a single Save call with the correct final ids", () => {
    const onChange = vi.fn();
    renderChips({ tagIds: [1, 2], onChange });

    openEditor();
    fireEvent.click(screen.getByRole("option", { name: "Urgent" })); // stage removal of 1
    fireEvent.click(screen.getByRole("option", { name: "Internal" })); // stage addition of 3
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith([2, 3]);
  });

  it("Cancel discards all staged changes with zero onChange calls", () => {
    const onChange = vi.fn();
    renderChips({ tagIds: [1], onChange });

    openEditor();
    fireEvent.click(screen.getByText("Client A"));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onChange).not.toHaveBeenCalled();

    openEditor();
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onChange).toHaveBeenCalledWith([1]);
  });

  it("staging a new tag name shows a preview chip without calling createTag", () => {
    renderChips();

    openEditor();
    const input = screen.getByPlaceholderText("Search or add tag…");
    fireEvent.change(input, { target: { value: "Brand New" } });
    fireEvent.click(screen.getByText('Add "Brand New"'));

    expect(gqlMutate).not.toHaveBeenCalled();
    expect(screen.getByText("Brand New")).toBeInTheDocument();
  });

  it("a staged pending-new chip is individually removable before Save", async () => {
    gqlMutate.mockResolvedValueOnce({ createTag: { id: 9, name: "B" } });
    const onChange = vi.fn();
    renderChips({ onChange });

    openEditor();
    const input = screen.getByPlaceholderText("Search or add tag…");

    fireEvent.change(input, { target: { value: "A" } });
    fireEvent.click(screen.getByText('Add "A"'));
    fireEvent.change(input, { target: { value: "B" } });
    fireEvent.click(screen.getByText('Add "B"'));

    const chipA = screen.getByText("A").closest("span")!;
    fireEvent.click(chipA.querySelector("button")!);

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(onChange).toHaveBeenCalledWith([9]));
    expect(gqlMutate).toHaveBeenCalledTimes(1);
    expect(gqlMutate).toHaveBeenCalledWith(expect.anything(), {
      input: { name: "B" },
    });
  });

  it("Save creates staged new tags then calls onChange with the resulting ids", async () => {
    gqlMutate.mockResolvedValueOnce({
      createTag: { id: 9, name: "Brand New" },
    });
    const onChange = vi.fn();
    renderChips({ tagIds: [1], onChange });

    openEditor();
    const input = screen.getByPlaceholderText("Search or add tag…");
    fireEvent.change(input, { target: { value: "Brand New" } });
    fireEvent.click(screen.getByText('Add "Brand New"'));
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(onChange).toHaveBeenCalledWith([1, 9]));
    expect(gqlMutate).toHaveBeenCalledWith(expect.anything(), {
      input: { name: "Brand New" },
    });
  });

  it("Save disables itself while a create mutation is in flight", async () => {
    let resolveCreate!: (v: unknown) => void;
    gqlMutate.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveCreate = resolve;
      }),
    );
    renderChips();

    openEditor();
    const input = screen.getByPlaceholderText("Search or add tag…");
    fireEvent.change(input, { target: { value: "Brand New" } });
    fireEvent.click(screen.getByText('Add "Brand New"'));
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(screen.getByRole("button", { name: "Saving…" })).toBeDisabled();

    resolveCreate({ createTag: { id: 9, name: "Brand New" } });
    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: "Saving…" }),
      ).not.toBeInTheDocument(),
    );
  });

  it("a createTag failure during Save keeps staged state intact for retry", async () => {
    gqlMutate.mockRejectedValueOnce(new Error("network error"));
    gqlMutate.mockResolvedValueOnce({
      createTag: { id: 9, name: "Brand New" },
    });
    const onChange = vi.fn();
    renderChips({ onChange });

    openEditor();
    const input = screen.getByPlaceholderText("Search or add tag…");
    fireEvent.change(input, { target: { value: "Brand New" } });
    fireEvent.click(screen.getByText('Add "Brand New"'));
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(screen.getByText(/Couldn't create/)).toBeInTheDocument(),
    );
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByText("Brand New")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => expect(onChange).toHaveBeenCalledWith([9]));
  });
});
