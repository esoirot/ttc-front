import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useCurrentUser } from "../../hooks/useAuth";

export function ProtectedRoute() {
  const { isAuthenticated, loading } = useCurrentUser();
  const location = useLocation();

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen text-zinc-500">
        Loading…
      </div>
    );
  if (!isAuthenticated)
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname + location.search }}
        replace
      />
    );

  return <Outlet />;
}
