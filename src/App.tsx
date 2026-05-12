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
import { DashboardPage } from "./pages/account/DashboardPage";
import { EditProfilePage } from "./pages/account/EditProfilePage";
import { TimeTrackerPage } from "./pages/integrations/TimeTrackerPage";
import { HubspotPage } from "./pages/integrations/HubspotPage";

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
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <AppLayout />,
            children: [
              { path: "/", element: <DashboardPage /> },
              { path: "/profile/edit", element: <EditProfilePage /> },
              { path: "/settings/2fa", element: <TwoFactorSetupPage /> },
              { path: "/time-tracker", element: <TimeTrackerPage /> },
              { path: "/hubspot", element: <HubspotPage /> },
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
