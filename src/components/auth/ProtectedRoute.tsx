import { Navigate, Outlet } from "react-router-dom";
import { useCurrentUser } from "../../hooks/useAuth";

export function ProtectedRoute() {
  const { isAuthenticated, loading } = useCurrentUser();

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen text-zinc-500">
        Loading…
      </div>
    );
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <Outlet />;
}
