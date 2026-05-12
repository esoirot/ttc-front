import { useState, type FormEvent } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { AuthLayout } from "../../components/auth/AuthLayout";
import { useVerifyTwoFactor } from "../../hooks/useAuth";

export function TwoFactorVerifyPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { tempToken?: string; from?: string } | null;
  const tempToken = state?.tempToken;
  const from = state?.from ?? "/";
  const { verifyTwoFactor, loading, error } = useVerifyTwoFactor();
  const [code, setCode] = useState("");

  if (!tempToken) return <Navigate to="/login" replace />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const result = await verifyTwoFactor(tempToken!, code);
    if (result.data?.verifyTwoFactor?.user) {
      navigate(from, { replace: true });
    }
  }

  return (
    <AuthLayout title="Two-factor authentication">
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
        Enter the 6-digit code from your authenticator app.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="code"
            className="text-sm font-medium text-zinc-900 dark:text-zinc-100"
          >
            Authenticator code
          </label>
          <input
            id="code"
            type="text"
            inputMode="numeric"
            pattern="\d{6}"
            maxLength={6}
            required
            autoComplete="one-time-code"
            placeholder="000000"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-md text-base bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white outline-none focus:border-violet-500 transition-colors"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error.message}</p>}

        <button
          type="submit"
          className="w-full px-5 py-2.5 bg-violet-600 text-white rounded-md text-base font-semibold cursor-pointer hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition-opacity"
          disabled={loading || code.length !== 6}
        >
          {loading ? "Verifying…" : "Verify"}
        </button>
      </form>
    </AuthLayout>
  );
}
