import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BulkDeleteBar } from "./BulkDeleteBar";

function deferred<T>() {
  let resolve!: (v: T) => void;
  let reject!: (e: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe("BulkDeleteBar", () => {
  it("renders nothing when selectedIds is empty", () => {
    render(
      <BulkDeleteBar
        selectedIds={new Set()}
        itemLabel="projects"
        onDelete={vi.fn()}
        onDone={vi.fn()}
      />,
    );
    expect(screen.queryByText(/selected/)).not.toBeInTheDocument();
  });

  it("shows the selected count and delete button", () => {
    render(
      <BulkDeleteBar
        selectedIds={new Set([1, 2])}
        itemLabel="projects"
        onDelete={vi.fn()}
        onDone={vi.fn()}
      />,
    );
    expect(screen.getByText("2 selected")).toBeInTheDocument();
    expect(screen.getByText("Delete selected (2)")).toBeInTheDocument();
  });

  it("shows the item label and count in the confirm dialog", () => {
    render(
      <BulkDeleteBar
        selectedIds={new Set([1, 2, 3])}
        itemLabel="projects"
        onDelete={vi.fn()}
        onDone={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByText("Delete selected (3)"));
    expect(screen.getByText("Delete 3 projects?")).toBeInTheDocument();
    expect(screen.getByText("This cannot be undone.")).toBeInTheDocument();
  });

  it("calls onDelete once per selected id", async () => {
    const onDelete = vi.fn().mockResolvedValue(undefined);
    const onDone = vi.fn();
    render(
      <BulkDeleteBar
        selectedIds={new Set([1, 2, 3])}
        itemLabel="projects"
        onDelete={onDelete}
        onDone={onDone}
      />,
    );
    fireEvent.click(screen.getByText("Delete selected (3)"));
    const dialog = screen.getByRole("alertdialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Delete" }));

    await waitFor(() => expect(onDone).toHaveBeenCalled());
    expect(onDelete).toHaveBeenCalledTimes(3);
    expect(onDelete).toHaveBeenCalledWith(1);
    expect(onDelete).toHaveBeenCalledWith(2);
    expect(onDelete).toHaveBeenCalledWith(3);
  });

  it("does not call onDone until every delete has settled", async () => {
    const d1 = deferred<void>();
    const d2 = deferred<void>();
    const d3 = deferred<void>();
    const promises = [d1.promise, d2.promise, d3.promise];
    let call = 0;
    const onDelete = vi.fn(() => promises[call++]!);
    const onDone = vi.fn();

    render(
      <BulkDeleteBar
        selectedIds={new Set([1, 2, 3])}
        itemLabel="projects"
        onDelete={onDelete}
        onDone={onDone}
      />,
    );
    fireEvent.click(screen.getByText("Delete selected (3)"));
    const dialog = screen.getByRole("alertdialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Delete" }));

    await Promise.resolve();
    expect(onDone).not.toHaveBeenCalled();

    d1.resolve();
    await Promise.resolve();
    expect(onDone).not.toHaveBeenCalled();

    d2.resolve();
    d3.resolve();
    await waitFor(() => expect(onDone).toHaveBeenCalledTimes(1));
  });

  it("still calls onDone when one delete rejects (Promise.allSettled semantics)", async () => {
    const onDelete = vi
      .fn()
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error("boom"))
      .mockResolvedValueOnce(undefined);
    const onDone = vi.fn();

    render(
      <BulkDeleteBar
        selectedIds={new Set([1, 2, 3])}
        itemLabel="projects"
        onDelete={onDelete}
        onDone={onDone}
      />,
    );
    fireEvent.click(screen.getByText("Delete selected (3)"));
    const dialog = screen.getByRole("alertdialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Delete" }));

    await waitFor(() => expect(onDone).toHaveBeenCalledTimes(1));
    expect(onDelete).toHaveBeenCalledTimes(3);
  });

  it("excludes excludeIds from the delete call list", async () => {
    const onDelete = vi.fn().mockResolvedValue(undefined);
    const onDone = vi.fn();

    render(
      <BulkDeleteBar
        selectedIds={new Set([1, 2, 3])}
        excludeIds={new Set([2])}
        itemLabel="users"
        onDelete={onDelete}
        onDone={onDone}
      />,
    );
    fireEvent.click(screen.getByText("Delete selected (3)"));
    const dialog = screen.getByRole("alertdialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Delete" }));

    await waitFor(() => expect(onDone).toHaveBeenCalled());
    expect(onDelete).toHaveBeenCalledTimes(2);
    expect(onDelete).not.toHaveBeenCalledWith(2);
  });
});
