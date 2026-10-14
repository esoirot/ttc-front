import { useEffect, type ComponentType } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
  useNavigate,
} from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { RouteErrorPage } from "./components/layout/RouteErrorPage";
import { AppLayout } from "./components/layout/AppLayout";
import { AdminLayout } from "./components/admin/layout/AdminLayout";

/** Route fields that load a page on its first visit, in its own chunk. */
function page<M>(load: () => Promise<M>, name: keyof M) {
  return {
    lazy: async () => ({ Component: (await load())[name] as ComponentType }),
  };
}

function RootLayout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    function handleStorage(e: StorageEvent) {
      if (e.key === "ttc_logout") {
        queryClient.clear();
        navigate("/login", { replace: true });
      }
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [queryClient, navigate]);

  return <Outlet />;
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <RouteErrorPage />,
    // Blank while the first page's chunk loads.
    HydrateFallback: () => null,
    children: [
      {
        path: "/login",
        ...page(() => import("./pages/auth/LoginPage"), "LoginPage"),
      },
      {
        path: "/register",
        ...page(() => import("./pages/auth/RegisterPage"), "RegisterPage"),
      },
      {
        path: "/2fa/verify",
        ...page(
          () => import("./pages/auth/TwoFactorVerifyPage"),
          "TwoFactorVerifyPage",
        ),
      },
      {
        path: "/forgot-password",
        ...page(
          () => import("./pages/auth/ForgotPasswordPage"),
          "ForgotPasswordPage",
        ),
      },
      {
        path: "/reset-password",
        ...page(
          () => import("./pages/auth/ResetPasswordPage"),
          "ResetPasswordPage",
        ),
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              {
                path: "/admin",
                ...page(
                  () => import("./pages/admin/AdminDashboardPage"),
                  "AdminDashboardPage",
                ),
              },
              {
                path: "/admin/users",
                ...page(
                  () => import("./pages/admin/AdminUsersPage"),
                  "AdminUsersPage",
                ),
              },
              {
                path: "/admin/clients",
                ...page(
                  () => import("./pages/admin/AdminClientsPage"),
                  "AdminClientsPage",
                ),
              },
              {
                path: "/admin/projects",
                ...page(
                  () => import("./pages/admin/AdminProjectsPage"),
                  "AdminProjectsPage",
                ),
              },
              {
                path: "/admin/invoices",
                ...page(
                  () => import("./pages/admin/AdminInvoicesPage"),
                  "AdminInvoicesPage",
                ),
              },
              {
                path: "/admin/time",
                ...page(
                  () => import("./pages/admin/AdminTimeEntriesPage"),
                  "AdminTimeEntriesPage",
                ),
              },
              {
                path: "/admin/rates",
                ...page(
                  () => import("./pages/admin/AdminRatesPage"),
                  "AdminRatesPage",
                ),
              },
              {
                path: "/admin/audit",
                ...page(
                  () => import("./pages/admin/AdminAuditPage"),
                  "AdminAuditPage",
                ),
              },
              {
                path: "/admin/hubspot",
                ...page(
                  () => import("./pages/admin/AdminHubspotPage"),
                  "AdminHubspotPage",
                ),
              },
              {
                path: "/admin/activity",
                ...page(
                  () => import("./pages/admin/AdminActivityLogPage"),
                  "AdminActivityLogPage",
                ),
              },
            ],
          },
          {
            element: <AppLayout />,
            children: [
              {
                // A crashing page shows the error page inside the layout.
                errorElement: <RouteErrorPage />,
                children: [
                  {
                    path: "/",
                    ...page(
                      () => import("./pages/dashboard/DashboardPage"),
                      "DashboardPage",
                    ),
                  },
                  {
                    path: "/profile/edit",
                    ...page(
                      () => import("./pages/account/EditProfilePage"),
                      "EditProfilePage",
                    ),
                  },
                  {
                    path: "/settings/2fa",
                    ...page(
                      () => import("./pages/auth/TwoFactorSetupPage"),
                      "TwoFactorSetupPage",
                    ),
                  },
                  {
                    path: "/time-tracker",
                    ...page(
                      () => import("./pages/integrations/ClockifyPage"),
                      "ClockifyPage",
                    ),
                  },
                  {
                    path: "/hubspot",
                    ...page(
                      () => import("./pages/integrations/HubspotPage"),
                      "HubspotPage",
                    ),
                  },
                  {
                    path: "/google-calendar",
                    ...page(
                      () => import("./pages/integrations/GoogleCalendarPage"),
                      "GoogleCalendarPage",
                    ),
                  },
                  {
                    path: "/clients",
                    ...page(
                      () => import("./pages/clients/ClientsPage"),
                      "ClientsPage",
                    ),
                  },
                  {
                    path: "/clients/:id",
                    ...page(
                      () => import("./pages/clients/ClientDetailPage"),
                      "ClientDetailPage",
                    ),
                  },
                  {
                    path: "/prospects",
                    ...page(
                      () => import("./pages/clients/ProspectsPage"),
                      "ProspectsPage",
                    ),
                  },
                  {
                    path: "/projects",
                    ...page(
                      () => import("./pages/projects/ProjectsPage"),
                      "ProjectsPage",
                    ),
                  },
                  {
                    path: "/projects/:id",
                    ...page(
                      () => import("./pages/projects/ProjectDetailPage"),
                      "ProjectDetailPage",
                    ),
                  },
                  {
                    path: "/time",
                    ...page(
                      () => import("./pages/time/TimeEntriesPage"),
                      "TimeEntriesPage",
                    ),
                  },
                  {
                    path: "/invoices",
                    ...page(
                      () => import("./pages/invoices/InvoicesPage"),
                      "InvoicesPage",
                    ),
                  },
                  {
                    path: "/invoices/:id",
                    ...page(
                      () => import("./pages/invoices/InvoiceDetailPage"),
                      "InvoiceDetailPage",
                    ),
                  },
                  {
                    path: "/rates",
                    ...page(
                      () => import("./pages/rates/RatesPage"),
                      "RatesPage",
                    ),
                  },
                  {
                    path: "/occupations",
                    ...page(
                      () => import("./pages/occupations/OccupationsPage"),
                      "OccupationsPage",
                    ),
                  },
                  {
                    path: "/occupations/:id",
                    ...page(
                      () => import("./pages/occupations/OccupationDetailPage"),
                      "OccupationDetailPage",
                    ),
                  },
                ],
              },
            ],
          },
        ],
      },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
