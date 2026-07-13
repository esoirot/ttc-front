import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./AppLayout";

const meta: Meta<typeof AppLayout> = {
  component: AppLayout,
  title: "Templates/AppLayout",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter initialEntries={["/"]}>
          <Routes>
            <Route path="/" element={<Story />}>
              <Route
                index
                element={
                  <div className="p-6">
                    <p className="text-sm text-muted-foreground">
                      Page content renders here via &lt;Outlet/&gt; — this
                      template only owns the sidebar + content shell.
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
          "No backend/MSW is configured — Sidebar's useCurrentUser() fires a real query that fails fast in Storybook's sandbox, so the SSE hooks (gated on a logged-in user id) never actually connect. That's an accepted limitation, not a bug.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof AppLayout>;

export const Default: Story = {};
