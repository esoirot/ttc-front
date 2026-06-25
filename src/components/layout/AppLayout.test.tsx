import { render, screen } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryClient } from "@/test/queryClientWrapper";

const { gqlFetch, gqlMutate } = vi.hoisted(() => ({
  gqlFetch: vi.fn(),
  gqlMutate: vi.fn(),
}));

vi.mock("@/lib/apollo", () => ({
  gqlFetch,
  gqlMutate,
  apolloClient: { clearStore: vi.fn() },
}));

import { AppLayout } from "./AppLayout";

describe("AppLayout", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
    gqlFetch.mockResolvedValue({ me: null });
  });

  it("renders the Sidebar alongside the routed child via Outlet", async () => {
    render(
      <QueryClientProvider client={createQueryClient()}>
        <MemoryRouter initialEntries={["/"]}>
          <Routes>
            <Route path="/" element={<AppLayout />}>
              <Route index element={<div>Page content</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByText("Freelance Assistant")).toBeInTheDocument();
    expect(screen.getByText("Page content")).toBeInTheDocument();
  });
});
