import { useEffect } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
  useNavigate,
} from "react-router-dom";
import { useApolloClient } from "@apollo/client/react";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AppLayout } from "./components/layout/AppLayout";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { TwoFactorVerifyPage } from "./pages/auth/TwoFactorVerifyPage";
import { TwoFactorSetupPage } from "./pages/auth/TwoFactorSetupPage";
import { ForgotPasswordPage } from "./pages/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/auth/ResetPasswordPage";
import { DashboardPage } from "./pages/dashboard/DashboardPage";
import { EditProfilePage } from "./pages/account/EditProfilePage";
import { ClockifyPage } from "./pages/integrations/ClockifyPage";
import { HubspotPage } from "./pages/integrations/HubspotPage";
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";
import { AdminUsersPage } from "./pages/admin/AdminUsersPage";
import { AdminClientsPage } from "./pages/admin/AdminClientsPage";
import { AdminProjectsPage } from "./pages/admin/AdminProjectsPage";
import { AdminInvoicesPage } from "./pages/admin/AdminInvoicesPage";
import { AdminTimeEntriesPage } from "./pages/admin/AdminTimeEntriesPage";
import { AdminRatesPage } from "./pages/admin/AdminRatesPage";
import { AdminAuditPage } from "./pages/admin/AdminAuditPage";
import { AdminHubspotPage } from "./pages/admin/AdminHubspotPage";
import { AdminActivityLogPage } from "./pages/admin/AdminActivityLogPage";
import { ClientsPage } from "./pages/clients/ClientsPage";
import { ClientDetailPage } from "./pages/clients/ClientDetailPage";
import { ProjectsPage } from "./pages/projects/ProjectsPage";
import { ProjectDetailPage } from "./pages/projects/ProjectDetailPage";
import { TimeEntriesPage } from "./pages/time/TimeEntriesPage";
import { InvoicesPage } from "./pages/invoices/InvoicesPage";
import { InvoiceDetailPage } from "./pages/invoices/InvoiceDetailPage";
import { RatesPage } from "./pages/rates/RatesPage";
import { AdminLayout } from "./components/admin/layout/AdminLayout";

function RootLayout() {
  const client = useApolloClient();
  const navigate = useNavigate();

  useEffect(() => {
    function handleStorage(e: StorageEvent) {
      if (e.key === "ttc_logout") {
        void client.clearStore();
        navigate("/login", { replace: true });
      }
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [client, navigate]);

  return <Outlet />;
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
      { path: "/2fa/verify", element: <TwoFactorVerifyPage /> },
      { path: "/forgot-password", element: <ForgotPasswordPage /> },
      { path: "/reset-password", element: <ResetPasswordPage /> },
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              { path: "/admin", element: <AdminDashboardPage /> },
              { path: "/admin/users", element: <AdminUsersPage /> },
              { path: "/admin/clients", element: <AdminClientsPage /> },
              { path: "/admin/projects", element: <AdminProjectsPage /> },
              { path: "/admin/invoices", element: <AdminInvoicesPage /> },
              { path: "/admin/time", element: <AdminTimeEntriesPage /> },
              { path: "/admin/rates", element: <AdminRatesPage /> },
              { path: "/admin/audit", element: <AdminAuditPage /> },
              { path: "/admin/hubspot", element: <AdminHubspotPage /> },
              { path: "/admin/activity", element: <AdminActivityLogPage /> },
            ],
          },
          {
            element: <AppLayout />,
            children: [
              { path: "/", element: <DashboardPage /> },
              { path: "/profile/edit", element: <EditProfilePage /> },
              { path: "/settings/2fa", element: <TwoFactorSetupPage /> },
              { path: "/time-tracker", element: <ClockifyPage /> },
              { path: "/hubspot", element: <HubspotPage /> },
              { path: "/clients", element: <ClientsPage /> },
              { path: "/clients/:id", element: <ClientDetailPage /> },
              { path: "/projects", element: <ProjectsPage /> },
              { path: "/projects/:id", element: <ProjectDetailPage /> },
              { path: "/time", element: <TimeEntriesPage /> },
              { path: "/invoices", element: <InvoicesPage /> },
              { path: "/invoices/:id", element: <InvoiceDetailPage /> },
              { path: "/rates", element: <RatesPage /> },
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
