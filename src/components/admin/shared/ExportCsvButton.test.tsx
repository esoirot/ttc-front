import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { exportCsv } = vi.hoisted(() => ({ exportCsv: vi.fn() }));
vi.mock("@/lib/csv", () => ({ exportCsv }));

import { ExportCsvButton } from "./ExportCsvButton";

describe("ExportCsvButton", () => {
  beforeEach(() => exportCsv.mockReset());

  it("calls exportCsv with the given rows and filename when clicked", () => {
    const rows = [{ id: 1, name: "Acme" }];
    render(<ExportCsvButton rows={rows} filename="clients.csv" />);

    fireEvent.click(screen.getByText("Export CSV"));

    expect(exportCsv).toHaveBeenCalledWith(rows, "clients.csv");
  });
});
