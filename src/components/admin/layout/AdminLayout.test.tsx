import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

vi.mock("./AdminSidebar", () => ({
  AdminSidebar: () => <div>Sidebar</div>,
}));

import { AdminLayout } from "./AdminLayout";

describe("AdminLayout", () => {
  it("renders the sidebar and the nested route content via Outlet", () => {
    render(
      <MemoryRouter initialEntries={["/admin/child"]}>
        <Routes>
          <Route element={<AdminLayout />}>
            <Route path="/admin/child" element={<p>Child page</p>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText("Sidebar")).toBeInTheDocument();
    expect(screen.getByText("Child page")).toBeInTheDocument();
  });
});
