import { Link } from "react-router-dom";
import { useCurrentUser } from "../../hooks/useAuth";

export function DashboardPage() {
  const { user, loading } = useCurrentUser();

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="h-8 w-36 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse mb-6" />
        <div className="h-4 w-56 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-semibold tracking-tight mb-6 text-zinc-900 dark:text-white">
        Dashboard
      </h1>

      <p className="text-zinc-600 dark:text-zinc-400">
        Welcome back, {user?.name ?? user?.email}.
      </p>

      {!user?.twoFactorEnabled && (
        <div className="mt-6 p-4 flex flex-col gap-2 max-w-sm border border-violet-200 dark:border-violet-800 rounded-lg bg-violet-50 dark:bg-violet-950/40">
          <strong className="text-sm text-zinc-900 dark:text-white">
            Secure your account
          </strong>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Two-factor authentication is not enabled.
          </p>
          <Link
            to="/settings/2fa"
            className="self-start px-4 py-1.5 bg-violet-600 text-white rounded-md text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Enable 2FA
          </Link>
        </div>
      )}
    </div>
  );
}
