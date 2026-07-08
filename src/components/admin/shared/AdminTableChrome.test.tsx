import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  LoadMoreButton,
  TableEmptyRow,
  TableLoadingSkeleton,
} from "./AdminTableChrome";

describe("TableLoadingSkeleton", () => {
  it("renders the default number of skeleton rows", () => {
    const { container } = render(<TableLoadingSkeleton />);
    expect(container.querySelectorAll('[data-slot="skeleton"]')).toHaveLength(
      3,
    );
  });

  it("renders a custom number of skeleton rows", () => {
    const { container } = render(<TableLoadingSkeleton rows={5} />);
    expect(container.querySelectorAll('[data-slot="skeleton"]')).toHaveLength(
      5,
    );
  });
});

describe("TableEmptyRow", () => {
  it("renders its children spanning colSpan columns", () => {
    render(
      <table>
        <tbody>
          <TableEmptyRow colSpan={5}>No projects found.</TableEmptyRow>
        </tbody>
      </table>,
    );
    const cell = screen.getByText("No projects found.");
    expect(cell).toBeInTheDocument();
    expect(cell.closest("td")).toHaveAttribute("colspan", "5");
  });
});

describe("LoadMoreButton", () => {
  it("calls onClick when clicked", () => {
    const onClick = vi.fn();
    render(<LoadMoreButton onClick={onClick} />);
    fireEvent.click(screen.getByText("Load more"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
