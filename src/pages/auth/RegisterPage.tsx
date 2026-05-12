import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "../../components/auth/AuthLayout";
import { GoogleOAuthButton } from "../../components/auth/GoogleOAuthButton";
import { useRegister } from "../../hooks/useAuth";

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function passwordStrength(p: string): 0 | 1 | 2 | 3 {
  if (p.length === 0) return 0;
  let score = 0;
  if (p.length >= 8) score++;
  if (p.length >= 12) score++;
  if (/[A-Z]/.test(p) && /[0-9]/.test(p)) score++;
  return Math.min(score, 3) as 0 | 1 | 2 | 3;
}

const strengthLabel = ["", "Weak", "Medium", "Strong"] as const;
const strengthColor = [
  "",
  "bg-red-500",
  "bg-yellow-400",
  "bg-emerald-500",
] as const;

export function RegisterPage() {
  const navigate = useNavigate();
  const { register, loading, error } = useRegister();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const emailError =
    emailTouched && !isValidEmail(email) ? "Enter a valid email address." : "";
  const passwordError =
    passwordTouched && password.length < 8
      ? "Password must be at least 8 characters."
      : "";

  const strength = passwordStrength(password);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const result = await register(email, password, name || undefined);
    if (result.data?.register?.id) {
      navigate("/");
    }
  }

  const inputCls = (hasError: boolean) =>
    `w-full px-3 py-2 border rounded-md text-base bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white outline-none transition-colors ${
      hasError
        ? "border-red-500 focus:border-red-500"
        : "border-zinc-200 dark:border-zinc-700 focus:border-violet-500"
    }`;

  return (
    <AuthLayout title="Create account">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="name"
            className="text-sm font-medium text-zinc-900 dark:text-zinc-100"
          >
            Name (optional)
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputCls(false)}
          />
        </div>

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
            onBlur={() => setEmailTouched(true)}
            className={inputCls(!!emailError)}
          />
          {emailError && (
            <p className="text-xs text-red-600 mt-0.5">{emailError}</p>
          )}
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
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setPasswordTouched(true)}
            className={inputCls(!!passwordError)}
          />
          {password.length > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <div className="flex gap-1 flex-1">
                {[1, 2, 3].map((level) => (
                  <div
                    key={level}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      strength >= level
                        ? strengthColor[strength]
                        : "bg-zinc-200 dark:bg-zinc-700"
                    }`}
                  />
                ))}
              </div>
              <span
                className={`text-xs font-medium ${
                  strength === 1
                    ? "text-red-500"
                    : strength === 2
                      ? "text-yellow-500"
                      : "text-emerald-500"
                }`}
              >
                {strengthLabel[strength]}
              </span>
            </div>
          )}
          {passwordError && (
            <p className="text-xs text-red-600 mt-0.5">{passwordError}</p>
          )}
        </div>

        {error && <p className="text-sm text-red-600">{error.message}</p>}

        <button
          type="submit"
          className="w-full px-5 py-2.5 bg-violet-600 text-white rounded-md text-base font-semibold cursor-pointer hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition-opacity"
          disabled={loading}
        >
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>

      <div className="flex items-center gap-3 my-4 text-xs text-zinc-400">
        <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700" />
        <span>or</span>
        <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700" />
      </div>

      <GoogleOAuthButton />

      <p className="text-sm text-center mt-4 text-zinc-500">
        Already have an account?{" "}
        <Link
          to="/login"
          className="text-violet-600 dark:text-violet-400 font-medium no-underline hover:underline"
        >
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
