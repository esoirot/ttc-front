import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { AdminLayout } from "./AdminLayout";

const meta: Meta<typeof AdminLayout> = {
  component: AdminLayout,
  title: "Templates/AdminLayout",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter initialEntries={["/admin"]}>
          <Routes>
            <Route path="/admin" element={<Story />}>
              <Route
                index
                element={
                  <div className="p-6">
                    <p className="text-sm text-muted-foreground">
                      Page content renders here via &lt;Outlet/&gt; — this
                      template only owns the admin sidebar + content shell.
                    </p>
                  </div>
                }
              />
            </Route>
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "No backend/MSW is configured — AdminSidebar's useCurrentUser() fires a real query that fails fast in Storybook's sandbox, so permission-gated nav links render in their logged-out fallback. That's an accepted limitation, not a bug.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof AdminLayout>;

export const Default: Story = {};
