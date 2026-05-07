import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "../components/auth/AuthLayout";
import { GoogleOAuthButton } from "../components/auth/GoogleOAuthButton";
import { useLogin } from "../hooks/useAuth";

export function LoginPage() {
  const navigate = useNavigate();
  const { login, loading, error } = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const result = await login(email, password);
    const data = result.data?.login;

    if (data?.requiresTwoFactor) {
      navigate("/2fa/verify", { state: { tempToken: data.tempToken } });
    } else if (data?.user) {
      navigate("/");
    }
  }

  return (
    <AuthLayout title="Sign in">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="email"
            className="text-sm font-medium text-zinc-900 dark:text-zinc-100"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-md text-base bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white outline-none focus:border-violet-500 transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="password"
            className="text-sm font-medium text-zinc-900 dark:text-zinc-100"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-md text-base bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white outline-none focus:border-violet-500 transition-colors"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error.message}</p>}

        <button
          type="submit"
          className="w-full px-5 py-2.5 bg-violet-600 text-white rounded-md text-base font-semibold cursor-pointer hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition-opacity"
          disabled={loading}
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <div className="flex items-center gap-3 my-4 text-xs text-zinc-400">
        <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700" />
        <span>or</span>
        <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700" />
      </div>

      <GoogleOAuthButton />

      <p className="text-sm text-center mt-4 text-zinc-500">
        No account?{" "}
        <Link
          to="/register"
          className="text-violet-600 dark:text-violet-400 font-medium no-underline hover:underline"
        >
          Register
        </Link>
      </p>
    </AuthLayout>
  );
}
