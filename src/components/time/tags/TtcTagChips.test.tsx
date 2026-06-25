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
];

function renderChips(
  overrides: Partial<Parameters<typeof TtcTagChips>[0]> = {},
) {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <TtcTagChips
        tagIds={[]}
        tags={TAGS}
        onAdd={vi.fn()}
        onRemove={vi.fn()}
        {...overrides}
      />
    </QueryClientProvider>,
  );
}

describe("TtcTagChips", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("renders a chip per active tag id", () => {
    renderChips({ tagIds: [1, 2] });

    expect(screen.getByText("Urgent")).toBeInTheDocument();
    expect(screen.getByText("Client A")).toBeInTheDocument();
  });

  it("calls onRemove with the tag id when its x is clicked", () => {
    const onRemove = vi.fn();
    renderChips({ tagIds: [1], onRemove });

    fireEvent.click(screen.getByText("x"));
    expect(onRemove).toHaveBeenCalledWith(1);
  });

  it("filters the dropdown by query, excluding already-active tags", () => {
    renderChips({ tagIds: [1] });

    const input = screen.getByPlaceholderText("+ tag");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "client" } });

    expect(screen.getByText("Client A")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Urgent" }),
    ).not.toBeInTheDocument();
  });

  it("selects an existing tag via mousedown and clears the query", () => {
    const onAdd = vi.fn();
    renderChips({ onAdd });

    const input = screen.getByPlaceholderText("+ tag");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "Urgent" } });
    fireEvent.mouseDown(screen.getByText("Urgent"));

    expect(onAdd).toHaveBeenCalledWith(1);
    expect(input).toHaveValue("");
  });

  it("offers to create a new tag when the query matches nothing existing", () => {
    renderChips();

    const input = screen.getByPlaceholderText("+ tag");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "Brand New" } });

    expect(screen.getByText('Create "Brand New"')).toBeInTheDocument();
  });

  it("does not offer to create when the query exactly matches an existing tag", () => {
    renderChips();

    const input = screen.getByPlaceholderText("+ tag");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "urgent" } });

    expect(screen.queryByText(/^Create/)).not.toBeInTheDocument();
  });

  it("creates a new tag and adds it once the mutation resolves", async () => {
    gqlMutate.mockResolvedValueOnce({
      createTag: { id: 9, name: "Brand New" },
    });
    const onAdd = vi.fn();
    renderChips({ onAdd });

    const input = screen.getByPlaceholderText("+ tag");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "Brand New" } });
    fireEvent.mouseDown(screen.getByText('Create "Brand New"'));

    await waitFor(() => expect(onAdd).toHaveBeenCalledWith(9));
    expect(gqlMutate).toHaveBeenCalledWith(expect.anything(), {
      input: { name: "Brand New" },
    });
  });
});
