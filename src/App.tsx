import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AppLayout } from "./components/layout/AppLayout";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { TwoFactorVerifyPage } from "./pages/TwoFactorVerifyPage";
import { DashboardPage } from "./pages/DashboardPage";
import { TwoFactorSetupPage } from "./pages/TwoFactorSetupPage";
import { TimeTrackerPage } from "./pages/TimeTrackerPage";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/2fa/verify",
    element: <TwoFactorVerifyPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/", element: <DashboardPage /> },
          { path: "/settings/2fa", element: <TwoFactorSetupPage /> },
          { path: "/time-tracker", element: <TimeTrackerPage /> },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
