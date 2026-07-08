import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AdminPageHeader } from "./AdminPageHeader";

describe("AdminPageHeader", () => {
  it("renders the title and total count", () => {
    render(<AdminPageHeader title="Projects" total={12} />);
    expect(screen.getByText("Projects")).toBeInTheDocument();
    expect(screen.getByText("12 total")).toBeInTheDocument();
  });
});
