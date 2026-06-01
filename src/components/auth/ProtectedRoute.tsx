import { useEffect } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useCurrentUser } from "../../hooks/auth/useAuth";

export function ProtectedRoute() {
  const { isAuthenticated, loading, user } = useCurrentUser();
  // Only show loading spinner on initial check — not during 60s polls.
  // Polls keep previous data so isAuthenticated stays true; no flicker needed.
  const hasData = user !== null || !loading;
  const location = useLocation();
  const navigate = useNavigate();

  // Read-only during render — idempotent across re-renders; removal happens in effect
  const oauthRaw = isAuthenticated
    ? sessionStorage.getItem("oauth_from")
    : null;
  let pendingOAuthDest: string | null = null;
  if (oauthRaw) {
    try {
      const { dest, ts } = JSON.parse(oauthRaw) as { dest: string; ts: number };
      // eslint-disable-next-line react-hooks/purity
      const nowMs = Date.now();
      if (nowMs - ts < 60_000 && dest !== location.pathname + location.search) {
        pendingOAuthDest = dest;
      }
    } catch {
      /* malformed or legacy bare-string value — ignore */
    }
  }

  // Remove item and navigate in effect — safe for StrictMode / Concurrent Mode
  useEffect(() => {
    if (!isAuthenticated) return;
    const raw = sessionStorage.getItem("oauth_from");
    if (!raw) return;
    sessionStorage.removeItem("oauth_from");
    try {
      const { dest, ts } = JSON.parse(raw) as { dest: string; ts: number };
      if (
        Date.now() - ts < 60_000 &&
        dest !== location.pathname + location.search
      ) {
        navigate(dest, { replace: true });
      }
    } catch {
      /* malformed or legacy bare-string value — ignore */
    }
  }, [isAuthenticated, location.pathname, location.search, navigate]);

  if (!hasData)
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
  if (pendingOAuthDest) return null;
  return <Outlet />;
}
