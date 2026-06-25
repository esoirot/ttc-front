import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BackupCodesDisplay } from "./BackupCodesDisplay";

describe("BackupCodesDisplay", () => {
  const writeText = vi.fn();

  beforeEach(() => {
    writeText.mockReset();
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders every backup code", () => {
    render(
      <BackupCodesDisplay codes={["aaa111", "bbb222"]} onDone={vi.fn()} />,
    );

    expect(screen.getByText("aaa111")).toBeInTheDocument();
    expect(screen.getByText("bbb222")).toBeInTheDocument();
  });

  it("copies all codes newline-joined when 'Copy all codes' is clicked", () => {
    render(
      <BackupCodesDisplay codes={["aaa111", "bbb222"]} onDone={vi.fn()} />,
    );

    fireEvent.click(screen.getByText("Copy all codes"));

    expect(writeText).toHaveBeenCalledWith("aaa111\nbbb222");
  });

  it("calls onDone when 'Done' is clicked", () => {
    const onDone = vi.fn();
    render(<BackupCodesDisplay codes={["aaa111"]} onDone={onDone} />);

    fireEvent.click(screen.getByText("Done"));

    expect(onDone).toHaveBeenCalled();
  });
});
